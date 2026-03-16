import { describe, expect, it } from "vitest";

import { mergeQuickTradeWithDefaults } from "@/src/server/ledger/quick-trade-defaults";

describe("mergeQuickTradeWithDefaults", () => {
  it("fills advanced defaults while keeping quick input values", () => {
    const merged = mergeQuickTradeWithDefaults({
      symbol: "aapl",
      side: "BUY",
      quantity: 3,
      priceOriginal: 180,
      tradeDate: "2026-03-16",
    });

    expect(merged).toEqual({
      symbol: "AAPL",
      market: "NASDAQ",
      currency: "USD",
      side: "BUY",
      quantity: 3,
      priceOriginal: 180,
      feeOriginal: 0,
      tradeDate: "2026-03-16",
      settlementDate: "2026-03-16",
      fxRateToKrw: 1300,
    });
  });

  it("uses explicit advanced overrides when provided", () => {
    const merged = mergeQuickTradeWithDefaults(
      {
        symbol: "tsla",
        side: "SELL",
        quantity: 1,
        priceOriginal: 250,
        tradeDate: "2026-03-18",
      },
      {
        market: "NYSE",
        currency: "USD",
        feeOriginal: 2.5,
        settlementDate: "2026-03-20",
        fxRateToKrw: 1324.4,
      },
    );

    expect(merged.market).toBe("NYSE");
    expect(merged.feeOriginal).toBe(2.5);
    expect(merged.settlementDate).toBe("2026-03-20");
    expect(merged.fxRateToKrw).toBe(1324.4);
  });
});
