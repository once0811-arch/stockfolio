export type GoalMetricTriple = {
  targetValue: number;
  forecastValue: number;
  actualValue: number;
};

export function createGoalMetricTriple(
  input: GoalMetricTriple,
): GoalMetricTriple {
  return {
    targetValue: input.targetValue,
    forecastValue: input.forecastValue,
    actualValue: input.actualValue,
  };
}
