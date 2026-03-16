-- CreateEnum
CREATE TYPE "TradeSide" AS ENUM ('BUY', 'SELL', 'DIVIDEND', 'FEE', 'FX_ADJUSTMENT', 'LENDING_INCOME');

-- CreateEnum
CREATE TYPE "TradeSourceType" AS ENUM ('MANUAL', 'CSV', 'IMPORTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Portfolio" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "baseCurrency" TEXT NOT NULL DEFAULT 'KRW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Portfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrokerAccount" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "brokerName" TEXT NOT NULL,
    "accountAlias" TEXT NOT NULL,
    "baseCurrency" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrokerAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "market" TEXT NOT NULL,
    "name" TEXT,
    "currency" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "side" "TradeSide" NOT NULL,
    "quantity" DECIMAL(24,8) NOT NULL,
    "priceOriginal" DECIMAL(24,8) NOT NULL,
    "feeOriginal" DECIMAL(24,8) NOT NULL,
    "currency" TEXT NOT NULL,
    "tradeDate" TIMESTAMP(3) NOT NULL,
    "settlementDate" TIMESTAMP(3) NOT NULL,
    "fxRateToKrw" DECIMAL(18,8) NOT NULL,
    "sourceType" "TradeSourceType" NOT NULL DEFAULT 'MANUAL',
    "rawPayloadJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Portfolio_userId_idx" ON "Portfolio"("userId");

-- CreateIndex
CREATE INDEX "BrokerAccount_portfolioId_idx" ON "BrokerAccount"("portfolioId");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_symbol_market_key" ON "Asset"("symbol", "market");

-- CreateIndex
CREATE INDEX "Trade_portfolioId_tradeDate_idx" ON "Trade"("portfolioId", "tradeDate");

-- CreateIndex
CREATE INDEX "Trade_accountId_settlementDate_idx" ON "Trade"("accountId", "settlementDate");

-- CreateIndex
CREATE INDEX "Trade_assetId_settlementDate_idx" ON "Trade"("assetId", "settlementDate");

-- AddForeignKey
ALTER TABLE "Portfolio" ADD CONSTRAINT "Portfolio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrokerAccount" ADD CONSTRAINT "BrokerAccount_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "BrokerAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

