import type { StoredTrade } from "@/src/server/ledger/types";
import type { StoredMemo } from "@/src/server/memos/types";

type RuntimeState = {
  tradeLedger: StoredTrade[];
  hasSeededDemoPortfolio: boolean;
  memoLedger: StoredMemo[];
};

declare global {
  var __portfolioOpsRuntimeState: RuntimeState | undefined;
}

function createRuntimeState(): RuntimeState {
  return {
    tradeLedger: [],
    hasSeededDemoPortfolio: false,
    memoLedger: [],
  };
}

export function getRuntimeState(): RuntimeState {
  if (!globalThis.__portfolioOpsRuntimeState) {
    globalThis.__portfolioOpsRuntimeState = createRuntimeState();
  }

  return globalThis.__portfolioOpsRuntimeState;
}
