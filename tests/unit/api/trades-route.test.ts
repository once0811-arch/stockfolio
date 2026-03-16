import { describe, expect, it } from "vitest";

import { clearLedgerForTests } from "@/src/server/ledger/in-memory-ledger";
import { GET, POST } from "@/app/api/trades/route";

describe("/api/trades", () => {
  it("creates and lists trades", async () => {
    clearLedgerForTests();

    const createResponse = await POST(
      new Request("http://localhost/api/trades", {
        method: "POST",
        body: JSON.stringify({
          id: "r-1",
          symbol: "AAPL",
          market: "NASDAQ",
          currency: "USD",
          side: "BUY",
          quantity: 10,
          priceOriginal: 100,
          feeOriginal: 1,
          tradeDate: "2026-03-01",
          settlementDate: "2026-03-03",
          fxRateToKrw: 1320,
        }),
      }),
    );

    expect(createResponse.status).toBe(201);

    const listResponse = await GET();
    const payload = (await listResponse.json()) as {
      trades: Array<{ id: string }>;
    };

    expect(listResponse.status).toBe(200);
    expect(payload.trades).toHaveLength(1);
    expect(payload.trades[0]?.id).toBe("r-1");
  });

  it("returns 409 for duplicated id", async () => {
    clearLedgerForTests();

    const body = JSON.stringify({
      id: "dup-api",
      symbol: "AAPL",
      market: "NASDAQ",
      currency: "USD",
      side: "BUY",
      quantity: 1,
      priceOriginal: 100,
      feeOriginal: 0,
      tradeDate: "2026-03-01",
      settlementDate: "2026-03-03",
      fxRateToKrw: 1320,
    });

    await POST(
      new Request("http://localhost/api/trades", {
        method: "POST",
        body,
      }),
    );
    const duplicated = await POST(
      new Request("http://localhost/api/trades", {
        method: "POST",
        body,
      }),
    );

    expect(duplicated.status).toBe(409);
  });
});
