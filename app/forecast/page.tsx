import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import { listGoalMetrics } from "@/src/server/goals/goal-metrics-store";
import { defaultGoalMetricOrder, type GoalMetricKey } from "@/src/server/goals/types";
import { Card, Table } from "@/src/ui/components";

const KRW_FORMATTER = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0,
});

const GOAL_LABELS: Record<GoalMetricKey, string> = {
  REALIZED_PNL: "실현손익",
  DIVIDEND: "배당",
  AFTER_TAX_NET_PROFIT: "세후 순수익",
  LENDING_INCOME: "대차수익",
  CASH_FLOW: "현금흐름",
};

function formatKrw(value: number): string {
  const abs = KRW_FORMATTER.format(Math.abs(value));
  if (value === 0) {
    return abs;
  }
  return `${value > 0 ? "+" : "-"}${abs}`;
}

export default async function ForecastPage() {
  noStore();

  const taxYear = new Date().getUTCFullYear();
  const metrics = await listGoalMetrics(taxYear);
  const byKey = new Map(metrics.map((item) => [item.metricKey, item]));

  return (
    <div className="page-grid">
      <section className="hero-section">
        <h1 className="page-title">Forecast</h1>
        <p className="page-description">
          연간 목표를 기준으로 목표치/예상치/확정치를 3열로 분리해 운영합니다.
        </p>
        <div className="actions">
          <Link className="btn-primary" href="/settings/goals">
            목표 설정
          </Link>
          <Link className="btn-secondary" href="/dashboard#forecast">
            Overview 매트릭스
          </Link>
        </div>
      </section>

      <Card title={`${taxYear} 목표/예상/확정 비교`}>
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
            {defaultGoalMetricOrder.map((metricKey) => {
              const row = byKey.get(metricKey);
              return (
                <tr key={metricKey}>
                  <td>{GOAL_LABELS[metricKey]}</td>
                  <td>{row ? formatKrw(row.targetValue) : "미설정"}</td>
                  <td>{row ? formatKrw(row.forecastValue) : "미설정"}</td>
                  <td>{row ? formatKrw(row.actualValue) : "미설정"}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>

      <Card title="Disclaimer">
        <p className="page-description">
          본 화면은 금융 정보 제공 목적이며 투자 자문이 아닙니다. 세금/대차/배당 수치는
          추정치와 확정치를 분리해 표시합니다.
        </p>
      </Card>
    </div>
  );
}
