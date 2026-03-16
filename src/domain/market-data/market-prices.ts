import { getStooqPrices } from "@/src/domain/market-data/stooq-prices";
import type { MarketPriceSeries } from "@/src/domain/market-data/types";
import { getYahooPricesAndDividends } from "@/src/domain/market-data/yahoo-prices";

export async function getMarketPrices(
  symbol: string,
  range: string | null,
): Promise<MarketPriceSeries> {
  try {
    return await getYahooPricesAndDividends(symbol, range);
  } catch {
    return getStooqPrices(symbol, range);
  }
}
