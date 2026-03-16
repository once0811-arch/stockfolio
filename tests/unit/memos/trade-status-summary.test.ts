import { describe, expect, it } from "vitest";

import { deriveTradeStatusSummary } from "@/src/server/memos/trade-status-summary";
import type { StoredMemo } from "@/src/server/memos/types";

describe("deriveTradeStatusSummary", () => {
  it("returns empty defaults when there is no memo linked to symbol", () => {
    const summary = deriveTradeStatusSummary("AAPL", []);

    expect(summary).toEqual({
      memo_status: "NONE",
      review_status: "UNRESOLVED",
      fact_check_status: "NOT_RUN",
    });
  });

  it("uses the latest memo status for summary fields", () => {
    const memos: StoredMemo[] = [
      {
        id: "m-1",
        symbol: "AAPL",
        tradeId: null,
        thesisText: "old",
        createdAt: "2026-03-16T10:00:00.000Z",
        updatedAt: "2026-03-16T10:00:00.000Z",
        status: "ACTIVE",
        reviewOutcome: "PARTIALLY_CORRECT",
        retrospectiveNote: null,
        factCheckStatus: "COMPLETED",
        citationCount: 1,
      },
      {
        id: "m-2",
        symbol: "AAPL",
        tradeId: null,
        thesisText: "latest",
        createdAt: "2026-03-17T10:00:00.000Z",
        updatedAt: "2026-03-17T10:00:00.000Z",
        status: "ACTIVE",
        reviewOutcome: "INCORRECT",
        retrospectiveNote: "failed thesis",
        factCheckStatus: "PENDING",
        citationCount: 0,
      },
    ];

    const summary = deriveTradeStatusSummary("AAPL", memos);

    expect(summary).toEqual({
      memo_status: "ATTACHED",
      review_status: "INCORRECT",
      fact_check_status: "PENDING",
    });
  });
});
