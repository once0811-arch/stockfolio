import { NextResponse } from "next/server";

import { listGoalMetrics } from "@/src/server/goals/goal-metrics-store";

function getCurrentTaxYear(): number {
  return new Date().getUTCFullYear();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const taxYearRaw = searchParams.get("taxYear");
  const taxYear = taxYearRaw ? Number(taxYearRaw) : getCurrentTaxYear();

  if (!Number.isInteger(taxYear) || taxYear < 2000 || taxYear > 2100) {
    return NextResponse.json({ error: "Invalid taxYear" }, { status: 400 });
  }

  try {
    const metrics = await listGoalMetrics(taxYear);
    return NextResponse.json({
      taxYear,
      metrics: metrics.map((item) => ({
        metricKey: item.metricKey,
        targetValue: item.targetValue,
        forecastValue: item.forecastValue,
        actualValue: item.actualValue,
      })),
      disclaimer: "금융 정보 제공 목적이며 투자 자문이 아닙니다.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to build forecast",
        message: error instanceof Error ? error.message : "unknown",
      },
      { status: 500 },
    );
  }
}
