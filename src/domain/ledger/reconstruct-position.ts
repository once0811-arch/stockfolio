import type { LedgerTrade, PositionReconstruction } from "@/src/domain/ledger/types";

function round(value: number, digits = 8): number {
  return Number(value.toFixed(digits));
}

export function reconstructPositionFromLedger(
  trades: LedgerTrade[],
): PositionReconstruction {
  let openQuantity = 0;
  let remainingCostOriginal = 0;
  let averageCostOriginal = 0;
  let realizedPnlOriginal = 0;

  for (const trade of trades) {
    if (trade.quantity <= 0) {
      throw new Error("Quantity must be positive");
    }

    if (trade.side === "BUY") {
      const buyCost = trade.quantity * trade.priceOriginal + trade.feeOriginal;
      openQuantity = round(openQuantity + trade.quantity);
      remainingCostOriginal = round(remainingCostOriginal + buyCost);
      averageCostOriginal =
        openQuantity === 0 ? 0 : round(remainingCostOriginal / openQuantity);
      continue;
    }

    if (trade.quantity > openQuantity) {
      throw new Error("Sell quantity exceeds open position");
    }

    const acquisitionCostForSold = round(averageCostOriginal * trade.quantity);
    const sellProceeds = round(trade.quantity * trade.priceOriginal - trade.feeOriginal);
    realizedPnlOriginal = round(
      realizedPnlOriginal + (sellProceeds - acquisitionCostForSold),
    );

    openQuantity = round(openQuantity - trade.quantity);
    remainingCostOriginal = round(remainingCostOriginal - acquisitionCostForSold);
    averageCostOriginal =
      openQuantity === 0 ? 0 : round(remainingCostOriginal / openQuantity);
  }

  return {
    openQuantity,
    averageCostOriginal,
    remainingCostOriginal,
    realizedPnlOriginal,
  };
}
