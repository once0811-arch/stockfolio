import { z } from "zod";

import type { StoredTrade } from "@/src/server/ledger/types";

const tradeDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export const manualTradeInputSchema = z.object({
  id: z.string().min(1).optional(),
  symbol: z.string().min(1),
  market: z.string().min(1).default("NASDAQ"),
  currency: z.string().min(1).default("USD"),
  side: z.enum(["BUY", "SELL"]),
  quantity: z.number().positive(),
  priceOriginal: z.number().positive(),
  feeOriginal: z.number().min(0),
  tradeDate: z.string().regex(tradeDatePattern),
  settlementDate: z.string().regex(tradeDatePattern),
  fxRateToKrw: z.number().positive(),
});

export function toStoredTrade(
  input: z.infer<typeof manualTradeInputSchema>,
): StoredTrade {
  return {
    id: input.id ?? crypto.randomUUID(),
    asset: {
      symbol: input.symbol.toUpperCase(),
      market: input.market.toUpperCase(),
      currency: input.currency.toUpperCase(),
    },
    side: input.side,
    quantity: input.quantity,
    priceOriginal: input.priceOriginal,
    feeOriginal: input.feeOriginal,
    tradeDate: input.tradeDate,
    settlementDate: input.settlementDate,
    fxRateToKrw: input.fxRateToKrw,
  };
}
