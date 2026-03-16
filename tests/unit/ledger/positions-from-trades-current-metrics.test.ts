import { describe, expect, it } from "vitest";

import { buildPositionsFromTrades } from "@/src/server/ledger/positions-from-trades";

describe("buildPositionsFromTrades current metrics", () => {
  it("includes current value and unrealized pnl rate", () => {
    const positions = buildPositionsFromTrades(
      [
        {
          id: "a-1",
          asset: { symbol: "AAPL", market: "NASDAQ", currency: "USD" },
          side: "BUY",
          quantity: 10,
          priceOriginal: 100,
          feeOriginal: 0,
          tradeDate: "2026-03-01",
          settlementDate: "2026-03-03",
          fxRateToKrw: 1300,
        },
      ],
      { AAPL: 110 },
    );

    expect(positions[0]?.currentValueOriginal).toBe(1100);
    expect(positions[0]?.unrealizedPnlOriginal).toBe(100);
    expect(positions[0]?.unrealizedPnlRatePct.toFixed(2)).toBe("10.00");
  });
});
