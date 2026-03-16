-- CreateEnum
CREATE TYPE "MemoLifecycleStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ReviewOutcome" AS ENUM ('UNRESOLVED', 'CORRECT', 'PARTIALLY_CORRECT', 'INCORRECT');

-- CreateEnum
CREATE TYPE "FactCheckStatus" AS ENUM ('NOT_RUN', 'PENDING', 'COMPLETED');

-- CreateTable
CREATE TABLE "Memo" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "tradeId" TEXT,
    "symbol" TEXT NOT NULL,
    "thesisText" TEXT NOT NULL,
    "status" "MemoLifecycleStatus" NOT NULL DEFAULT 'ACTIVE',
    "reviewOutcome" "ReviewOutcome" NOT NULL DEFAULT 'UNRESOLVED',
    "retrospectiveNote" TEXT,
    "factCheckStatus" "FactCheckStatus" NOT NULL DEFAULT 'NOT_RUN',
    "citationCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Memo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Portfolio_userId_name_key" ON "Portfolio"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "BrokerAccount_portfolioId_accountAlias_key" ON "BrokerAccount"("portfolioId", "accountAlias");

-- CreateIndex
CREATE INDEX "Memo_portfolioId_symbol_createdAt_idx" ON "Memo"("portfolioId", "symbol", "createdAt");

-- CreateIndex
CREATE INDEX "Memo_portfolioId_tradeId_idx" ON "Memo"("portfolioId", "tradeId");

-- AddForeignKey
ALTER TABLE "Memo" ADD CONSTRAINT "Memo_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Memo" ADD CONSTRAINT "Memo_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade"("id") ON DELETE SET NULL ON UPDATE CASCADE;
