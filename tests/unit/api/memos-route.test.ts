import { describe, expect, it } from "vitest";

import { GET, POST } from "@/app/api/memos/route";
import { PATCH } from "@/app/api/memos/[memoId]/route";
import { clearMemosForTests } from "@/src/server/memos/in-memory-memos";

describe("/api/memos", () => {
  it("creates, filters, and updates symbol-linked memos", async () => {
    await clearMemosForTests();

    const create = await POST(
      new Request("http://localhost/api/memos", {
        method: "POST",
        body: JSON.stringify({
          symbol: "AAPL",
          thesisText: "밸류에이션 매력",
        }),
      }),
    );

    expect(create.status).toBe(201);
    const createdPayload = (await create.json()) as {
      memo: { id: string; symbol: string; status: string };
    };
    expect(createdPayload.memo.symbol).toBe("AAPL");
    expect(createdPayload.memo.status).toBe("ACTIVE");

    const filtered = await GET(
      new Request("http://localhost/api/memos?symbol=AAPL", {
        method: "GET",
      }),
    );
    expect(filtered.status).toBe(200);
    const filteredPayload = (await filtered.json()) as {
      memos: Array<{ id: string }>;
    };
    expect(filteredPayload.memos).toHaveLength(1);

    const updated = await PATCH(
      new Request(`http://localhost/api/memos/${createdPayload.memo.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          reviewOutcome: "CORRECT",
          retrospectiveNote: "실적 컨센서스 상회",
        }),
      }),
      { params: Promise.resolve({ memoId: createdPayload.memo.id }) },
    );

    expect(updated.status).toBe(200);
    const updatedPayload = (await updated.json()) as {
      memo: { reviewOutcome: string; retrospectiveNote: string };
    };
    expect(updatedPayload.memo.reviewOutcome).toBe("CORRECT");
    expect(updatedPayload.memo.retrospectiveNote).toContain("실적");
  });
});
