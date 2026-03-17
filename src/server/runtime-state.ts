import type { StoredTrade } from "@/src/server/ledger/types";
import type { StoredMemo } from "@/src/server/memos/types";
import type { StoredGoalMetric } from "@/src/server/goals/types";
import type {
  StoredFactCheckRun,
  StoredSourceCitation,
} from "@/src/server/research/types";

type RuntimeState = {
  tradeLedger: StoredTrade[];
  hasSeededDemoPortfolio: boolean;
  memoLedger: StoredMemo[];
  goalMetrics: StoredGoalMetric[];
  factCheckRuns: StoredFactCheckRun[];
  sourceCitations: StoredSourceCitation[];
};

declare global {
  var __portfolioOpsRuntimeState: RuntimeState | undefined;
}

function createRuntimeState(): RuntimeState {
  return {
    tradeLedger: [],
    hasSeededDemoPortfolio: false,
    memoLedger: [],
    goalMetrics: [],
    factCheckRuns: [],
    sourceCitations: [],
  };
}

export function getRuntimeState(): RuntimeState {
  if (!globalThis.__portfolioOpsRuntimeState) {
    globalThis.__portfolioOpsRuntimeState = createRuntimeState();
  }

  return globalThis.__portfolioOpsRuntimeState;
}
