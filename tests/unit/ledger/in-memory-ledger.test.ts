import { describe, expect, it } from "vitest";

import {
  appendTrade,
  clearLedgerForTests,
  listTrades,
} from "@/src/server/ledger/in-memory-ledger";

describe("in-memory ledger", () => {
  it("appends immutable manual trades and lists them in insertion order", async () => {
    await clearLedgerForTests();

    const first = await appendTrade({
      id: "trade-1",
      asset: { symbol: "AAPL", market: "NASDAQ", currency: "USD" },
      side: "BUY",
      quantity: 10,
      priceOriginal: 100,
      feeOriginal: 1,
      tradeDate: "2026-03-01",
      settlementDate: "2026-03-03",
      fxRateToKrw: 1320,
    });
    const second = await appendTrade({
      id: "trade-2",
      asset: { symbol: "AAPL", market: "NASDAQ", currency: "USD" },
      side: "SELL",
      quantity: 4,
      priceOriginal: 120,
      feeOriginal: 1,
      tradeDate: "2026-03-04",
      settlementDate: "2026-03-06",
      fxRateToKrw: 1325,
    });

    const trades = await listTrades();

    expect(trades).toHaveLength(2);
    expect(trades[0]).toEqual(first);
    expect(trades[1]).toEqual(second);
  });

  it("throws on duplicate trade id", async () => {
    await clearLedgerForTests();

    await appendTrade({
      id: "dup-1",
      asset: { symbol: "TSLA", market: "NASDAQ", currency: "USD" },
      side: "BUY",
      quantity: 1,
      priceOriginal: 200,
      feeOriginal: 0,
      tradeDate: "2026-03-01",
      settlementDate: "2026-03-03",
      fxRateToKrw: 1320,
    });

    await expect(
      appendTrade({
        id: "dup-1",
        asset: { symbol: "TSLA", market: "NASDAQ", currency: "USD" },
        side: "BUY",
        quantity: 1,
        priceOriginal: 200,
        feeOriginal: 0,
        tradeDate: "2026-03-01",
        settlementDate: "2026-03-03",
        fxRateToKrw: 1320,
      }),
    ).rejects.toThrowError("Trade id already exists");
  });
});
