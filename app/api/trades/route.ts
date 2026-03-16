import { NextResponse } from "next/server";

import { appendTrade, listTrades } from "@/src/server/ledger/in-memory-ledger";
import { buildPositionsFromTrades } from "@/src/server/ledger/positions-from-trades";
import { getDemoMarketPriceOverrides } from "@/src/server/ledger/demo-portfolio";
import { listMemos } from "@/src/server/memos/in-memory-memos";
import { deriveTradeStatusSummary } from "@/src/server/memos/trade-status-summary";
import {
  manualTradeInputSchema,
  toStoredTrade,
} from "@/src/server/ledger/trade-schemas";

export async function GET() {
  const rawTrades = await listTrades();
  const memos = await listMemos();
  const positions = buildPositionsFromTrades(
    rawTrades,
    getDemoMarketPriceOverrides(),
  );

  return NextResponse.json({
    trades: rawTrades.map((trade) => ({
      ...trade,
      ...deriveTradeStatusSummary(trade.asset.symbol, memos),
    })),
    positions,
  });
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = manualTradeInputSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid trade payload",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const tradeCandidate = toStoredTrade(parsed.data);
    buildPositionsFromTrades([...(await listTrades()), tradeCandidate]);
    const trade = await appendTrade(tradeCandidate);
    return NextResponse.json({ trade }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Trade id already exists") {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    if (
      error instanceof Error &&
      error.message === "Sell quantity exceeds open position"
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to append trade" }, { status: 500 });
  }
}
