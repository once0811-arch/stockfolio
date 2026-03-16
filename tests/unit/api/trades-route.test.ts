import { describe, expect, it } from "vitest";

import { clearLedgerForTests } from "@/src/server/ledger/in-memory-ledger";
import { clearMemosForTests } from "@/src/server/memos/in-memory-memos";
import { POST as createMemo } from "@/app/api/memos/route";
import { GET, POST } from "@/app/api/trades/route";

describe("/api/trades", () => {
  it("creates and lists trades", async () => {
    await clearLedgerForTests();
    await clearMemosForTests();

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
      trades: Array<{
        id: string;
        memo_status: string;
        review_status: string;
        fact_check_status: string;
      }>;
    };

    expect(listResponse.status).toBe(200);
    expect(payload.trades).toHaveLength(1);
    expect(payload.trades[0]?.id).toBe("r-1");
    expect(payload.trades[0]?.memo_status).toBe("NONE");
    expect(payload.trades[0]?.review_status).toBe("UNRESOLVED");
    expect(payload.trades[0]?.fact_check_status).toBe("NOT_RUN");
  });

  it("returns 409 for duplicated id", async () => {
    await clearLedgerForTests();
    await clearMemosForTests();

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

  it("injects memo/review/fact-check status per symbol", async () => {
    await clearLedgerForTests();
    await clearMemosForTests();

    await POST(
      new Request("http://localhost/api/trades", {
        method: "POST",
        body: JSON.stringify({
          id: "memo-linked-1",
          symbol: "TSLA",
          market: "NASDAQ",
          currency: "USD",
          side: "BUY",
          quantity: 2,
          priceOriginal: 200,
          feeOriginal: 1,
          tradeDate: "2026-03-01",
          settlementDate: "2026-03-03",
          fxRateToKrw: 1320,
        }),
      }),
    );

    const memoResponse = await createMemo(
      new Request("http://localhost/api/memos", {
        method: "POST",
        body: JSON.stringify({
          symbol: "TSLA",
          thesisText: "마진 개선",
          reviewOutcome: "CORRECT",
          factCheckStatus: "COMPLETED",
        }),
      }),
    );
    expect(memoResponse.status).toBe(201);

    const listResponse = await GET();
    const payload = (await listResponse.json()) as {
      trades: Array<{
        id: string;
        memo_status: string;
        review_status: string;
        fact_check_status: string;
      }>;
    };
    const trade = payload.trades.find((item) => item.id === "memo-linked-1");

    expect(trade?.memo_status).toBe("ATTACHED");
    expect(trade?.review_status).toBe("CORRECT");
    expect(trade?.fact_check_status).toBe("COMPLETED");
  });
});
