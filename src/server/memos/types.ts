export type MemoLifecycleStatus = "ACTIVE" | "ARCHIVED";

export type ReviewOutcome =
  | "UNRESOLVED"
  | "CORRECT"
  | "PARTIALLY_CORRECT"
  | "INCORRECT";

export type FactCheckStatus = "NOT_RUN" | "PENDING" | "COMPLETED";

export type StoredMemo = {
  id: string;
  symbol: string;
  tradeId: string | null;
  thesisText: string;
  createdAt: string;
  updatedAt: string;
  status: MemoLifecycleStatus;
  reviewOutcome: ReviewOutcome;
  retrospectiveNote: string | null;
  factCheckStatus: FactCheckStatus;
  citationCount: number;
};

export type TradeMemoStatus = "NONE" | "ATTACHED";

export type TradeReviewStatus = ReviewOutcome;

export type TradeFactCheckStatus = FactCheckStatus;

export type TradeStatusSummary = {
  memo_status: TradeMemoStatus;
  review_status: TradeReviewStatus;
  fact_check_status: TradeFactCheckStatus;
};
