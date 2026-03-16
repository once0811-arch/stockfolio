import type { DailyPricePoint, MarketPriceSeries } from "@/src/domain/market-data/types";

function normalizeRangeDays(range: string | null): number {
  switch (range) {
    case "1mo":
      return 31;
    case "3mo":
      return 92;
    case "6mo":
      return 183;
    case "1y":
      return 366;
    case "2y":
      return 732;
    case "5y":
      return 1830;
    case "10y":
      return 3650;
    default:
      return 366;
  }
}

function toNumber(value: string): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function getStooqPrices(
  symbol: string,
  range: string | null,
): Promise<MarketPriceSeries> {
  const normalizedSymbol = symbol.toLowerCase();
  const csvSymbol = `${normalizedSymbol}.us`;
  const url = `https://stooq.com/q/d/l/?s=${csvSymbol}&i=d`;

  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) {
    throw new Error(`Stooq API error: ${response.status}`);
  }

  const csv = await response.text();
  const lines = csv.trim().split("\n");
  if (lines.length < 2) {
    throw new Error("Stooq parsing error: no rows");
  }

  const allPoints: DailyPricePoint[] = lines
    .slice(1)
    .map((line) => {
      const [date, openRaw, highRaw, lowRaw, closeRaw, volumeRaw] = line.split(",");
      if (!date || !openRaw || !highRaw || !lowRaw || !closeRaw || !volumeRaw) {
        return null;
      }

      const open = toNumber(openRaw);
      const high = toNumber(highRaw);
      const low = toNumber(lowRaw);
      const close = toNumber(closeRaw);
      const volume = toNumber(volumeRaw);

      if (
        open === null ||
        high === null ||
        low === null ||
        close === null ||
        volume === null
      ) {
        return null;
      }

      return {
        date,
        open,
        high,
        low,
        close,
        volume,
      };
    })
    .filter((point): point is DailyPricePoint => point !== null)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (allPoints.length === 0) {
    throw new Error("Stooq parsing error: no valid points");
  }

  const days = normalizeRangeDays(range);
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - days);
  const cutoffDate = cutoff.toISOString().slice(0, 10);

  const prices = allPoints.filter((point) => point.date >= cutoffDate);

  return {
    symbol: symbol.toUpperCase(),
    currency: "USD",
    provider: "stooq-csv",
    prices: prices.length > 0 ? prices : allPoints.slice(-days),
    dividends: [],
  };
}
