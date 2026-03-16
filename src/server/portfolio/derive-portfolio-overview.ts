import { buildPositionsFromTrades } from "@/src/server/ledger/positions-from-trades";
import type { StoredTrade } from "@/src/server/ledger/types";
import type { StoredMemo } from "@/src/server/memos/types";

export type PortfolioHolding = {
  symbol: string;
  currency: string;
  openQuantity: number;
  averageCostOriginal: number;
  marketPriceOriginal: number;
  currentValueOriginal: number;
  realizedPnlOriginal: number;
  unrealizedPnlOriginal: number;
  unrealizedPnlRatePct: number;
  estimateValueKrw: number;
  estimateRealizedKrw: number;
  estimateUnrealizedKrw: number;
  weight: number;
};

export type PortfolioAction = {
  id: "add-trade" | "fact-check" | "concentration" | "memo-review";
  label: string;
  reason: string;
  href: string;
  severity: "high" | "medium" | "low";
};

export type PortfolioOverview = {
  holdings: PortfolioHolding[];
  totals: {
    estimateAssetKrw: number;
    estimateRealizedKrw: number;
    estimateUnrealizedKrw: number;
    estimateYtdKrw: number;
  };
  header: {
    latestUsdKrw: number | null;
    unresolvedMemoCount: number;
  };
  risk: {
    topWeightPct: number;
    isConcentrated: boolean;
    concentratedSymbols: string[];
  };
  actions: PortfolioAction[];
};

type Input = {
  trades: StoredTrade[];
  memos: StoredMemo[];
  marketPricesBySymbol: Record<string, number>;
};

function round(value: number, digits = 2): number {
  return Number(value.toFixed(digits));
}

function getLatestFxBySymbol(trades: StoredTrade[]): Map<string, number> {
  const fxBySymbol = new Map<string, { date: string; fx: number }>();

  for (const trade of trades) {
    const current = fxBySymbol.get(trade.asset.symbol);
    if (!current || trade.settlementDate > current.date) {
      fxBySymbol.set(trade.asset.symbol, {
        date: trade.settlementDate,
        fx: trade.fxRateToKrw,
      });
    }
  }

  return new Map(
    [...fxBySymbol.entries()].map(([symbol, value]) => [symbol, value.fx]),
  );
}

function getLatestUsdKrw(trades: StoredTrade[]): number | null {
  const usdTrades = trades
    .filter((trade) => trade.asset.currency === "USD")
    .sort((a, b) => b.settlementDate.localeCompare(a.settlementDate));

  return usdTrades[0]?.fxRateToKrw ?? null;
}

function buildActions(input: {
  trades: StoredTrade[];
  unresolvedMemoCount: number;
  risk: PortfolioOverview["risk"];
}): PortfolioAction[] {
  const actions: PortfolioAction[] = [];

  if (input.trades.length === 0) {
    actions.push({
      id: "add-trade",
      label: "첫 거래 입력",
      reason: "포트폴리오 계산은 원장 거래가 있어야 시작됩니다.",
      href: "/transactions",
      severity: "high",
    });
    return actions;
  }

  if (input.unresolvedMemoCount > 0) {
    actions.push({
      id: "fact-check",
      label: "검증 대기 메모 처리",
      reason: `${input.unresolvedMemoCount}건이 아직 fact-check 되지 않았습니다.`,
      href: "/research",
      severity: "high",
    });
  }

  if (input.risk.isConcentrated) {
    actions.push({
      id: "concentration",
      label: "비중 집중 점검",
      reason: `상위 보유종목 비중이 ${input.risk.topWeightPct.toFixed(1)}%로 높습니다.`,
      href: "/dashboard",
      severity: "medium",
    });
  }

  actions.push({
    id: "memo-review",
    label: "거래 메모 회고 갱신",
    reason: "거래 맥락과 회고 결과를 함께 유지하면 검증 품질이 올라갑니다.",
    href: "/transactions",
    severity: "low",
  });

  return actions.slice(0, 3);
}

export function derivePortfolioOverview(input: Input): PortfolioOverview {
  const positions = buildPositionsFromTrades(
    input.trades,
    input.marketPricesBySymbol,
  ).filter((position) => position.openQuantity > 0);
  const fxBySymbol = getLatestFxBySymbol(input.trades);

  const holdingBase = positions.map((position) => {
    const fxRate = fxBySymbol.get(position.symbol) ?? 1;
    const estimateValueKrw = position.currentValueOriginal * fxRate;
    const estimateRealizedKrw = position.realizedPnlOriginal * fxRate;
    const estimateUnrealizedKrw = position.unrealizedPnlOriginal * fxRate;

    return {
      symbol: position.symbol,
      currency: position.currency,
      openQuantity: position.openQuantity,
      averageCostOriginal: position.averageCostOriginal,
      marketPriceOriginal: position.marketPriceOriginal,
      currentValueOriginal: position.currentValueOriginal,
      realizedPnlOriginal: position.realizedPnlOriginal,
      unrealizedPnlOriginal: position.unrealizedPnlOriginal,
      unrealizedPnlRatePct: position.unrealizedPnlRatePct,
      estimateValueKrw,
      estimateRealizedKrw,
      estimateUnrealizedKrw,
    };
  });

  const estimateAssetKrw = holdingBase.reduce(
    (sum, item) => sum + item.estimateValueKrw,
    0,
  );
  const estimateRealizedKrw = holdingBase.reduce(
    (sum, item) => sum + item.estimateRealizedKrw,
    0,
  );
  const estimateUnrealizedKrw = holdingBase.reduce(
    (sum, item) => sum + item.estimateUnrealizedKrw,
    0,
  );

  const holdings: PortfolioHolding[] = holdingBase
    .map((item) => ({
      ...item,
      weight:
        estimateAssetKrw > 0 ? Math.max(0, item.estimateValueKrw) / estimateAssetKrw : 0,
    }))
    .sort((a, b) => b.estimateValueKrw - a.estimateValueKrw);

  const topWeightPct = round((holdings[0]?.weight ?? 0) * 100, 1);
  const risk = {
    topWeightPct,
    isConcentrated: topWeightPct >= 55,
    concentratedSymbols: holdings
      .filter((item) => item.weight >= 0.25)
      .map((item) => item.symbol),
  };
  const unresolvedMemoCount = input.memos.filter(
    (memo) => memo.factCheckStatus !== "COMPLETED",
  ).length;

  return {
    holdings,
    totals: {
      estimateAssetKrw: round(estimateAssetKrw, 0),
      estimateRealizedKrw: round(estimateRealizedKrw, 0),
      estimateUnrealizedKrw: round(estimateUnrealizedKrw, 0),
      estimateYtdKrw: round(estimateRealizedKrw + estimateUnrealizedKrw, 0),
    },
    header: {
      latestUsdKrw: getLatestUsdKrw(input.trades),
      unresolvedMemoCount,
    },
    risk,
    actions: buildActions({
      trades: input.trades,
      unresolvedMemoCount,
      risk,
    }),
  };
}
