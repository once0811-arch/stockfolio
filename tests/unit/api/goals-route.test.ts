import { describe, expect, it } from "vitest";

import { GET as GET_FORECAST } from "@/app/api/forecast/route";
import { GET as GET_GOALS, POST as POST_GOALS } from "@/app/api/goals/route";
import { clearGoalMetricsForTests } from "@/src/server/goals/goal-metrics-store";

describe("/api/goals + /api/forecast", () => {
  it("stores target/forecast/actual triple and exposes forecast view", async () => {
    await clearGoalMetricsForTests();

    const create = await POST_GOALS(
      new Request("http://localhost/api/goals", {
        method: "POST",
        body: JSON.stringify({
          taxYear: 2026,
          metricKey: "REALIZED_PNL",
          targetValue: 5000000,
          forecastValue: 3200000,
          actualValue: 2800000,
        }),
      }),
    );
    expect(create.status).toBe(201);

    const list = await GET_GOALS(
      new Request("http://localhost/api/goals?taxYear=2026", {
        method: "GET",
      }),
    );
    expect(list.status).toBe(200);

    const listPayload = (await list.json()) as {
      goals: Array<{
        taxYear: number;
        metricKey: string;
        targetValue: number;
        forecastValue: number;
        actualValue: number;
      }>;
    };

    expect(listPayload.goals).toHaveLength(1);
    expect(listPayload.goals[0]?.taxYear).toBe(2026);
    expect(listPayload.goals[0]?.metricKey).toBe("REALIZED_PNL");
    expect(listPayload.goals[0]?.targetValue).toBe(5000000);
    expect(listPayload.goals[0]?.forecastValue).toBe(3200000);
    expect(listPayload.goals[0]?.actualValue).toBe(2800000);

    const forecast = await GET_FORECAST(
      new Request("http://localhost/api/forecast?taxYear=2026", {
        method: "GET",
      }),
    );
    expect(forecast.status).toBe(200);
    const forecastPayload = (await forecast.json()) as {
      taxYear: number;
      metrics: Array<{
        metricKey: string;
        targetValue: number;
        forecastValue: number;
        actualValue: number;
      }>;
      disclaimer: string;
    };

    expect(forecastPayload.taxYear).toBe(2026);
    expect(forecastPayload.metrics).toHaveLength(1);
    expect(forecastPayload.metrics[0]?.metricKey).toBe("REALIZED_PNL");
    expect(forecastPayload.disclaimer).toContain("투자 자문이 아닙니다");
  });
});
