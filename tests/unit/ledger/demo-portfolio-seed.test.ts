import { describe, expect, it } from "vitest";

import {
  clearLedgerForTests,
  listTrades,
} from "@/src/server/ledger/in-memory-ledger";

describe("demo portfolio seed", () => {
  it("seeds four holdings outside test mode helper call", async () => {
    await clearLedgerForTests();

    const trades = await listTrades({ includeDemoSeedInTests: true });
    const symbols = trades.map((trade) => trade.asset.symbol).sort();

    expect(symbols).toEqual(["INTC", "IONQ", "POET", "TSLA"]);
    expect(trades.find((trade) => trade.asset.symbol === "IONQ")?.quantity).toBe(
      115.606152,
    );
  });
});
