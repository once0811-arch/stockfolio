import type { StoredTrade } from "@/src/server/ledger/types";

const tradeLedger: StoredTrade[] = [];

function cloneTrade(trade: StoredTrade): StoredTrade {
  return {
    ...trade,
    asset: { ...trade.asset },
  };
}

export function appendTrade(trade: StoredTrade): StoredTrade {
  if (tradeLedger.some((existing) => existing.id === trade.id)) {
    throw new Error("Trade id already exists");
  }

  const immutableTrade = cloneTrade(trade);
  tradeLedger.push(immutableTrade);
  return cloneTrade(immutableTrade);
}

export function listTrades(): StoredTrade[] {
  return tradeLedger.map(cloneTrade);
}

export function clearLedgerForTests(): void {
  tradeLedger.length = 0;
}
