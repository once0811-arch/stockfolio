import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { createGoalMetricTriple } from "@/src/domain/calculations/goal-metric";

describe("createGoalMetricTriple", () => {
  it("keeps target, forecast, and actual values in separate fields", () => {
    const fixturePath = resolve(
      process.cwd(),
      "tests/fixtures/calculations/goal-metric-triple.json",
    );
    const fixture = JSON.parse(
      readFileSync(fixturePath, "utf-8"),
    ) as Parameters<typeof createGoalMetricTriple>[0];

    const result = createGoalMetricTriple(fixture);

    expect(result.targetValue).toBe(1200000);
    expect(result.forecastValue).toBe(800000);
    expect(result.actualValue).toBe(450000);
    expect(new Set(Object.values(result)).size).toBe(3);
  });
});
