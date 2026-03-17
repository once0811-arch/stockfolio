import type { StoredTrade } from "@/src/server/ledger/types";
import { prisma } from "@/src/db/client";
import { getDemoPortfolioTrades } from "@/src/server/ledger/demo-portfolio";
import { ensureLocalContext } from "@/src/server/persistence/local-context";
import {
  getPersistenceMode,
  onPostgresFailure,
  shouldUsePostgresByPolicy,
} from "@/src/server/persistence/mode";
import { getRuntimeState } from "@/src/server/runtime-state";

type ListTradesOptions = {
  includeDemoSeedInTests?: boolean;
};

function cloneTrade(trade: StoredTrade): StoredTrade {
  return {
    ...trade,
    asset: { ...trade.asset },
  };
}

function shouldSeedDemoPortfolio(options?: ListTradesOptions): boolean {
  if (process.env.NODE_ENV === "test") {
    return options?.includeDemoSeedInTests === true;
  }

  return true;
}

function toDate(dateText: string): Date {
  return new Date(`${dateText}T00:00:00.000Z`);
}

function toDateOnlyText(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function fromPrismaTrade(record: {
  id: string;
  side: "BUY" | "SELL" | "DIVIDEND" | "FEE" | "FX_ADJUSTMENT" | "LENDING_INCOME";
  quantity: { toNumber(): number };
  priceOriginal: { toNumber(): number };
  feeOriginal: { toNumber(): number };
  tradeDate: Date;
  settlementDate: Date;
  fxRateToKrw: { toNumber(): number };
  asset: {
    symbol: string;
    market: string;
    currency: string;
  };
}): StoredTrade {
  if (record.side !== "BUY" && record.side !== "SELL") {
    throw new Error(`Unsupported trade side in storage: ${record.side}`);
  }

  return {
    id: record.id,
    asset: {
      symbol: record.asset.symbol,
      market: record.asset.market,
      currency: record.asset.currency,
    },
    side: record.side,
    quantity: record.quantity.toNumber(),
    priceOriginal: record.priceOriginal.toNumber(),
    feeOriginal: record.feeOriginal.toNumber(),
    tradeDate: toDateOnlyText(record.tradeDate),
    settlementDate: toDateOnlyText(record.settlementDate),
    fxRateToKrw: record.fxRateToKrw.toNumber(),
  };
}

function appendTradeToMemory(trade: StoredTrade): StoredTrade {
  const runtimeState = getRuntimeState();
  const tradeLedger = runtimeState.tradeLedger;
  if (tradeLedger.some((existing) => existing.id === trade.id)) {
    throw new Error("Trade id already exists");
  }

  const immutableTrade = cloneTrade(trade);
  tradeLedger.push(immutableTrade);
  return cloneTrade(immutableTrade);
}

async function appendTradeToPostgres(trade: StoredTrade): Promise<StoredTrade> {
  const context = await ensureLocalContext();
  const asset = await prisma.asset.upsert({
    where: {
      symbol_market: {
        symbol: trade.asset.symbol,
        market: trade.asset.market,
      },
    },
    update: {
      currency: trade.asset.currency,
    },
    create: {
      symbol: trade.asset.symbol,
      market: trade.asset.market,
      currency: trade.asset.currency,
    },
  });

  const created = await prisma.trade.create({
    data: {
      id: trade.id,
      portfolioId: context.portfolioId,
      accountId: context.accountId,
      assetId: asset.id,
      side: trade.side,
      quantity: trade.quantity,
      priceOriginal: trade.priceOriginal,
      feeOriginal: trade.feeOriginal,
      currency: trade.asset.currency,
      tradeDate: toDate(trade.tradeDate),
      settlementDate: toDate(trade.settlementDate),
      fxRateToKrw: trade.fxRateToKrw,
      sourceType: "MANUAL",
    },
    include: {
      asset: true,
    },
  });

  return fromPrismaTrade(created);
}

async function seedDemoPortfolioInMemory(options?: ListTradesOptions): Promise<void> {
  const runtimeState = getRuntimeState();
  if (
    runtimeState.tradeLedger.length > 0 ||
    runtimeState.hasSeededDemoPortfolio
  ) {
    return;
  }

  if (!shouldSeedDemoPortfolio(options)) {
    return;
  }

  for (const trade of getDemoPortfolioTrades()) {
    runtimeState.tradeLedger.push(cloneTrade(trade));
  }
  runtimeState.hasSeededDemoPortfolio = true;
}

async function seedDemoPortfolioInPostgres(options?: ListTradesOptions): Promise<void> {
  if (!shouldSeedDemoPortfolio(options)) {
    return;
  }

  const context = await ensureLocalContext();
  const existingCount = await prisma.trade.count({
    where: {
      portfolioId: context.portfolioId,
    },
  });

  if (existingCount > 0) {
    return;
  }

  for (const trade of getDemoPortfolioTrades()) {
    try {
      await appendTradeToPostgres(trade);
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        (error as { code?: string }).code === "P2002"
      ) {
        continue;
      }
      throw error;
    }
  }
}

function listTradesFromMemory(): StoredTrade[] {
  return getRuntimeState().tradeLedger.map(cloneTrade);
}

async function listTradesFromPostgres(): Promise<StoredTrade[]> {
  const context = await ensureLocalContext();
  const rows = await prisma.trade.findMany({
    where: {
      portfolioId: context.portfolioId,
    },
    include: {
      asset: true,
    },
    orderBy: [{ settlementDate: "asc" }, { createdAt: "asc" }],
  });

  return rows.map(fromPrismaTrade);
}

export async function appendTrade(trade: StoredTrade): Promise<StoredTrade> {
  if (!shouldUsePostgresByPolicy()) {
    return appendTradeToMemory(trade);
  }

  try {
    return await appendTradeToPostgres(trade);
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      throw new Error("Trade id already exists");
    }
    onPostgresFailure(error, "appendTrade");
    return appendTradeToMemory(trade);
  }
}

export async function listTrades(options?: ListTradesOptions): Promise<StoredTrade[]> {
  if (!shouldUsePostgresByPolicy()) {
    await seedDemoPortfolioInMemory(options);
    return listTradesFromMemory();
  }

  try {
    await seedDemoPortfolioInPostgres(options);
    return await listTradesFromPostgres();
  } catch (error) {
    onPostgresFailure(error, "listTrades");
    await seedDemoPortfolioInMemory(options);
    return listTradesFromMemory();
  }
}

export async function clearLedgerForTests(): Promise<void> {
  const runtimeState = getRuntimeState();
  runtimeState.tradeLedger.length = 0;
  runtimeState.hasSeededDemoPortfolio = false;

  if (process.env.NODE_ENV === "test" || !shouldUsePostgresByPolicy()) {
    return;
  }

  if (getPersistenceMode() === "memory") {
    return;
  }

  try {
    const context = await ensureLocalContext();
    await prisma.trade.deleteMany({
      where: {
        portfolioId: context.portfolioId,
      },
    });
  } catch (error) {
    onPostgresFailure(error, "clearLedgerForTests");
  }
}
