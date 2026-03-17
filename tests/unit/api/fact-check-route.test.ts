import { describe, expect, it } from "vitest";

import { POST as POST_FACTCHECK } from "@/app/api/fact-check/[memoId]/route";
import { GET as GET_MEMOS, POST as POST_MEMO } from "@/app/api/memos/route";
import { clearMemosForTests } from "@/src/server/memos/in-memory-memos";

describe("/api/fact-check/:memoId", () => {
  it("runs fact-check for one memo and persists citation status", async () => {
    await clearMemosForTests();

    const create = await POST_MEMO(
      new Request("http://localhost/api/memos", {
        method: "POST",
        body: JSON.stringify({
          symbol: "MSFT",
          thesisText: "클라우드 성장률이 유지된다",
        }),
      }),
    );
    const created = (await create.json()) as { memo: { id: string } };

    const run = await POST_FACTCHECK(
      new Request(`http://localhost/api/fact-check/${created.memo.id}`, {
        method: "POST",
      }),
      { params: Promise.resolve({ memoId: created.memo.id }) },
    );

    expect(run.status).toBe(200);
    const runPayload = (await run.json()) as {
      factCheck: {
        confidence: number;
        citationCount: number;
        disclaimer: string;
        citations: Array<{
          title: string;
          source: string;
          url?: string;
          publishedAt?: string;
          stance: "SUPPORTING" | "CONTRADICTING" | "RELATED_NEWS";
        }>;
      };
    };
    expect(runPayload.factCheck.citationCount).toBeGreaterThan(0);
    expect(runPayload.factCheck.disclaimer).toContain("투자 자문");
    expect(runPayload.factCheck.citations.length).toBeGreaterThan(0);
    expect(runPayload.factCheck.citations[0]?.stance).toBeDefined();
    expect(runPayload.factCheck.citationCount).toBe(
      runPayload.factCheck.citations.length,
    );

    const list = await GET_MEMOS(
      new Request("http://localhost/api/memos?symbol=MSFT", {
        method: "GET",
      }),
    );
    const listPayload = (await list.json()) as {
      memos: Array<{ factCheckStatus: string; citationCount: number }>;
    };
    expect(listPayload.memos[0]?.factCheckStatus).toBe("COMPLETED");
    expect(listPayload.memos[0]?.citationCount).toBe(
      runPayload.factCheck.citations.length,
    );
  });
});
