import type { StoredMemo } from "@/src/server/memos/types";
import { Prisma } from "@prisma/client";
import { prisma } from "@/src/db/client";
import { ensureLocalContext } from "@/src/server/persistence/local-context";
import {
  getPersistenceMode,
  onPostgresFailure,
  shouldUsePostgresByPolicy,
} from "@/src/server/persistence/mode";
import { getRuntimeState } from "@/src/server/runtime-state";

type CreateMemoInput = {
  id?: string;
  symbol: string;
  tradeId?: string | null;
  thesisText: string;
  status?: StoredMemo["status"];
  reviewOutcome?: StoredMemo["reviewOutcome"];
  retrospectiveNote?: string | null;
  factCheckStatus?: StoredMemo["factCheckStatus"];
  citationCount?: number;
};

type UpdateMemoInput = {
  thesisText?: string;
  status?: StoredMemo["status"];
  reviewOutcome?: StoredMemo["reviewOutcome"];
  retrospectiveNote?: string | null;
  factCheckStatus?: StoredMemo["factCheckStatus"];
  citationCount?: number;
};

function cloneMemo(memo: StoredMemo): StoredMemo {
  return { ...memo };
}

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

function fromMemoRow(record: MemoRow): StoredMemo {
  return {
    id: record.id,
    symbol: record.symbol,
    tradeId: record.tradeId,
    thesisText: record.thesisText,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    status: record.status,
    reviewOutcome: record.reviewOutcome,
    retrospectiveNote: record.retrospectiveNote,
    factCheckStatus: record.factCheckStatus,
    citationCount: record.citationCount,
  };
}

function appendMemoToMemory(input: CreateMemoInput): StoredMemo {
  const memoLedger = getRuntimeState().memoLedger;
  const now = new Date().toISOString();
  const created: StoredMemo = {
    id: input.id ?? crypto.randomUUID(),
    symbol: input.symbol.toUpperCase(),
    tradeId: input.tradeId ?? null,
    thesisText: input.thesisText,
    createdAt: now,
    updatedAt: now,
    status: input.status ?? "ACTIVE",
    reviewOutcome: input.reviewOutcome ?? "UNRESOLVED",
    retrospectiveNote: input.retrospectiveNote ?? null,
    factCheckStatus: input.factCheckStatus ?? "NOT_RUN",
    citationCount: input.citationCount ?? 0,
  };

  memoLedger.push(created);
  return cloneMemo(created);
}

async function appendMemoToPostgres(input: CreateMemoInput): Promise<StoredMemo> {
  const context = await ensureLocalContext();
  const rows = await prisma.$queryRaw<MemoRow[]>`
    INSERT INTO "Memo" (
      "id",
      "portfolioId",
      "tradeId",
      "symbol",
      "thesisText",
      "status",
      "reviewOutcome",
      "retrospectiveNote",
      "factCheckStatus",
      "citationCount",
      "updatedAt"
    )
    VALUES (
      ${input.id ?? crypto.randomUUID()},
      ${context.portfolioId},
      ${input.tradeId ?? null},
      ${input.symbol.toUpperCase()},
      ${input.thesisText},
      ${input.status ?? "ACTIVE"}::"MemoLifecycleStatus",
      ${input.reviewOutcome ?? "UNRESOLVED"}::"ReviewOutcome",
      ${input.retrospectiveNote ?? null},
      ${input.factCheckStatus ?? "NOT_RUN"}::"FactCheckStatus",
      ${input.citationCount ?? 0},
      ${new Date()}
    )
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
  `;

  const created = rows[0];
  if (!created) {
    throw new Error("Failed to create memo");
  }

  return fromMemoRow(created);
}

function listMemosFromMemory(filter?: {
  symbol?: string;
  tradeId?: string;
}): StoredMemo[] {
  const memoLedger = getRuntimeState().memoLedger;
  const symbol = filter?.symbol?.toUpperCase();
  const list = memoLedger.filter((memo) => {
    if (symbol && memo.symbol !== symbol) {
      return false;
    }
    if (filter?.tradeId && memo.tradeId !== filter.tradeId) {
      return false;
    }
    return true;
  });

  return list
    .map(cloneMemo)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function listMemosFromPostgres(filter?: {
  symbol?: string;
  tradeId?: string;
}): Promise<StoredMemo[]> {
  const context = await ensureLocalContext();
  const conditions: Prisma.Sql[] = [Prisma.sql`"portfolioId" = ${context.portfolioId}`];
  if (filter?.symbol) {
    conditions.push(Prisma.sql`"symbol" = ${filter.symbol.toUpperCase()}`);
  }
  if (filter?.tradeId) {
    conditions.push(Prisma.sql`"tradeId" = ${filter.tradeId}`);
  }

  const whereSql = Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`;
  const rows = await prisma.$queryRaw<MemoRow[]>(Prisma.sql`
    SELECT
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
    FROM "Memo"
    ${whereSql}
    ORDER BY "createdAt" DESC
  `);

  return rows.map(fromMemoRow);
}

function findMemoByIdFromMemory(id: string): StoredMemo | null {
  const memoLedger = getRuntimeState().memoLedger;
  const found = memoLedger.find((memo) => memo.id === id);
  return found ? cloneMemo(found) : null;
}

async function findMemoByIdFromPostgres(id: string): Promise<StoredMemo | null> {
  const context = await ensureLocalContext();
  const rows = await prisma.$queryRaw<MemoRow[]>`
    SELECT
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
    FROM "Memo"
    WHERE "id" = ${id} AND "portfolioId" = ${context.portfolioId}
    LIMIT 1
  `;

  return rows[0] ? fromMemoRow(rows[0]) : null;
}

function updateMemoInMemory(id: string, patch: UpdateMemoInput): StoredMemo | null {
  const memoLedger = getRuntimeState().memoLedger;
  const index = memoLedger.findIndex((memo) => memo.id === id);
  if (index === -1) {
    return null;
  }

  const current = memoLedger[index];
  const updated: StoredMemo = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  memoLedger[index] = updated;
  return cloneMemo(updated);
}

async function updateMemoInPostgres(
  id: string,
  patch: UpdateMemoInput,
): Promise<StoredMemo | null> {
  const context = await ensureLocalContext();
  const updates: Prisma.Sql[] = [];
  if (patch.thesisText !== undefined) {
    updates.push(Prisma.sql`"thesisText" = ${patch.thesisText}`);
  }
  if (patch.status !== undefined) {
    updates.push(Prisma.sql`"status" = ${patch.status}::"MemoLifecycleStatus"`);
  }
  if (patch.reviewOutcome !== undefined) {
    updates.push(Prisma.sql`"reviewOutcome" = ${patch.reviewOutcome}::"ReviewOutcome"`);
  }
  if (patch.retrospectiveNote !== undefined) {
    updates.push(Prisma.sql`"retrospectiveNote" = ${patch.retrospectiveNote}`);
  }
  if (patch.factCheckStatus !== undefined) {
    updates.push(Prisma.sql`"factCheckStatus" = ${patch.factCheckStatus}::"FactCheckStatus"`);
  }
  if (patch.citationCount !== undefined) {
    updates.push(Prisma.sql`"citationCount" = ${patch.citationCount}`);
  }
  updates.push(Prisma.sql`"updatedAt" = ${new Date()}`);

  const rows = await prisma.$queryRaw<MemoRow[]>(Prisma.sql`
    UPDATE "Memo"
    SET ${Prisma.join(updates, ", ")}
    WHERE "id" = ${id} AND "portfolioId" = ${context.portfolioId}
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
  return rows[0] ? fromMemoRow(rows[0]) : null;
}

export async function appendMemo(input: CreateMemoInput): Promise<StoredMemo> {
  if (!shouldUsePostgresByPolicy()) {
    return appendMemoToMemory(input);
  }

  try {
    return await appendMemoToPostgres(input);
  } catch (error) {
    onPostgresFailure(error, "appendMemo");
    return appendMemoToMemory(input);
  }
}

export async function listMemos(filter?: {
  symbol?: string;
  tradeId?: string;
}): Promise<StoredMemo[]> {
  if (!shouldUsePostgresByPolicy()) {
    return listMemosFromMemory(filter);
  }

  try {
    return await listMemosFromPostgres(filter);
  } catch (error) {
    onPostgresFailure(error, "listMemos");
    return listMemosFromMemory(filter);
  }
}

export async function findMemoById(id: string): Promise<StoredMemo | null> {
  if (!shouldUsePostgresByPolicy()) {
    return findMemoByIdFromMemory(id);
  }

  try {
    return await findMemoByIdFromPostgres(id);
  } catch (error) {
    onPostgresFailure(error, "findMemoById");
    return findMemoByIdFromMemory(id);
  }
}

export async function updateMemo(
  id: string,
  patch: UpdateMemoInput,
): Promise<StoredMemo | null> {
  if (!shouldUsePostgresByPolicy()) {
    return updateMemoInMemory(id, patch);
  }

  try {
    return await updateMemoInPostgres(id, patch);
  } catch (error) {
    onPostgresFailure(error, "updateMemo");
    return updateMemoInMemory(id, patch);
  }
}

export async function clearMemosForTests(): Promise<void> {
  getRuntimeState().memoLedger.length = 0;

  if (process.env.NODE_ENV === "test" || !shouldUsePostgresByPolicy()) {
    return;
  }

  if (getPersistenceMode() === "memory") {
    return;
  }

  try {
    const context = await ensureLocalContext();
    await prisma.$executeRaw`
      DELETE FROM "Memo"
      WHERE "portfolioId" = ${context.portfolioId}
    `;
  } catch (error) {
    onPostgresFailure(error, "clearMemosForTests");
  }
}
