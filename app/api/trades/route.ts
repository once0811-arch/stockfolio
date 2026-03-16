import { NextResponse } from "next/server";

import { appendTrade, listTrades } from "@/src/server/ledger/in-memory-ledger";
import {
  manualTradeInputSchema,
  toStoredTrade,
} from "@/src/server/ledger/trade-schemas";

export async function GET() {
  return NextResponse.json({
    trades: listTrades(),
  });
}

export async function POST(request: Request) {
  const parsed = manualTradeInputSchema.safeParse(await request.json());
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
    const trade = appendTrade(toStoredTrade(parsed.data));
    return NextResponse.json({ trade }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Trade id already exists") {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to append trade" }, { status: 500 });
  }
}
