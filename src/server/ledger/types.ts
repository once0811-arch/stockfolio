export type StoredTradeSide = "BUY" | "SELL";

export type StoredTrade = {
  id: string;
  asset: {
    symbol: string;
    market: string;
    currency: string;
  };
  side: StoredTradeSide;
  quantity: number;
  priceOriginal: number;
  feeOriginal: number;
  tradeDate: string;
  settlementDate: string;
  fxRateToKrw: number;
};

export type PositionSummary = {
  symbol: string;
  market: string;
  currency: string;
  openQuantity: number;
  averageCostOriginal: number;
  remainingCostOriginal: number;
  realizedPnlOriginal: number;
  unrealizedPnlOriginal: number;
};
