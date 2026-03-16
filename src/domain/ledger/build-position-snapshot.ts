import { calculateUnrealizedPnlOriginal } from "@/src/domain/calculations/unrealized-pnl";
import { reconstructPositionFromLedger } from "@/src/domain/ledger/reconstruct-position";
import type { LedgerTrade } from "@/src/domain/ledger/types";

type BuildPositionSnapshotInput = {
  trades: LedgerTrade[];
  marketPriceOriginal: number;
};

type PositionSnapshot = {
  openQuantity: number;
  averageCostOriginal: number;
  remainingCostOriginal: number;
  realizedPnlOriginal: number;
  unrealizedPnlOriginal: number;
};

export function buildPositionSnapshot(
  input: BuildPositionSnapshotInput,
): PositionSnapshot {
  const reconstructed = reconstructPositionFromLedger(input.trades);
  const unrealizedPnlOriginal = calculateUnrealizedPnlOriginal({
    openQuantity: reconstructed.openQuantity,
    averageCostOriginal: reconstructed.averageCostOriginal,
    marketPriceOriginal: input.marketPriceOriginal,
  });

  return {
    ...reconstructed,
    unrealizedPnlOriginal,
  };
}
