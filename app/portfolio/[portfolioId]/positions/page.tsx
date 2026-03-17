import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import { getDemoMarketPriceOverrides } from "@/src/server/ledger/demo-portfolio";
import { listTrades } from "@/src/server/ledger/in-memory-ledger";
import { buildPositionsFromTrades } from "@/src/server/ledger/positions-from-trades";
import { Card, Table } from "@/src/ui/components";

type RouteContext = {
  params: Promise<{ portfolioId: string }>;
};

export default async function PortfolioPositionsPage({ params }: RouteContext) {
  noStore();

  const { portfolioId } = await params;
  const positions = buildPositionsFromTrades(
    await listTrades(),
    getDemoMarketPriceOverrides(),
  );

  return (
    <div className="page-grid">
      <section className="hero-section">
        <h1 className="page-title">Positions</h1>
        <p className="page-description">
          Portfolio ID: {portfolioId} | 원본 통화와 수량은 그대로 유지합니다.
        </p>
        <div className="actions">
          <Link className="btn-secondary" href="/portfolio">
            Portfolio 목록
          </Link>
          <Link className="btn-primary" href="/transactions">
            Ledger
          </Link>
        </div>
      </section>

      <Card title="포지션 상세">
        <Table>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Quantity</th>
              <th>Avg Cost</th>
              <th>Market Price</th>
              <th>Unrealized P/L</th>
            </tr>
          </thead>
          <tbody>
            {positions.length === 0 ? (
              <tr>
                <td colSpan={5}>포지션이 없습니다.</td>
              </tr>
            ) : (
              positions.map((position) => (
                <tr key={`${position.market}-${position.symbol}`}>
                  <td>{position.symbol}</td>
                  <td>{position.openQuantity.toFixed(6)}</td>
                  <td>
                    {position.averageCostOriginal.toFixed(2)} {position.currency}
                  </td>
                  <td>
                    {position.marketPriceOriginal.toFixed(2)} {position.currency}
                  </td>
                  <td>
                    {position.unrealizedPnlOriginal >= 0 ? "+" : ""}
                    {position.unrealizedPnlOriginal.toFixed(2)} ({position.unrealizedPnlRatePct}
                    %)
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
