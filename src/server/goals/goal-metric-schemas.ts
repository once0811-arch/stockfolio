import { z } from "zod";

import { goalMetricKeys } from "@/src/server/goals/types";

export const upsertGoalMetricInputSchema = z.object({
  taxYear: z.number().int().min(2000).max(2100),
  metricKey: z.enum(goalMetricKeys),
  targetValue: z.number(),
  forecastValue: z.number(),
  actualValue: z.number(),
});

export type UpsertGoalMetricInput = z.infer<typeof upsertGoalMetricInputSchema>;
