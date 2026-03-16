import type { FxQuote } from "@/src/domain/market-data/types";

type FrankfurterResponse = {
  base?: string;
  date?: string;
  rates?: Record<string, number>;
};

function normalizeCode(value: string): string {
  return value.trim().toUpperCase();
}

export async function getFxRateFromFrankfurter(
  base: string,
  quote: string,
  date: string | null,
): Promise<FxQuote> {
  const normalizedBase = normalizeCode(base);
  const normalizedQuote = normalizeCode(quote);

  if (normalizedBase === normalizedQuote) {
    return {
      base: normalizedBase,
      quote: normalizedQuote,
      date: date ?? new Date().toISOString().slice(0, 10),
      rate: 1,
      provider: "frankfurter",
    };
  }

  const endpointDate = date ?? "latest";
  const url = new URL(`https://api.frankfurter.dev/v1/${endpointDate}`);
  url.searchParams.set("base", normalizedBase);
  url.searchParams.set("symbols", normalizedQuote);

  const response = await fetch(url.toString(), {
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) {
    throw new Error(`Frankfurter API error: ${response.status}`);
  }

  const payload = (await response.json()) as FrankfurterResponse;
  const rate = payload.rates?.[normalizedQuote];

  if (!rate) {
    throw new Error("Frankfurter parsing error: missing rate");
  }

  return {
    base: payload.base ?? normalizedBase,
    quote: normalizedQuote,
    date: payload.date ?? (date ?? new Date().toISOString().slice(0, 10)),
    rate,
    provider: "frankfurter",
  };
}
