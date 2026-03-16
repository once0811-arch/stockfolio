import { listTrades } from "@/src/server/ledger/in-memory-ledger";
import { getDemoMarketPriceOverrides } from "@/src/server/ledger/demo-portfolio";
import { buildPositionsFromTrades } from "@/src/server/ledger/positions-from-trades";
import { listMemos } from "@/src/server/memos/in-memory-memos";
import { deriveTradeStatusSummary } from "@/src/server/memos/trade-status-summary";
import { TransactionsClient } from "./TransactionsClient";

export default async function TransactionsPage() {
  const memos = await listMemos();
  const initialTrades = (await listTrades()).map((trade) => ({
    ...trade,
    ...deriveTradeStatusSummary(trade.asset.symbol, memos),
  }));
  const initialPositions = buildPositionsFromTrades(
    initialTrades,
    getDemoMarketPriceOverrides(),
  );

  return (
    <TransactionsClient
      initialPositions={initialPositions}
      initialTrades={initialTrades}
    />
  );
}
