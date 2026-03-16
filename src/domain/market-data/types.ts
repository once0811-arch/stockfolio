export type DailyPricePoint = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type DividendPoint = {
  date: string;
  amount: number;
  currency: string;
};

export type MarketPriceSeries = {
  symbol: string;
  currency: string;
  provider: string;
  prices: DailyPricePoint[];
  dividends: DividendPoint[];
};

export type FxQuote = {
  base: string;
  quote: string;
  date: string;
  rate: number;
  provider: string;
};

export type RelatedNewsItem = {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
};
