import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/src/server/auth/options";
import { listTrades } from "@/src/server/ledger/in-memory-ledger";
import { buildPositionsFromTrades } from "@/src/server/ledger/positions-from-trades";
import { TransactionsClient } from "./TransactionsClient";

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const initialTrades = listTrades();
  const initialPositions = buildPositionsFromTrades(initialTrades);

  return (
    <TransactionsClient
      initialPositions={initialPositions}
      initialTrades={initialTrades}
    />
  );
}
