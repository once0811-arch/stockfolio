-- CreateEnum
CREATE TYPE "GoalMetricKey" AS ENUM (
  'REALIZED_PNL',
  'DIVIDEND',
  'AFTER_TAX_NET_PROFIT',
  'LENDING_INCOME',
  'CASH_FLOW'
);

-- CreateEnum
CREATE TYPE "TaxLotMethod" AS ENUM ('AVERAGE_COST', 'FIFO', 'LIFO');

-- CreateEnum
CREATE TYPE "FactCheckRunStatus" AS ENUM ('COMPLETED');

-- CreateEnum
CREATE TYPE "CitationStance" AS ENUM (
  'SUPPORTING',
  'CONTRADICTING',
  'RELATED_NEWS'
);

-- CreateTable
CREATE TABLE "GoalMetric" (
  "id" TEXT NOT NULL,
  "portfolioId" TEXT NOT NULL,
  "taxYear" INTEGER NOT NULL,
  "metricKey" "GoalMetricKey" NOT NULL,
  "targetValue" DECIMAL(24,8) NOT NULL,
  "forecastValue" DECIMAL(24,8) NOT NULL,
  "actualValue" DECIMAL(24,8) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "GoalMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxRuleSet" (
  "id" TEXT NOT NULL,
  "portfolioId" TEXT NOT NULL,
  "taxYear" INTEGER NOT NULL,
  "jurisdiction" TEXT NOT NULL,
  "lotMethod" "TaxLotMethod" NOT NULL,
  "basicDeductionKrw" DECIMAL(24,8) NOT NULL,
  "rateTableVersion" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "TaxRuleSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FactCheckRun" (
  "id" TEXT NOT NULL,
  "portfolioId" TEXT NOT NULL,
  "memoId" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "status" "FactCheckRunStatus" NOT NULL DEFAULT 'COMPLETED',
  "confidence" DECIMAL(8,4) NOT NULL,
  "disclaimer" TEXT NOT NULL,
  "claimsJson" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "FactCheckRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceCitation" (
  "id" TEXT NOT NULL,
  "portfolioId" TEXT NOT NULL,
  "factCheckRunId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "url" TEXT,
  "publishedAt" TIMESTAMP(3),
  "stance" "CitationStance" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "SourceCitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GoalMetric_portfolioId_taxYear_metricKey_key"
ON "GoalMetric"("portfolioId", "taxYear", "metricKey");

-- CreateIndex
CREATE INDEX "GoalMetric_portfolioId_taxYear_idx"
ON "GoalMetric"("portfolioId", "taxYear");

-- CreateIndex
CREATE UNIQUE INDEX "TaxRuleSet_portfolioId_taxYear_jurisdiction_lotMethod_key"
ON "TaxRuleSet"("portfolioId", "taxYear", "jurisdiction", "lotMethod");

-- CreateIndex
CREATE INDEX "TaxRuleSet_portfolioId_taxYear_idx"
ON "TaxRuleSet"("portfolioId", "taxYear");

-- CreateIndex
CREATE INDEX "FactCheckRun_portfolioId_memoId_createdAt_idx"
ON "FactCheckRun"("portfolioId", "memoId", "createdAt");

-- CreateIndex
CREATE INDEX "SourceCitation_portfolioId_factCheckRunId_idx"
ON "SourceCitation"("portfolioId", "factCheckRunId");

-- CreateIndex
CREATE INDEX "SourceCitation_portfolioId_stance_createdAt_idx"
ON "SourceCitation"("portfolioId", "stance", "createdAt");

-- AddForeignKey
ALTER TABLE "GoalMetric"
ADD CONSTRAINT "GoalMetric_portfolioId_fkey"
FOREIGN KEY ("portfolioId")
REFERENCES "Portfolio"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxRuleSet"
ADD CONSTRAINT "TaxRuleSet_portfolioId_fkey"
FOREIGN KEY ("portfolioId")
REFERENCES "Portfolio"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FactCheckRun"
ADD CONSTRAINT "FactCheckRun_portfolioId_fkey"
FOREIGN KEY ("portfolioId")
REFERENCES "Portfolio"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FactCheckRun"
ADD CONSTRAINT "FactCheckRun_memoId_fkey"
FOREIGN KEY ("memoId")
REFERENCES "Memo"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceCitation"
ADD CONSTRAINT "SourceCitation_portfolioId_fkey"
FOREIGN KEY ("portfolioId")
REFERENCES "Portfolio"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceCitation"
ADD CONSTRAINT "SourceCitation_factCheckRunId_fkey"
FOREIGN KEY ("factCheckRunId")
REFERENCES "FactCheckRun"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
