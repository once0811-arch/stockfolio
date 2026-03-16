import { NextResponse } from "next/server";

import { listTrades } from "@/src/server/ledger/in-memory-ledger";
import { buildPositionsFromTrades } from "@/src/server/ledger/positions-from-trades";

export async function GET() {
  const positions = buildPositionsFromTrades(listTrades());
  return NextResponse.json({ positions });
}
