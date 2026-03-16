import { NextResponse } from "next/server";

import { getRelatedNewsFromGoogleRss } from "@/src/domain/market-data/google-news-rss";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol")?.trim().toUpperCase();
  const max = Number(searchParams.get("max") ?? "10");

  if (!symbol) {
    return NextResponse.json(
      { error: "Query parameter 'symbol' is required" },
      { status: 400 },
    );
  }

  try {
    const result = await getRelatedNewsFromGoogleRss(symbol, max);
    return NextResponse.json({
      symbol,
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch related news",
        message: error instanceof Error ? error.message : "unknown",
      },
      { status: 502 },
    );
  }
}
