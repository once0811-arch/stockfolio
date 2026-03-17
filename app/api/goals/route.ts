import { NextResponse } from "next/server";

import { upsertGoalMetricInputSchema } from "@/src/server/goals/goal-metric-schemas";
import {
  listGoalMetrics,
  upsertGoalMetric,
} from "@/src/server/goals/goal-metrics-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const taxYearRaw = searchParams.get("taxYear");
  const taxYear = taxYearRaw ? Number(taxYearRaw) : undefined;

  if (taxYearRaw && (!Number.isInteger(taxYear) || Number(taxYearRaw) < 2000)) {
    return NextResponse.json(
      { error: "Invalid taxYear query parameter" },
      { status: 400 },
    );
  }

  try {
    const goals = await listGoalMetrics(taxYear);
    return NextResponse.json({ goals });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to list goals",
        message: error instanceof Error ? error.message : "unknown",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = upsertGoalMetricInputSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid goal payload",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const goal = await upsertGoalMetric(parsed.data);
    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to upsert goal",
        message: error instanceof Error ? error.message : "unknown",
      },
      { status: 500 },
    );
  }
}
