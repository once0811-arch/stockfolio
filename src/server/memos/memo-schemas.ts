import { z } from "zod";

import type { StoredMemo } from "@/src/server/memos/types";

export const memoReviewOutcomeValues = [
  "UNRESOLVED",
  "CORRECT",
  "PARTIALLY_CORRECT",
  "INCORRECT",
] as const;

export const memoFactCheckStatusValues = ["NOT_RUN", "PENDING", "COMPLETED"] as const;

export const createMemoInputSchema = z.object({
  id: z.string().min(1).optional(),
  symbol: z.string().min(1),
  tradeId: z.string().min(1).optional(),
  thesisText: z.string().min(1),
  status: z.enum(["ACTIVE", "ARCHIVED"]).optional(),
  reviewOutcome: z.enum(memoReviewOutcomeValues).optional(),
  retrospectiveNote: z.string().nullable().optional(),
  factCheckStatus: z.enum(memoFactCheckStatusValues).optional(),
  citationCount: z.number().int().min(0).optional(),
});

export const updateMemoInputSchema = z
  .object({
    thesisText: z.string().min(1).optional(),
    status: z.enum(["ACTIVE", "ARCHIVED"]).optional(),
    reviewOutcome: z.enum(memoReviewOutcomeValues).optional(),
    retrospectiveNote: z.string().nullable().optional(),
    factCheckStatus: z.enum(memoFactCheckStatusValues).optional(),
    citationCount: z.number().int().min(0).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one memo field is required",
  });

export type CreateMemoInput = z.infer<typeof createMemoInputSchema>;

export type UpdateMemoInput = z.infer<typeof updateMemoInputSchema>;

export function normalizeMemoPatch(input: UpdateMemoInput): {
  thesisText?: string;
  status?: StoredMemo["status"];
  reviewOutcome?: StoredMemo["reviewOutcome"];
  retrospectiveNote?: string | null;
  factCheckStatus?: StoredMemo["factCheckStatus"];
  citationCount?: number;
} {
  return {
    thesisText: input.thesisText,
    status: input.status,
    reviewOutcome: input.reviewOutcome,
    retrospectiveNote: input.retrospectiveNote,
    factCheckStatus: input.factCheckStatus,
    citationCount: input.citationCount,
  };
}
