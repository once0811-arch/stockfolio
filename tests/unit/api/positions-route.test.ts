import { describe, expect, it } from "vitest";

import { GET } from "@/app/api/positions/route";
import {
  appendTrade,
  clearLedgerForTests,
} from "@/src/server/ledger/in-memory-ledger";

describe("/api/positions", () => {
  it("aggregates positions from current ledger trades", async () => {
    clearLedgerForTests();
    appendTrade({
      id: "p-1",
      asset: { symbol: "AAPL", market: "NASDAQ", currency: "USD" },
      side: "BUY",
      quantity: 10,
      priceOriginal: 100,
      feeOriginal: 1,
      tradeDate: "2026-03-01",
      settlementDate: "2026-03-03",
      fxRateToKrw: 1320,
    });
    appendTrade({
      id: "p-2",
      asset: { symbol: "AAPL", market: "NASDAQ", currency: "USD" },
      side: "SELL",
      quantity: 4,
      priceOriginal: 120,
      feeOriginal: 1,
      tradeDate: "2026-03-04",
      settlementDate: "2026-03-06",
      fxRateToKrw: 1321,
    });

    const response = await GET();
    const payload = (await response.json()) as {
      positions: Array<{
        symbol: string;
        openQuantity: number;
      }>;
    };

    expect(response.status).toBe(200);
    expect(payload.positions).toHaveLength(1);
    expect(payload.positions[0]?.symbol).toBe("AAPL");
    expect(payload.positions[0]?.openQuantity).toBe(6);
  });
});
