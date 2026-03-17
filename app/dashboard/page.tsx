import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import { getMarketPrices } from "@/src/domain/market-data/market-prices";
import type { MarketPriceSeries } from "@/src/domain/market-data/types";
import { getDemoMarketPriceOverrides } from "@/src/server/ledger/demo-portfolio";
import { listTrades } from "@/src/server/ledger/in-memory-ledger";
import { listMemos } from "@/src/server/memos/in-memory-memos";
import { derivePortfolioOverview } from "@/src/server/portfolio/derive-portfolio-overview";
import { Badge, Card, EmptyState, MetricTile, Table } from "@/src/ui/components";

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

function resolveRiskAlerts(input: {
  holdingsLength: number;
  isConcentrated: boolean;
  concentratedSymbols: string[];
  unresolvedMemos: number;
}): string[] {
  const alerts: string[] = [];

  if (input.holdingsLength === 0) {
    alerts.push("거래 원장이 비어 있어 포트폴리오 리스크를 계산할 수 없습니다.");
  }
  if (input.isConcentrated && input.concentratedSymbols.length > 0) {
    alerts.push(`집중 리스크: ${input.concentratedSymbols.join(", ")} 비중이 높습니다.`);
  }
  if (input.unresolvedMemos > 0) {
    alerts.push(`검증 대기 메모 ${input.unresolvedMemos}건이 남아 있습니다.`);
  }
  if (alerts.length === 0) {
    alerts.push("현재 기준에서 즉시 경고할 집중/검증 이슈는 없습니다.");
  }

  return alerts;
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
  const estimatedTax = 0;
  const unresolvedMemos = overview.header.unresolvedMemoCount;

  const riskAlerts = resolveRiskAlerts({
    holdingsLength: holdings.length,
    isConcentrated: overview.risk.isConcentrated,
    concentratedSymbols: overview.risk.concentratedSymbols,
    unresolvedMemos,
  });

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
          목표치/예상치/확정치 분리 원칙을 유지하면서 포지션, 리스크, 실행 우선순위를 한
          화면에서 확인합니다.
        </p>
        <div className="hero-meta">
          <Badge>KRW Reporting</Badge>
          <Badge tone="positive">Estimate/Actual/Target Split</Badge>
          <Badge tone="warning">No Investment Advice</Badge>
        </div>
      </section>

      <section className="kpi-grid-6">
        <MetricTile
          label="총자산 (estimate)"
          value={formatKrw(overview.totals.estimateAssetKrw)}
          description="종목별 최신 FX snapshot KRW 환산"
        />
        <MetricTile
          label="YTD 순수익 (estimate)"
          value={formatSignedKrw(overview.totals.estimateYtdKrw)}
          description="실현 + 미실현 합산"
          tone={overview.totals.estimateYtdKrw >= 0 ? "positive" : "warning"}
        />
        <MetricTile
          label="실현 / 미실현 (estimate)"
          value={`${formatSignedKrw(overview.totals.estimateRealizedKrw)} / ${formatSignedKrw(
            overview.totals.estimateUnrealizedKrw,
          )}`}
          description="상태 분리 유지"
        />
        <MetricTile label="배당 (actual/estimate)" value="- / -" description="데이터 연결 대기" />
        <MetricTile
          label="세금 (estimate/finalized)"
          value={`${formatKrw(estimatedTax)} / -`}
          description="rule-engine 연결 대기"
        />
        <MetricTile
          label="미검증 메모 수"
          value={`${unresolvedMemos}건`}
          description="fact-check 대기"
          tone="warning"
        />
      </section>

      <section className="card-grid-2">
        <Card title="보유 비중 (전체)">
          {holdings.length === 0 ? (
            <EmptyState
              title="보유 포지션이 없습니다."
              description="Ledger에서 첫 거래를 입력하면 비중이 계산됩니다."
            />
          ) : (
            <ul className="data-list">
              {holdings.map((holding) => (
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
              ))}
            </ul>
          )}
        </Card>

        <Card title="리스크 경고 / 다음 액션">
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
        </Card>
      </section>

      <Card title="종목별 포지션">
        <Table>
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
                  <td>{formatPrice(holding.averageCostOriginal, holding.currency)}</td>
                  <td>{formatPrice(holding.marketPriceOriginal, holding.currency)}</td>
                  <td>{formatSignedPercent(holding.unrealizedPnlRatePct)}</td>
                  <td>{formatKrw(holding.estimateValueKrw)}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>

      <Card title="시세/배당 스냅샷 (무료 공개 API)">
        {marketSnapshots.length === 0 ? (
          <EmptyState
            title="시세 데이터를 아직 불러오지 못했습니다."
            description="외부 데이터 제공자가 응답하면 스냅샷이 채워집니다."
          />
        ) : (
          <ul className="data-list">
            {marketSnapshots.map((item) => (
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
                    stroke="var(--ds-primary)"
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
            ))}
          </ul>
        )}
      </Card>

      <Card title="목표치 / 예상치 / 확정치" description="핵심 metric은 3열로 항상 분리 표기합니다." id="forecast">
        <Table>
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
        </Table>
      </Card>
    </div>
  );
}
