import type { DividendPoint, MarketPriceSeries } from "@/src/domain/market-data/types";

type YahooChartResponse = {
  chart?: {
    result?: Array<{
      meta?: {
        symbol?: string;
        currency?: string;
      };
      timestamp?: number[];
      indicators?: {
        quote?: Array<{
          open?: Array<number | null>;
          high?: Array<number | null>;
          low?: Array<number | null>;
          close?: Array<number | null>;
          volume?: Array<number | null>;
        }>;
      };
      events?: {
        dividends?: Record<string, { amount?: number; date?: number }>;
      };
    }>;
    error?: { description?: string };
  };
};

function toIsoDate(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toISOString().slice(0, 10);
}

function normalizeRange(range: string | null): string {
  const allowed = new Set(["1mo", "3mo", "6mo", "1y", "2y", "5y", "10y", "max"]);
  if (!range || !allowed.has(range)) {
    return "6mo";
  }
  return range;
}

export async function getYahooPricesAndDividends(
  symbol: string,
  range: string | null,
): Promise<MarketPriceSeries> {
  const normalizedSymbol = symbol.toUpperCase();
  const normalizedRange = normalizeRange(range);
  const url = new URL(`https://query2.finance.yahoo.com/v8/finance/chart/${normalizedSymbol}`);
  url.searchParams.set("interval", "1d");
  url.searchParams.set("range", normalizedRange);
  url.searchParams.set("events", "div");

  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": "Mozilla/5.0 (PortfolioOps/1.0)",
      Accept: "application/json",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    throw new Error(`Yahoo market API error: ${response.status}`);
  }

  const payload = (await response.json()) as YahooChartResponse;
  const result = payload.chart?.result?.[0];
  const quote = result?.indicators?.quote?.[0];
  const timestamps = result?.timestamp ?? [];

  if (!result || !quote || timestamps.length === 0) {
    const reason = payload.chart?.error?.description ?? "empty chart payload";
    throw new Error(`Yahoo chart parsing error: ${reason}`);
  }

  const prices = timestamps
    .map((timestamp, index) => {
      const open = quote.open?.[index];
      const high = quote.high?.[index];
      const low = quote.low?.[index];
      const close = quote.close?.[index];
      const volume = quote.volume?.[index];

      if (
        open === null ||
        high === null ||
        low === null ||
        close === null ||
        volume === null ||
        open === undefined ||
        high === undefined ||
        low === undefined ||
        close === undefined ||
        volume === undefined
      ) {
        return null;
      }

      return {
        date: toIsoDate(timestamp),
        open,
        high,
        low,
        close,
        volume,
      };
    })
    .filter((point): point is NonNullable<typeof point> => point !== null);

  const dividends: DividendPoint[] = Object.values(result.events?.dividends ?? {})
    .map((entry) => {
      if (entry.amount === undefined || entry.date === undefined) {
        return null;
      }
      return {
        date: toIsoDate(entry.date),
        amount: entry.amount,
        currency: result.meta?.currency ?? "USD",
      };
    })
    .filter((entry): entry is DividendPoint => entry !== null)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (prices.length === 0) {
    throw new Error("Yahoo chart parsing error: no valid price points");
  }

  return {
    symbol: result.meta?.symbol ?? normalizedSymbol,
    currency: result.meta?.currency ?? "USD",
    provider: "yahoo-chart",
    prices,
    dividends,
  };
}
