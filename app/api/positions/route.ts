import { NextResponse } from "next/server";

import { listTrades } from "@/src/server/ledger/in-memory-ledger";
import { getDemoMarketPriceOverrides } from "@/src/server/ledger/demo-portfolio";
import { buildPositionsFromTrades } from "@/src/server/ledger/positions-from-trades";

export async function GET(request?: Request) {
  try {
    const seedDemo = request
      ? new URL(request.url).searchParams.get("seedDemo") === "true"
      : false;
    const trades = await listTrades({
      includeDemoSeedInTests: seedDemo,
    });
    const marketPricesBySymbol = getDemoMarketPriceOverrides();
    const positions = buildPositionsFromTrades(trades, marketPricesBySymbol);
    return NextResponse.json({ positions });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to build positions",
        message: error instanceof Error ? error.message : "unknown",
      },
      { status: 422 },
    );
  }
}
