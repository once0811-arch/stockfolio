type UnrealizedPnlInput = {
  openQuantity: number;
  averageCostOriginal: number;
  marketPriceOriginal: number;
};

export function calculateUnrealizedPnlOriginal(
  input: UnrealizedPnlInput,
): number {
  if (input.openQuantity === 0) {
    return 0;
  }

  const unrealized =
    input.openQuantity * (input.marketPriceOriginal - input.averageCostOriginal);
  return Number(unrealized.toFixed(8));
}
