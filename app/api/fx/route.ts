import { NextResponse } from "next/server";

import { getFxRateFromFrankfurter } from "@/src/domain/market-data/frankfurter-fx";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const base = (searchParams.get("base") ?? "USD").toUpperCase();
  const quote = (searchParams.get("quote") ?? "KRW").toUpperCase();
  const date = searchParams.get("date");

  try {
    const data = await getFxRateFromFrankfurter(base, quote, date);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch FX rate",
        message: error instanceof Error ? error.message : "unknown",
      },
      { status: 502 },
    );
  }
}
