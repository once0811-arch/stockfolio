export const goalMetricKeys = [
  "REALIZED_PNL",
  "DIVIDEND",
  "AFTER_TAX_NET_PROFIT",
  "LENDING_INCOME",
  "CASH_FLOW",
] as const;

export type GoalMetricKey = (typeof goalMetricKeys)[number];

export type StoredGoalMetric = {
  id: string;
  taxYear: number;
  metricKey: GoalMetricKey;
  targetValue: number;
  forecastValue: number;
  actualValue: number;
  createdAt: string;
  updatedAt: string;
};

export const defaultGoalMetricOrder: GoalMetricKey[] = [
  "REALIZED_PNL",
  "DIVIDEND",
  "AFTER_TAX_NET_PROFIT",
  "LENDING_INCOME",
  "CASH_FLOW",
];
