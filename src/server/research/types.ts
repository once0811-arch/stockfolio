export const citationStances = [
  "SUPPORTING",
  "CONTRADICTING",
  "RELATED_NEWS",
] as const;

export type CitationStance = (typeof citationStances)[number];

export type StoredSourceCitation = {
  id: string;
  factCheckRunId: string;
  title: string;
  source: string;
  url: string | null;
  publishedAt: string | null;
  stance: CitationStance;
  createdAt: string;
};

export type StoredFactCheckRun = {
  id: string;
  memoId: string;
  model: string;
  status: "COMPLETED";
  confidence: number;
  disclaimer: string;
  claimsJson: string;
  createdAt: string;
  updatedAt: string;
};
