import { buildPositionSnapshot } from "@/src/domain/ledger/build-position-snapshot";
import type { LedgerTrade } from "@/src/domain/ledger/types";
import type { PositionSummary, StoredTrade } from "@/src/server/ledger/types";

function round(value: number, digits = 8): number {
  return Number(value.toFixed(digits));
}

function truncateTowardZero(value: number, digits = 2): number {
  const unit = 10 ** digits;
  if (value >= 0) {
    return Math.floor(value * unit) / unit;
  }
  return Math.ceil(value * unit) / unit;
}

function toLedgerTrade(trade: StoredTrade): LedgerTrade {
  return {
    id: trade.id,
    side: trade.side,
    quantity: trade.quantity,
    priceOriginal: trade.priceOriginal,
    feeOriginal: trade.feeOriginal,
    currency: trade.asset.currency,
    tradeDate: new Date(`${trade.tradeDate}T00:00:00.000Z`).toISOString(),
    settlementDate: new Date(
      `${trade.settlementDate}T00:00:00.000Z`,
    ).toISOString(),
    fxRateToKrw: trade.fxRateToKrw,
  };
}

export function buildPositionsFromTrades(
  trades: StoredTrade[],
  marketPricesBySymbol: Record<string, number> = {},
): PositionSummary[] {
  const grouped = new Map<string, StoredTrade[]>();

  for (const trade of trades) {
    const key = `${trade.asset.market}:${trade.asset.symbol}`;
    const list = grouped.get(key) ?? [];
    list.push(trade);
    grouped.set(key, list);
  }

  const positions: PositionSummary[] = [];

  for (const [, groupTrades] of grouped) {
    const sorted = [...groupTrades].sort((a, b) =>
      a.settlementDate.localeCompare(b.settlementDate),
    );
    const latest = sorted[sorted.length - 1];
    const marketPriceOriginal =
      marketPricesBySymbol[latest.asset.symbol] ?? latest.priceOriginal;
    const snapshot = buildPositionSnapshot({
      trades: sorted.map(toLedgerTrade),
      marketPriceOriginal,
    });
    const currentValueOriginal = round(snapshot.openQuantity * marketPriceOriginal);
    const unrealizedPnlRatePct =
      snapshot.remainingCostOriginal === 0
        ? 0
        : truncateTowardZero(
            (snapshot.unrealizedPnlOriginal / snapshot.remainingCostOriginal) * 100,
            2,
          );

    positions.push({
      symbol: latest.asset.symbol,
      market: latest.asset.market,
      currency: latest.asset.currency,
      openQuantity: snapshot.openQuantity,
      averageCostOriginal: snapshot.averageCostOriginal,
      remainingCostOriginal: snapshot.remainingCostOriginal,
      marketPriceOriginal,
      currentValueOriginal,
      realizedPnlOriginal: snapshot.realizedPnlOriginal,
      unrealizedPnlOriginal: snapshot.unrealizedPnlOriginal,
      unrealizedPnlRatePct,
    });
  }

  return positions.sort((a, b) => a.symbol.localeCompare(b.symbol));
}
