import { describe, expect, it } from "vitest";

import { derivePortfolioOverview } from "@/src/server/portfolio/derive-portfolio-overview";
import type { StoredTrade } from "@/src/server/ledger/types";
import type { StoredMemo } from "@/src/server/memos/types";

const TRADES: StoredTrade[] = [
  {
    id: "t-1",
    asset: { symbol: "AAA", market: "NASDAQ", currency: "USD" },
    side: "BUY",
    quantity: 20,
    priceOriginal: 100,
    feeOriginal: 0,
    tradeDate: "2026-03-01",
    settlementDate: "2026-03-01",
    fxRateToKrw: 1300,
  },
  {
    id: "t-2",
    asset: { symbol: "BBB", market: "NASDAQ", currency: "USD" },
    side: "BUY",
    quantity: 10,
    priceOriginal: 100,
    feeOriginal: 0,
    tradeDate: "2026-03-10",
    settlementDate: "2026-03-10",
    fxRateToKrw: 1320,
  },
];

const MEMOS: StoredMemo[] = [
  {
    id: "m-1",
    symbol: "AAA",
    tradeId: "t-1",
    thesisText: "성장 지속",
    createdAt: "2026-03-11T00:00:00.000Z",
    updatedAt: "2026-03-11T00:00:00.000Z",
    status: "ACTIVE",
    reviewOutcome: "UNRESOLVED",
    retrospectiveNote: null,
    factCheckStatus: "NOT_RUN",
    citationCount: 0,
  },
];

describe("derivePortfolioOverview", () => {
  it("builds holdings, totals, risk and action queue from trades/memos", () => {
    const result = derivePortfolioOverview({
      trades: TRADES,
      memos: MEMOS,
      marketPricesBySymbol: {
        AAA: 120,
        BBB: 95,
      },
    });

    expect(result.holdings).toHaveLength(2);
    expect(result.totals.estimateAssetKrw).toBe(4374000);
    expect(result.header.latestUsdKrw).toBe(1320);
    expect(result.risk.isConcentrated).toBe(true);
    expect(result.risk.topWeightPct).toBeGreaterThan(65);
    expect(result.actions.some((item) => item.id === "fact-check")).toBe(true);
  });

  it("returns intake-first actions when no trades exist", () => {
    const result = derivePortfolioOverview({
      trades: [],
      memos: [],
      marketPricesBySymbol: {},
    });

    expect(result.holdings).toHaveLength(0);
    expect(result.totals.estimateAssetKrw).toBe(0);
    expect(result.actions[0]?.id).toBe("add-trade");
  });
});
