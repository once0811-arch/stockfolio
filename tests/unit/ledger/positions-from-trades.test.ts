import { describe, expect, it } from "vitest";

import { buildPositionsFromTrades } from "@/src/server/ledger/positions-from-trades";

describe("buildPositionsFromTrades", () => {
  it("aggregates open quantity and pnl per asset symbol", () => {
    const positions = buildPositionsFromTrades([
      {
        id: "t1",
        asset: { symbol: "AAPL", market: "NASDAQ", currency: "USD" },
        side: "BUY",
        quantity: 10,
        priceOriginal: 100,
        feeOriginal: 1,
        tradeDate: "2026-03-01",
        settlementDate: "2026-03-03",
        fxRateToKrw: 1320,
      },
      {
        id: "t2",
        asset: { symbol: "AAPL", market: "NASDAQ", currency: "USD" },
        side: "SELL",
        quantity: 4,
        priceOriginal: 120,
        feeOriginal: 1,
        tradeDate: "2026-03-04",
        settlementDate: "2026-03-06",
        fxRateToKrw: 1325,
      },
      {
        id: "t3",
        asset: { symbol: "MSFT", market: "NASDAQ", currency: "USD" },
        side: "BUY",
        quantity: 5,
        priceOriginal: 50,
        feeOriginal: 0,
        tradeDate: "2026-03-07",
        settlementDate: "2026-03-09",
        fxRateToKrw: 1322,
      },
    ]);

    expect(positions).toHaveLength(2);

    const aapl = positions.find((position) => position.symbol === "AAPL");
    const msft = positions.find((position) => position.symbol === "MSFT");

    expect(aapl).toBeDefined();
    expect(aapl?.openQuantity).toBe(6);
    expect(aapl?.realizedPnlOriginal).toBe(78.6);

    expect(msft).toBeDefined();
    expect(msft?.openQuantity).toBe(5);
    expect(msft?.realizedPnlOriginal).toBe(0);
  });
});
