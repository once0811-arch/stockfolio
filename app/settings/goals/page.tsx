"use client";

import { useState } from "react";

import { Card, FormField, Table, Toast } from "@/src/ui/components";

type GoalMetricKey =
  | "REALIZED_PNL"
  | "DIVIDEND"
  | "AFTER_TAX_NET_PROFIT"
  | "LENDING_INCOME"
  | "CASH_FLOW";

type GoalMetric = {
  id: string;
  taxYear: number;
  metricKey: GoalMetricKey;
  targetValue: number;
  forecastValue: number;
  actualValue: number;
};

const METRIC_OPTIONS: Array<{ value: GoalMetricKey; label: string }> = [
  { value: "REALIZED_PNL", label: "실현손익" },
  { value: "DIVIDEND", label: "배당" },
  { value: "AFTER_TAX_NET_PROFIT", label: "세후 순수익" },
  { value: "LENDING_INCOME", label: "대차수익" },
  { value: "CASH_FLOW", label: "현금흐름" },
];

const DEFAULT_TAX_YEAR = 2026;

export default function GoalsSettingsPage() {
  const [taxYear, setTaxYear] = useState(String(DEFAULT_TAX_YEAR));
  const [metricKey, setMetricKey] = useState<GoalMetricKey>("REALIZED_PNL");
  const [targetValue, setTargetValue] = useState("0");
  const [forecastValue, setForecastValue] = useState("0");
  const [actualValue, setActualValue] = useState("0");
  const [notice, setNotice] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [goals, setGoals] = useState<GoalMetric[]>([]);

  async function loadGoals(year: number) {
    const response = await fetch(`/api/goals?taxYear=${year}`, {
      method: "GET",
      cache: "no-store",
    });
    if (!response.ok) {
      setErrorText("목표 데이터를 불러오지 못했습니다.");
      return;
    }
    const payload = (await response.json()) as { goals: GoalMetric[] };
    setGoals(payload.goals);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    setErrorText(null);

    const response = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taxYear: Number(taxYear),
        metricKey,
        targetValue: Number(targetValue),
        forecastValue: Number(forecastValue),
        actualValue: Number(actualValue),
      }),
    });

    if (!response.ok) {
      setErrorText("목표 저장에 실패했습니다.");
      return;
    }

    setNotice("목표를 저장했습니다.");
    await loadGoals(Number(taxYear));
  }

  return (
    <div className="page-grid">
      <section className="hero-section">
        <h1 className="page-title">Goals</h1>
        <p className="page-description">
          목표치(target), 예상치(forecast), 확정치(actual)를 별도 필드로 관리합니다.
        </p>
      </section>

      <Card title="연간 목표 입력">
        <form className="quick-form-grid" onSubmit={onSubmit}>
          <FormField htmlFor="goals-tax-year" label="Tax Year">
            <input
              id="goals-tax-year"
              type="number"
              value={taxYear}
              onChange={(event) => setTaxYear(event.target.value)}
              required
            />
          </FormField>
          <FormField htmlFor="goals-metric" label="Metric">
            <select
              id="goals-metric"
              value={metricKey}
              onChange={(event) => setMetricKey(event.target.value as GoalMetricKey)}
            >
              {METRIC_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>
          <FormField htmlFor="goals-target" label="Target (KRW)">
            <input
              id="goals-target"
              type="number"
              value={targetValue}
              onChange={(event) => setTargetValue(event.target.value)}
              required
            />
          </FormField>
          <FormField htmlFor="goals-forecast" label="Forecast (KRW)">
            <input
              id="goals-forecast"
              type="number"
              value={forecastValue}
              onChange={(event) => setForecastValue(event.target.value)}
              required
            />
          </FormField>
          <FormField htmlFor="goals-actual" label="Actual (KRW)">
            <input
              id="goals-actual"
              type="number"
              value={actualValue}
              onChange={(event) => setActualValue(event.target.value)}
              required
            />
          </FormField>
          <button className="btn-primary" type="submit">
            목표 저장
          </button>
          <button
            className="btn-secondary"
            type="button"
            onClick={() => {
              const parsed = Number(taxYear);
              if (!Number.isInteger(parsed)) {
                setErrorText("유효한 tax year를 입력해 주세요.");
                return;
              }
              void loadGoals(parsed);
            }}
          >
            목표 불러오기
          </button>
        </form>
        {notice ? <Toast tone="success">{notice}</Toast> : null}
        {errorText ? <Toast tone="error">{errorText}</Toast> : null}
      </Card>

      <Card title={`${taxYear} 등록 목표`}>
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
            {goals.length === 0 ? (
              <tr>
                <td colSpan={4}>등록된 목표가 없습니다.</td>
              </tr>
            ) : (
              goals.map((goal) => (
                <tr key={goal.id}>
                  <td>{goal.metricKey}</td>
                  <td>{goal.targetValue.toLocaleString("ko-KR")}</td>
                  <td>{goal.forecastValue.toLocaleString("ko-KR")}</td>
                  <td>{goal.actualValue.toLocaleString("ko-KR")}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
