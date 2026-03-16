import type { StoredTrade } from "@/src/server/ledger/types";

type DemoHolding = {
  symbol: string;
  market: string;
  currency: string;
  quantity: number;
  currentValueOriginal: number;
  unrealizedPnlOriginal: number;
};

const DEMO_HOLDINGS: DemoHolding[] = [
  {
    symbol: "IONQ",
    market: "NYSE",
    currency: "USD",
    quantity: 115.606152,
    currentValueOriginal: 3866.87,
    unrealizedPnlOriginal: -143.08,
  },
  {
    symbol: "POET",
    market: "NASDAQ",
    currency: "USD",
    quantity: 386.976336,
    currentValueOriginal: 2699.69,
    unrealizedPnlOriginal: 12.13,
  },
  {
    symbol: "TSLA",
    market: "NASDAQ",
    currency: "USD",
    quantity: 3.698249,
    currentValueOriginal: 1485.84,
    unrealizedPnlOriginal: -77.32,
  },
  {
    symbol: "INTC",
    market: "NASDAQ",
    currency: "USD",
    quantity: 25.731648,
    currentValueOriginal: 1228.47,
    unrealizedPnlOriginal: 90.63,
  },
];

function round(value: number, digits = 8): number {
  return Number(value.toFixed(digits));
}

function getCurrentPriceOriginal(holding: DemoHolding): number {
  return round(holding.currentValueOriginal / holding.quantity);
}

function getAverageCostOriginal(holding: DemoHolding): number {
  const acquisitionCost =
    holding.currentValueOriginal - holding.unrealizedPnlOriginal;
  return round(acquisitionCost / holding.quantity);
}

export function getDemoPortfolioTrades(): StoredTrade[] {
  return DEMO_HOLDINGS.map((holding, index) => ({
    id: `demo-${holding.symbol}-${index + 1}`,
    asset: {
      symbol: holding.symbol,
      market: holding.market,
      currency: holding.currency,
    },
    side: "BUY",
    quantity: holding.quantity,
    priceOriginal: getAverageCostOriginal(holding),
    feeOriginal: 0,
    tradeDate: "2026-03-10",
    settlementDate: "2026-03-10",
    fxRateToKrw: 1492,
  }));
}

export function getDemoMarketPriceOverrides(): Record<string, number> {
  return Object.fromEntries(
    DEMO_HOLDINGS.map((holding) => [
      holding.symbol,
      getCurrentPriceOriginal(holding),
    ]),
  );
}
