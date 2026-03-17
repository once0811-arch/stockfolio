import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import { getDemoMarketPriceOverrides } from "@/src/server/ledger/demo-portfolio";
import { listTrades } from "@/src/server/ledger/in-memory-ledger";
import { listMemos } from "@/src/server/memos/in-memory-memos";
import { derivePortfolioOverview } from "@/src/server/portfolio/derive-portfolio-overview";
import { Card, Table } from "@/src/ui/components";

const KRW_FORMATTER = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0,
});

export default async function PortfolioPage() {
  noStore();

  const overview = derivePortfolioOverview({
    trades: await listTrades(),
    memos: await listMemos(),
    marketPricesBySymbol: getDemoMarketPriceOverrides(),
  });

  return (
    <div className="page-grid">
      <section className="hero-section">
        <h1 className="page-title">Portfolio</h1>
        <p className="page-description">
          포트폴리오 단위로 보유 비중과 평가 금액을 확인하고 상세 포지션으로 이동합니다.
        </p>
      </section>

      <Card title="기본 포트폴리오">
        <p className="page-description">
          Local Primary Portfolio | 자산{" "}
          {KRW_FORMATTER.format(overview.totals.estimateAssetKrw)}
        </p>
        <div className="actions">
          <Link className="btn-primary" href="/portfolio/local-primary/positions">
            포지션 상세
          </Link>
          <Link className="btn-secondary" href="/dashboard">
            Overview
          </Link>
        </div>
      </Card>

      <Card title="보유 종목">
        <Table>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Weight</th>
              <th>Value (KRW est)</th>
            </tr>
          </thead>
          <tbody>
            {overview.holdings.length === 0 ? (
              <tr>
                <td colSpan={3}>보유 종목이 없습니다.</td>
              </tr>
            ) : (
              overview.holdings.map((item) => (
                <tr key={item.symbol}>
                  <td>{item.symbol}</td>
                  <td>{(item.weight * 100).toFixed(1)}%</td>
                  <td>{KRW_FORMATTER.format(item.estimateValueKrw)}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
