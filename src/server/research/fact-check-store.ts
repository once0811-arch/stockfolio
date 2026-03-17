import { Prisma } from "@prisma/client";

import { prisma } from "@/src/db/client";
import type { StoredMemo } from "@/src/server/memos/types";
import { ensureLocalContext } from "@/src/server/persistence/local-context";
import {
  getPersistenceMode,
  onPostgresFailure,
  shouldUsePostgresByPolicy,
} from "@/src/server/persistence/mode";
import { getRuntimeState } from "@/src/server/runtime-state";
import type {
  CitationStance,
  StoredFactCheckRun,
  StoredSourceCitation,
} from "@/src/server/research/types";

type CreateCitationInput = {
  title: string;
  source: string;
  url?: string;
  publishedAt?: string;
  stance: CitationStance;
};

type CreateFactCheckRunInput = {
  memoId: string;
  model: string;
  confidence: number;
  disclaimer: string;
  claims: string[];
  citations: CreateCitationInput[];
};

type CreateFactCheckRunResult = {
  run: StoredFactCheckRun;
  citations: StoredSourceCitation[];
  memo: StoredMemo;
};

type FactCheckRunRow = {
  id: string;
  memoId: string;
  model: string;
  status: "COMPLETED";
  confidence: { toNumber(): number };
  disclaimer: string;
  claimsJson: string;
  createdAt: Date;
  updatedAt: Date;
};

type SourceCitationRow = {
  id: string;
  factCheckRunId: string;
  title: string;
  source: string;
  url: string | null;
  publishedAt: Date | null;
  stance: CitationStance;
  createdAt: Date;
};

type MemoRow = {
  id: string;
  portfolioId: string;
  symbol: string;
  tradeId: string | null;
  thesisText: string;
  createdAt: Date;
  updatedAt: Date;
  status: StoredMemo["status"];
  reviewOutcome: StoredMemo["reviewOutcome"];
  retrospectiveNote: string | null;
  factCheckStatus: StoredMemo["factCheckStatus"];
  citationCount: number;
};

function toIsoDateText(value: Date | null): string | null {
  if (!value) {
    return null;
  }
  return value.toISOString().slice(0, 10);
}

function fromRunRow(row: FactCheckRunRow): StoredFactCheckRun {
  return {
    id: row.id,
    memoId: row.memoId,
    model: row.model,
    status: row.status,
    confidence: row.confidence.toNumber(),
    disclaimer: row.disclaimer,
    claimsJson: row.claimsJson,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function fromCitationRow(row: SourceCitationRow): StoredSourceCitation {
  return {
    id: row.id,
    factCheckRunId: row.factCheckRunId,
    title: row.title,
    source: row.source,
    url: row.url,
    publishedAt: toIsoDateText(row.publishedAt),
    stance: row.stance,
    createdAt: row.createdAt.toISOString(),
  };
}

function fromMemoRow(row: MemoRow): StoredMemo {
  return {
    id: row.id,
    symbol: row.symbol,
    tradeId: row.tradeId,
    thesisText: row.thesisText,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    status: row.status,
    reviewOutcome: row.reviewOutcome,
    retrospectiveNote: row.retrospectiveNote,
    factCheckStatus: row.factCheckStatus,
    citationCount: row.citationCount,
  };
}

function createInMemory(
  input: CreateFactCheckRunInput,
): CreateFactCheckRunResult {
  const state = getRuntimeState();
  const now = new Date().toISOString();
  const runId = crypto.randomUUID();
  const memoIndex = state.memoLedger.findIndex((memo) => memo.id === input.memoId);
  if (memoIndex === -1) {
    throw new Error("Memo not found");
  }

  const run: StoredFactCheckRun = {
    id: runId,
    memoId: input.memoId,
    model: input.model,
    status: "COMPLETED",
    confidence: input.confidence,
    disclaimer: input.disclaimer,
    claimsJson: JSON.stringify(input.claims),
    createdAt: now,
    updatedAt: now,
  };

  const citations: StoredSourceCitation[] = input.citations.map((item) => ({
    id: crypto.randomUUID(),
    factCheckRunId: runId,
    title: item.title,
    source: item.source,
    url: item.url ?? null,
    publishedAt: item.publishedAt ?? null,
    stance: item.stance,
    createdAt: now,
  }));

  const currentMemo = state.memoLedger[memoIndex];
  const updatedMemo: StoredMemo = {
    ...currentMemo,
    factCheckStatus: "COMPLETED",
    citationCount: citations.length,
    updatedAt: now,
  };

  state.memoLedger[memoIndex] = updatedMemo;
  state.factCheckRuns.push(run);
  state.sourceCitations.push(...citations);
  return { run, citations, memo: { ...updatedMemo } };
}

async function createInPostgres(
  input: CreateFactCheckRunInput,
): Promise<CreateFactCheckRunResult> {
  const context = await ensureLocalContext();
  const citationCount = input.citations.length;
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const memoRows = await tx.$queryRaw<MemoRow[]>(Prisma.sql`
      UPDATE "Memo"
      SET
        "factCheckStatus" = ${"COMPLETED"}::"FactCheckStatus",
        "citationCount" = ${citationCount},
        "updatedAt" = ${now}
      WHERE "id" = ${input.memoId} AND "portfolioId" = ${context.portfolioId}
      RETURNING
        "id",
        "portfolioId",
        "tradeId",
        "symbol",
        "thesisText",
        "createdAt",
        "updatedAt",
        "status",
        "reviewOutcome",
        "retrospectiveNote",
        "factCheckStatus",
        "citationCount"
    `);
    const updatedMemo = memoRows[0];
    if (!updatedMemo) {
      throw new Error("Memo not found");
    }

    const rows = await tx.$queryRaw<FactCheckRunRow[]>(Prisma.sql`
      INSERT INTO "FactCheckRun" (
        "id",
        "portfolioId",
        "memoId",
        "model",
        "status",
        "confidence",
        "disclaimer",
        "claimsJson",
        "updatedAt"
      )
      VALUES (
        ${crypto.randomUUID()},
        ${context.portfolioId},
        ${input.memoId},
        ${input.model},
        ${"COMPLETED"}::"FactCheckRunStatus",
        ${input.confidence},
        ${input.disclaimer},
        ${JSON.stringify(input.claims)}::jsonb,
        ${new Date()}
      )
      RETURNING
        "id",
        "memoId",
        "model",
        "status",
        "confidence",
        "disclaimer",
        "claimsJson",
        "createdAt",
        "updatedAt"
    `);

    const createdRun = rows[0];
    if (!createdRun) {
      throw new Error("Failed to create fact-check run");
    }

    const createdCitations: StoredSourceCitation[] = [];
    for (const item of input.citations) {
      const citationRows = await tx.$queryRaw<SourceCitationRow[]>(Prisma.sql`
        INSERT INTO "SourceCitation" (
          "id",
          "portfolioId",
          "factCheckRunId",
          "title",
          "source",
          "url",
          "publishedAt",
          "stance"
        )
        VALUES (
          ${crypto.randomUUID()},
          ${context.portfolioId},
          ${createdRun.id},
          ${item.title},
          ${item.source},
          ${item.url ?? null},
          ${item.publishedAt ? new Date(`${item.publishedAt}T00:00:00.000Z`) : null},
          ${item.stance}::"CitationStance"
        )
        RETURNING
          "id",
          "factCheckRunId",
          "title",
          "source",
          "url",
          "publishedAt",
          "stance",
          "createdAt"
      `);
      const createdCitation = citationRows[0];
      if (createdCitation) {
        createdCitations.push(fromCitationRow(createdCitation));
      }
    }

    return {
      run: fromRunRow(createdRun),
      citations: createdCitations,
      memo: fromMemoRow(updatedMemo),
    };
  });
}

export async function createFactCheckRunWithCitations(
  input: CreateFactCheckRunInput,
): Promise<CreateFactCheckRunResult> {
  if (!shouldUsePostgresByPolicy()) {
    return createInMemory(input);
  }

  try {
    return await createInPostgres(input);
  } catch (error) {
    if (error instanceof Error && error.message === "Memo not found") {
      throw error;
    }
    onPostgresFailure(error, "createFactCheckRunWithCitations");
    return createInMemory(input);
  }
}

export async function clearFactCheckRunsForTests(): Promise<void> {
  const state = getRuntimeState();
  state.factCheckRuns.length = 0;
  state.sourceCitations.length = 0;

  if (process.env.NODE_ENV === "test" || !shouldUsePostgresByPolicy()) {
    return;
  }

  if (getPersistenceMode() === "memory") {
    return;
  }

  try {
    const context = await ensureLocalContext();
    await prisma.$executeRaw`
      DELETE FROM "SourceCitation"
      WHERE "portfolioId" = ${context.portfolioId}
    `;
    await prisma.$executeRaw`
      DELETE FROM "FactCheckRun"
      WHERE "portfolioId" = ${context.portfolioId}
    `;
  } catch (error) {
    onPostgresFailure(error, "clearFactCheckRunsForTests");
  }
}
