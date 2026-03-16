import type { StoredMemo, TradeStatusSummary } from "@/src/server/memos/types";

const emptySummary: TradeStatusSummary = {
  memo_status: "NONE",
  review_status: "UNRESOLVED",
  fact_check_status: "NOT_RUN",
};

export function deriveTradeStatusSummary(
  symbol: string,
  memos: StoredMemo[],
): TradeStatusSummary {
  const upperSymbol = symbol.toUpperCase();
  const linked = memos.filter((memo) => memo.symbol === upperSymbol);

  if (linked.length === 0) {
    return emptySummary;
  }

  const latest = [...linked].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

  return {
    memo_status: "ATTACHED",
    review_status: latest.reviewOutcome,
    fact_check_status: latest.factCheckStatus,
  };
}
