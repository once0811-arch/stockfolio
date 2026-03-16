export type LedgerTradeSide = "BUY" | "SELL";

export type LedgerTrade = {
  id: string;
  side: LedgerTradeSide;
  quantity: number;
  priceOriginal: number;
  feeOriginal: number;
  currency: string;
  tradeDate: string;
  settlementDate: string;
  fxRateToKrw: number;
};

export type PositionReconstruction = {
  openQuantity: number;
  averageCostOriginal: number;
  remainingCostOriginal: number;
  realizedPnlOriginal: number;
};
