import { afterEach, describe, expect, it, vi } from "vitest";

import { prisma } from "@/src/db/client";
import { appendMemo } from "@/src/server/memos/in-memory-memos";
import { resetPersistenceModeForTests } from "@/src/server/persistence/mode";
import {
  createFactCheckRunWithCitations,
} from "@/src/server/research/fact-check-store";
import type { CitationStance } from "@/src/server/research/types";

const TEST_SYMBOL = "RBKTXN";

describe("fact-check transaction rollback (postgres)", () => {
  const runDbTests = process.env.RUN_DB_TESTS === "true";

  async function cleanupTestRows() {
    await prisma.memo.deleteMany({
      where: { symbol: TEST_SYMBOL },
    });
  }

  afterEach(async () => {
    vi.unstubAllEnvs();
    resetPersistenceModeForTests();

    if (!runDbTests) {
      return;
    }

    await cleanupTestRows();
  });

  (runDbTests ? it : it.skip)(
    "rolls back memo status and citations when citation insert fails",
    async () => {
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("PORTFOLIO_PERSISTENCE_MODE", "postgres");

      await cleanupTestRows();

      const memo = await appendMemo({
        symbol: TEST_SYMBOL,
        thesisText: "실적 개선 추세가 유지된다.",
      });

      await expect(
        createFactCheckRunWithCitations({
          memoId: memo.id,
          model: "integration-rollback-test",
          confidence: 0.5,
          disclaimer: "금융 정보 제공 목적이며 투자 자문이 아닙니다.",
          claims: ["실적 개선 추세가 유지된다."],
          citations: [
            {
              title: "broken citation",
              source: "integration",
              stance: "BROKEN" as unknown as CitationStance,
            },
          ],
        }),
      ).rejects.toThrow();

      const refreshedMemo = await prisma.memo.findUnique({
        where: { id: memo.id },
        select: {
          factCheckStatus: true,
          citationCount: true,
        },
      });
      expect(refreshedMemo?.factCheckStatus).toBe("NOT_RUN");
      expect(refreshedMemo?.citationCount).toBe(0);

      const runCount = await prisma.factCheckRun.count({
        where: { memoId: memo.id },
      });
      expect(runCount).toBe(0);

      const citationCount = await prisma.sourceCitation.count({
        where: {
          factCheckRun: {
            memoId: memo.id,
          },
        },
      });
      expect(citationCount).toBe(0);
    },
  );
});
