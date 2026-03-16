import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import { getMarketPrices } from "@/src/domain/market-data/market-prices";
import type { MarketPriceSeries } from "@/src/domain/market-data/types";
import { getDemoMarketPriceOverrides } from "@/src/server/ledger/demo-portfolio";
import { listTrades } from "@/src/server/ledger/in-memory-ledger";
import { listMemos } from "@/src/server/memos/in-memory-memos";
import {
  derivePortfolioOverview,
  type PortfolioHolding,
} from "@/src/server/portfolio/derive-portfolio-overview";

type MarketSnapshot = {
  symbol: string;
  currency: string;
  provider: string;
  latestClose: number;
  oneMonthChangePct: number | null;
  dividendEventCount: number;
  sparklinePath: string;
};

const KRW_FORMATTER = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0,
});

const NUMBER_FORMATTER = new Intl.NumberFormat("ko-KR", {
  maximumFractionDigits: 4,
});

function formatKrw(value: number): string {
  return KRW_FORMATTER.format(value);
}

function formatSignedKrw(value: number): string {
  const abs = KRW_FORMATTER.format(Math.abs(value));
  if (value === 0) {
    return abs;
  }
  return `${value > 0 ? "+" : "-"}${abs}`;
}

function formatSignedPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function formatQuantity(value: number): string {
  return NUMBER_FORMATTER.format(value);
}

function formatPrice(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

function buildRingGradient(holdings: PortfolioHolding[]): string {
  if (holdings.length === 0) {
    return "conic-gradient(#2a3650 0deg 360deg)";
  }

  const colors = [
    "#53c5ff",
    "#30d7b7",
    "#ffd36b",
    "#ff7a9a",
    "#95a6c9",
    "#74a7ff",
    "#f8b978",
    "#b48aff",
  ];

  let current = 0;
  const segments = holdings.slice(0, 8).map((holding, index) => {
    const sweep = holding.weight * 360;
    const start = current;
    const end = Math.min(360, current + sweep);
    current = end;
    return `${colors[index % colors.length]} ${start}deg ${end}deg`;
  });

  if (current < 360) {
    segments.push(`#2a3650 ${current}deg 360deg`);
  }

  return `conic-gradient(${segments.join(", ")})`;
}

function buildSparklinePath(values: number[]): string {
  if (values.length < 2) {
    return "M 0 50 L 100 50";
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function toMarketSnapshot(series: MarketPriceSeries): MarketSnapshot | null {
  if (series.prices.length === 0) {
    return null;
  }

  const recentPoints = series.prices.slice(-22);
  const closes = recentPoints.map((point) => point.close);
  const latestClose = closes[closes.length - 1];
  const previousClose = closes[0] ?? latestClose;
  const oneMonthChangePct =
    previousClose > 0 ? ((latestClose - previousClose) / previousClose) * 100 : null;

  return {
    symbol: series.symbol,
    currency: series.currency,
    provider: series.provider,
    latestClose,
    oneMonthChangePct,
    dividendEventCount: series.dividends.length,
    sparklinePath: buildSparklinePath(closes),
  };
}

export default async function DashboardPage() {
  noStore();

  const trades = await listTrades();
  const memos = await listMemos();
  const overview = derivePortfolioOverview({
    trades,
    memos,
    marketPricesBySymbol: getDemoMarketPriceOverrides(),
  });

  const holdings = overview.holdings;
  const ringGradient = buildRingGradient(holdings);
  const estimatedTax = 0;
  const unresolvedMemos = overview.header.unresolvedMemoCount;

  const riskAlerts: string[] = [];
  if (holdings.length === 0) {
    riskAlerts.push("거래 원장이 비어 있어 포트폴리오 리스크를 계산할 수 없습니다.");
  }
  if (overview.risk.isConcentrated && overview.risk.concentratedSymbols.length > 0) {
    riskAlerts.push(
      `집중 리스크: ${overview.risk.concentratedSymbols.join(", ")} 비중이 높습니다.`,
    );
  }
  if (unresolvedMemos > 0) {
    riskAlerts.push(`검증 대기 메모 ${unresolvedMemos}건이 남아 있습니다.`);
  }

  if (riskAlerts.length === 0) {
    riskAlerts.push("현재 기준에서 즉시 경고할 집중/검증 이슈는 없습니다.");
  }

  const marketSnapshots = (
    await Promise.all(
      holdings.slice(0, 4).map(async (holding) => {
        try {
          const series = await getMarketPrices(holding.symbol, "1mo");
          return toMarketSnapshot(series);
        } catch {
          return null;
        }
      }),
    )
  ).filter((item): item is MarketSnapshot => item !== null);

  return (
    <div className="page-grid">
      <section className="hero-section">
        <h1 className="page-title">Overview</h1>
        <p className="page-description">
          지금 필요한 판단부터 보여주도록 전체 포트폴리오 비중, 집중 리스크, 실행 우선순위를
          한 화면에서 제공합니다.
        </p>
      </section>

      <section className="kpi-grid-6">
        <article className="metric-card">
          <p className="metric-label">총자산 (estimate)</p>
          <p className="metric-value">{formatKrw(overview.totals.estimateAssetKrw)}</p>
          <p className="meta-row">종목별 최신 FX snapshot KRW 환산</p>
        </article>
        <article className="metric-card">
          <p className="metric-label">YTD 순수익 (estimate)</p>
          <p
            className={`metric-value ${
              overview.totals.estimateYtdKrw >= 0
                ? "metric-value-positive"
                : "metric-value-warning"
            }`}
          >
            {formatSignedKrw(overview.totals.estimateYtdKrw)}
          </p>
          <p className="meta-row">실현 + 미실현 합산</p>
        </article>
        <article className="metric-card">
          <p className="metric-label">실현 / 미실현 (estimate)</p>
          <p className="metric-value">
            {formatSignedKrw(overview.totals.estimateRealizedKrw)} /{" "}
            {formatSignedKrw(overview.totals.estimateUnrealizedKrw)}
          </p>
          <p className="meta-row">상태 분리 유지</p>
        </article>
        <article className="metric-card">
          <p className="metric-label">배당 (actual/estimate)</p>
          <p className="metric-value">- / -</p>
          <p className="meta-row">데이터 연결 대기</p>
        </article>
        <article className="metric-card">
          <p className="metric-label">세금 (estimate/finalized)</p>
          <p className="metric-value">{formatKrw(estimatedTax)} / -</p>
          <p className="meta-row">rule-engine 연결 대기</p>
        </article>
        <article className="metric-card">
          <p className="metric-label">미검증 메모 수</p>
          <p className="metric-value metric-value-warning">{unresolvedMemos}건</p>
          <p className="meta-row">fact-check 대기</p>
        </article>
      </section>

      <section className="card-grid-2">
        <article className="panel-card">
          <h2 className="panel-title-compact">보유 비중 (전체)</h2>
          <div
            style={{
              width: "min(220px, 100%)",
              aspectRatio: "1 / 1",
              borderRadius: "50%",
              margin: "0 auto",
              background: ringGradient,
              position: "relative",
              border: "1px solid var(--line)",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: "22%",
                borderRadius: "50%",
                border: "1px solid var(--line)",
                background: "var(--bg-card)",
                display: "grid",
                placeItems: "center",
                textAlign: "center",
              }}
            >
              <p className="metric-value">{holdings.length}</p>
              <p className="meta-row">보유 종목</p>
            </div>
          </div>

          <ul className="data-list">
            {holdings.length === 0 ? (
              <li className="data-row">보유 포지션이 없습니다.</li>
            ) : (
              holdings.map((holding) => (
                <li className="data-row" key={holding.symbol}>
                  <div className="section-header-inline">
                    <strong>{holding.symbol}</strong>
                    <span className="meta-row">{(holding.weight * 100).toFixed(1)}%</span>
                  </div>
                  <div className="allocation-track">
                    <div
                      className="allocation-fill"
                      style={{ width: `${Math.max(2, holding.weight * 100)}%` }}
                    />
                  </div>
                  <p className="meta-row">
                    평가 {formatKrw(holding.estimateValueKrw)} | 수익률{" "}
                    {formatSignedPercent(holding.unrealizedPnlRatePct)}
                  </p>
                </li>
              ))
            )}
          </ul>
        </article>

        <article className="panel-card">
          <h2 className="panel-title-compact">리스크 경고 / 다음 액션</h2>

          <ul className="alert-list">
            {riskAlerts.map((alert) => (
              <li className="alert-item" key={alert}>
                {alert}
              </li>
            ))}
          </ul>

          <p className="metric-label">실행 우선순위</p>
          <ul className="data-list">
            {overview.actions.map((action) => (
              <li className="data-row" key={action.id}>
                <div className="section-header-inline">
                  <strong>{action.label}</strong>
                  <span className={`severity-chip severity-${action.severity}`}>
                    {action.severity}
                  </span>
                </div>
                <p className="meta-row">{action.reason}</p>
                <Link className="table-link-btn" href={action.href}>
                  바로 이동
                </Link>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="panel-card">
        <h2 className="panel-title-compact">종목별 포지션</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>종목</th>
                <th>비중</th>
                <th>수량</th>
                <th>평균단가</th>
                <th>현재가</th>
                <th>수익률</th>
                <th>평가 (est KRW)</th>
              </tr>
            </thead>
            <tbody>
              {holdings.length === 0 ? (
                <tr>
                  <td colSpan={7}>보유 포지션이 없습니다.</td>
                </tr>
              ) : (
                holdings.map((holding) => (
                  <tr key={holding.symbol}>
                    <td>{holding.symbol}</td>
                    <td>{(holding.weight * 100).toFixed(1)}%</td>
                    <td>{formatQuantity(holding.openQuantity)}</td>
                    <td>
                      {formatPrice(holding.averageCostOriginal, holding.currency)}
                    </td>
                    <td>{formatPrice(holding.marketPriceOriginal, holding.currency)}</td>
                    <td>{formatSignedPercent(holding.unrealizedPnlRatePct)}</td>
                    <td>{formatKrw(holding.estimateValueKrw)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel-card">
        <h2 className="panel-title-compact">시세/배당 스냅샷 (무료 공개 API)</h2>
        <ul className="data-list">
          {marketSnapshots.length === 0 ? (
            <li className="data-row">시세 데이터를 아직 불러오지 못했습니다.</li>
          ) : (
            marketSnapshots.map((item) => (
              <li className="data-row" key={item.symbol}>
                <div className="section-header-inline">
                  <strong>{item.symbol}</strong>
                  <span className="meta-row">{item.provider}</span>
                </div>
                <svg
                  aria-hidden="true"
                  style={{ width: "100%", height: "42px", marginTop: "0.4rem" }}
                  viewBox="0 0 100 100"
                >
                  <path
                    d={item.sparklinePath}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="3"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
                <p className="meta-row">
                  최근 종가 {formatPrice(item.latestClose, item.currency)} | 1개월{" "}
                  {item.oneMonthChangePct === null
                    ? "-"
                    : formatSignedPercent(item.oneMonthChangePct)}
                </p>
                <p className="meta-row">배당 이벤트 수 {item.dividendEventCount}</p>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="panel-card" id="forecast">
        <h2 className="panel-title-compact">목표치 / 예상치 / 확정치</h2>
        <table className="triple-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Target</th>
              <th>Forecast</th>
              <th>Actual</th>
            </tr>
          </thead>
          <tbody>
            <tr data-testid="overview-triple-realized">
              <td>실현손익</td>
              <td>미설정</td>
              <td>{formatSignedKrw(overview.totals.estimateRealizedKrw)}</td>
              <td>{formatSignedKrw(overview.totals.estimateRealizedKrw)}</td>
            </tr>
            <tr>
              <td>배당</td>
              <td>미설정</td>
              <td>-</td>
              <td>-</td>
            </tr>
            <tr>
              <td>세후 순수익</td>
              <td>미설정</td>
              <td>{formatSignedKrw(overview.totals.estimateYtdKrw - estimatedTax)}</td>
              <td>{formatSignedKrw(overview.totals.estimateYtdKrw - estimatedTax)}</td>
            </tr>
            <tr>
              <td>현금흐름</td>
              <td>미설정</td>
              <td>{formatSignedKrw(overview.totals.estimateRealizedKrw)}</td>
              <td>{formatSignedKrw(overview.totals.estimateRealizedKrw)}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
