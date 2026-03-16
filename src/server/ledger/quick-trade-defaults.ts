import type { StoredTrade } from "@/src/server/ledger/types";

type QuickTradeInput = {
  symbol: string;
  side: StoredTrade["side"];
  quantity: number;
  priceOriginal: number;
  tradeDate: string;
};

type AdvancedOverrides = {
  market?: string;
  currency?: string;
  feeOriginal?: number;
  settlementDate?: string;
  fxRateToKrw?: number;
};

type MergedTradeInput = {
  symbol: string;
  market: string;
  currency: string;
  side: StoredTrade["side"];
  quantity: number;
  priceOriginal: number;
  feeOriginal: number;
  tradeDate: string;
  settlementDate: string;
  fxRateToKrw: number;
};

export function mergeQuickTradeWithDefaults(
  quick: QuickTradeInput,
  advanced: AdvancedOverrides = {},
): MergedTradeInput {
  return {
    symbol: quick.symbol.toUpperCase(),
    market: (advanced.market ?? "NASDAQ").toUpperCase(),
    currency: (advanced.currency ?? "USD").toUpperCase(),
    side: quick.side,
    quantity: quick.quantity,
    priceOriginal: quick.priceOriginal,
    feeOriginal: advanced.feeOriginal ?? 0,
    tradeDate: quick.tradeDate,
    settlementDate: advanced.settlementDate ?? quick.tradeDate,
    fxRateToKrw: advanced.fxRateToKrw ?? 1300,
  };
}
