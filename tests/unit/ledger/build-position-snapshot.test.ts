import { describe, expect, it } from "vitest";

import { buildPositionSnapshot } from "@/src/domain/ledger/build-position-snapshot";

describe("buildPositionSnapshot", () => {
  it("combines realized and unrealized pnl from ledger and market price", () => {
    const snapshot = buildPositionSnapshot({
      trades: [
        {
          id: "t1",
          side: "BUY",
          quantity: 10,
          priceOriginal: 100,
          feeOriginal: 1,
          currency: "USD",
          tradeDate: "2026-01-02T00:00:00.000Z",
          settlementDate: "2026-01-04T00:00:00.000Z",
          fxRateToKrw: 1300,
        },
        {
          id: "t2",
          side: "BUY",
          quantity: 5,
          priceOriginal: 120,
          feeOriginal: 1,
          currency: "USD",
          tradeDate: "2026-01-10T00:00:00.000Z",
          settlementDate: "2026-01-12T00:00:00.000Z",
          fxRateToKrw: 1310,
        },
        {
          id: "t3",
          side: "SELL",
          quantity: 8,
          priceOriginal: 130,
          feeOriginal: 1,
          currency: "USD",
          tradeDate: "2026-02-01T00:00:00.000Z",
          settlementDate: "2026-02-03T00:00:00.000Z",
          fxRateToKrw: 1320,
        },
      ],
      marketPriceOriginal: 110,
    });

    expect(snapshot.openQuantity).toBe(7);
    expect(snapshot.realizedPnlOriginal).toBe(184.6);
    expect(snapshot.unrealizedPnlOriginal).toBe(22.4);
  });
});
