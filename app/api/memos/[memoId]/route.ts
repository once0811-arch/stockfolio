import { NextResponse } from "next/server";

import { updateMemo } from "@/src/server/memos/in-memory-memos";
import {
  normalizeMemoPatch,
  updateMemoInputSchema,
} from "@/src/server/memos/memo-schemas";

type RouteContext = {
  params: Promise<{
    memoId: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { memoId } = await context.params;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = updateMemoInputSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid memo patch payload",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const updated = await updateMemo(memoId, normalizeMemoPatch(parsed.data));
  if (!updated) {
    return NextResponse.json({ error: "Memo not found" }, { status: 404 });
  }

  return NextResponse.json({ memo: updated });
}
