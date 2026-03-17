import { Prisma } from "@prisma/client";

import { prisma } from "@/src/db/client";
import { ensureLocalContext } from "@/src/server/persistence/local-context";
import {
  getPersistenceMode,
  onPostgresFailure,
  shouldUsePostgresByPolicy,
} from "@/src/server/persistence/mode";
import { getRuntimeState } from "@/src/server/runtime-state";
import type { GoalMetricKey, StoredGoalMetric } from "@/src/server/goals/types";
import { defaultGoalMetricOrder } from "@/src/server/goals/types";

type UpsertGoalMetricInput = {
  taxYear: number;
  metricKey: GoalMetricKey;
  targetValue: number;
  forecastValue: number;
  actualValue: number;
};

type GoalMetricRow = {
  id: string;
  taxYear: number;
  metricKey: GoalMetricKey;
  targetValue: { toNumber(): number };
  forecastValue: { toNumber(): number };
  actualValue: { toNumber(): number };
  createdAt: Date;
  updatedAt: Date;
};

function sortByMetricOrder(items: StoredGoalMetric[]): StoredGoalMetric[] {
  const order = new Map(defaultGoalMetricOrder.map((key, index) => [key, index]));
  return [...items].sort((a, b) => {
    const aIndex = order.get(a.metricKey) ?? Number.MAX_SAFE_INTEGER;
    const bIndex = order.get(b.metricKey) ?? Number.MAX_SAFE_INTEGER;
    if (aIndex !== bIndex) {
      return aIndex - bIndex;
    }
    return a.taxYear - b.taxYear;
  });
}

function clone(item: StoredGoalMetric): StoredGoalMetric {
  return { ...item };
}

function fromRow(record: GoalMetricRow): StoredGoalMetric {
  return {
    id: record.id,
    taxYear: record.taxYear,
    metricKey: record.metricKey,
    targetValue: record.targetValue.toNumber(),
    forecastValue: record.forecastValue.toNumber(),
    actualValue: record.actualValue.toNumber(),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function upsertGoalMetricToMemory(input: UpsertGoalMetricInput): StoredGoalMetric {
  const ledger = getRuntimeState().goalMetrics;
  const now = new Date().toISOString();
  const existingIndex = ledger.findIndex(
    (item) => item.taxYear === input.taxYear && item.metricKey === input.metricKey,
  );

  if (existingIndex >= 0) {
    const current = ledger[existingIndex];
    const updated: StoredGoalMetric = {
      ...current,
      targetValue: input.targetValue,
      forecastValue: input.forecastValue,
      actualValue: input.actualValue,
      updatedAt: now,
    };
    ledger[existingIndex] = updated;
    return clone(updated);
  }

  const created: StoredGoalMetric = {
    id: crypto.randomUUID(),
    taxYear: input.taxYear,
    metricKey: input.metricKey,
    targetValue: input.targetValue,
    forecastValue: input.forecastValue,
    actualValue: input.actualValue,
    createdAt: now,
    updatedAt: now,
  };
  ledger.push(created);
  return clone(created);
}

async function upsertGoalMetricToPostgres(
  input: UpsertGoalMetricInput,
): Promise<StoredGoalMetric> {
  const context = await ensureLocalContext();
  const rows = await prisma.$queryRaw<GoalMetricRow[]>(Prisma.sql`
    INSERT INTO "GoalMetric" (
      "id",
      "portfolioId",
      "taxYear",
      "metricKey",
      "targetValue",
      "forecastValue",
      "actualValue",
      "updatedAt"
    )
    VALUES (
      ${crypto.randomUUID()},
      ${context.portfolioId},
      ${input.taxYear},
      ${input.metricKey}::"GoalMetricKey",
      ${input.targetValue},
      ${input.forecastValue},
      ${input.actualValue},
      ${new Date()}
    )
    ON CONFLICT ("portfolioId", "taxYear", "metricKey")
    DO UPDATE SET
      "targetValue" = EXCLUDED."targetValue",
      "forecastValue" = EXCLUDED."forecastValue",
      "actualValue" = EXCLUDED."actualValue",
      "updatedAt" = NOW()
    RETURNING
      "id",
      "taxYear",
      "metricKey",
      "targetValue",
      "forecastValue",
      "actualValue",
      "createdAt",
      "updatedAt"
  `);

  const row = rows[0];
  if (!row) {
    throw new Error("Failed to upsert goal metric");
  }

  return fromRow(row);
}

function listGoalMetricsFromMemory(taxYear?: number): StoredGoalMetric[] {
  const ledger = getRuntimeState().goalMetrics;
  const filtered =
    typeof taxYear === "number"
      ? ledger.filter((item) => item.taxYear === taxYear)
      : ledger;
  return sortByMetricOrder(filtered.map(clone));
}

async function listGoalMetricsFromPostgres(
  taxYear?: number,
): Promise<StoredGoalMetric[]> {
  const context = await ensureLocalContext();
  const conditions: Prisma.Sql[] = [Prisma.sql`"portfolioId" = ${context.portfolioId}`];
  if (typeof taxYear === "number") {
    conditions.push(Prisma.sql`"taxYear" = ${taxYear}`);
  }
  const whereSql = Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`;

  const rows = await prisma.$queryRaw<GoalMetricRow[]>(Prisma.sql`
    SELECT
      "id",
      "taxYear",
      "metricKey",
      "targetValue",
      "forecastValue",
      "actualValue",
      "createdAt",
      "updatedAt"
    FROM "GoalMetric"
    ${whereSql}
    ORDER BY "taxYear" ASC, "metricKey" ASC
  `);

  return sortByMetricOrder(rows.map(fromRow));
}

export async function upsertGoalMetric(
  input: UpsertGoalMetricInput,
): Promise<StoredGoalMetric> {
  if (!shouldUsePostgresByPolicy()) {
    return upsertGoalMetricToMemory(input);
  }

  try {
    return await upsertGoalMetricToPostgres(input);
  } catch (error) {
    onPostgresFailure(error, "upsertGoalMetric");
    return upsertGoalMetricToMemory(input);
  }
}

export async function listGoalMetrics(taxYear?: number): Promise<StoredGoalMetric[]> {
  if (!shouldUsePostgresByPolicy()) {
    return listGoalMetricsFromMemory(taxYear);
  }

  try {
    return await listGoalMetricsFromPostgres(taxYear);
  } catch (error) {
    onPostgresFailure(error, "listGoalMetrics");
    return listGoalMetricsFromMemory(taxYear);
  }
}

export async function clearGoalMetricsForTests(): Promise<void> {
  getRuntimeState().goalMetrics.length = 0;

  if (process.env.NODE_ENV === "test" || !shouldUsePostgresByPolicy()) {
    return;
  }

  if (getPersistenceMode() === "memory") {
    return;
  }

  try {
    const context = await ensureLocalContext();
    await prisma.$executeRaw`
      DELETE FROM "GoalMetric"
      WHERE "portfolioId" = ${context.portfolioId}
    `;
  } catch (error) {
    onPostgresFailure(error, "clearGoalMetricsForTests");
  }
}
