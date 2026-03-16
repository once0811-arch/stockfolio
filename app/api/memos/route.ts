import { NextResponse } from "next/server";

import {
  appendMemo,
  listMemos,
} from "@/src/server/memos/in-memory-memos";
import { createMemoInputSchema } from "@/src/server/memos/memo-schemas";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") ?? undefined;
  const tradeId = searchParams.get("tradeId") ?? undefined;

  return NextResponse.json({
    memos: await listMemos({ symbol, tradeId }),
  });
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = createMemoInputSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid memo payload",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const memo = await appendMemo(parsed.data);
  return NextResponse.json({ memo }, { status: 201 });
}
