import { NextResponse } from "next/server";

import { getMarketPrices } from "@/src/domain/market-data/market-prices";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol")?.trim().toUpperCase();
  const range = searchParams.get("range");

  if (!symbol) {
    return NextResponse.json(
      { error: "Query parameter 'symbol' is required" },
      { status: 400 },
    );
  }

  try {
    const data = await getMarketPrices(symbol, range);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch market prices",
        message: error instanceof Error ? error.message : "unknown",
      },
      { status: 502 },
    );
  }
}
