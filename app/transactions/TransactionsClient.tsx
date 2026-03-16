"use client";

import { useState } from "react";

type TradeItem = {
  id: string;
  asset: { symbol: string; market: string; currency: string };
  side: "BUY" | "SELL";
  quantity: number;
  priceOriginal: number;
  feeOriginal: number;
  tradeDate: string;
  settlementDate: string;
  fxRateToKrw: number;
};

type PositionItem = {
  symbol: string;
  market: string;
  currency: string;
  openQuantity: number;
  averageCostOriginal: number;
  realizedPnlOriginal: number;
  unrealizedPnlOriginal: number;
};

type FormState = {
  symbol: string;
  market: string;
  currency: string;
  side: "BUY" | "SELL";
  quantity: string;
  priceOriginal: string;
  feeOriginal: string;
  tradeDate: string;
  settlementDate: string;
  fxRateToKrw: string;
};

const initialForm: FormState = {
  symbol: "AAPL",
  market: "NASDAQ",
  currency: "USD",
  side: "BUY",
  quantity: "10",
  priceOriginal: "100",
  feeOriginal: "1",
  tradeDate: "2026-03-01",
  settlementDate: "2026-03-03",
  fxRateToKrw: "1320",
};

type TransactionsClientProps = {
  initialTrades: TradeItem[];
  initialPositions: PositionItem[];
};

export function TransactionsClient({
  initialTrades,
  initialPositions,
}: TransactionsClientProps) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [trades, setTrades] = useState<TradeItem[]>(initialTrades);
  const [positions, setPositions] = useState<PositionItem[]>(initialPositions);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function refresh() {
    const [tradeResponse, positionResponse] = await Promise.all([
      fetch("/api/trades", { method: "GET" }),
      fetch("/api/positions", { method: "GET" }),
    ]);
    const tradePayload = (await tradeResponse.json()) as { trades: TradeItem[] };
    const positionPayload = (await positionResponse.json()) as {
      positions: PositionItem[];
    };
    setTrades(tradePayload.trades);
    setPositions(positionPayload.positions);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const response = await fetch("/api/trades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: crypto.randomUUID(),
        symbol: form.symbol,
        market: form.market,
        currency: form.currency,
        side: form.side,
        quantity: Number(form.quantity),
        priceOriginal: Number(form.priceOriginal),
        feeOriginal: Number(form.feeOriginal),
        tradeDate: form.tradeDate,
        settlementDate: form.settlementDate,
        fxRateToKrw: Number(form.fxRateToKrw),
      }),
    });

    if (!response.ok) {
      setError("거래 저장에 실패했습니다.");
      setIsSubmitting(false);
      return;
    }

    await refresh();
    setIsSubmitting(false);
  }

  return (
    <div className="panel">
      <h1>거래 관리</h1>
      <p>
        수동 거래를 입력하고 현재 포지션 집계를 확인할 수 있습니다.
      </p>

      <form className="form-grid" onSubmit={onSubmit}>
        <label className="field" htmlFor="symbol">
          <span>Symbol</span>
          <input
            id="symbol"
            onChange={(event) =>
              setForm((prev) => ({ ...prev, symbol: event.target.value }))
            }
            required
            type="text"
            value={form.symbol}
          />
        </label>
        <label className="field" htmlFor="side">
          <span>Side</span>
          <select
            id="side"
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                side: event.target.value as "BUY" | "SELL",
              }))
            }
            value={form.side}
          >
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>
        </label>
        <label className="field" htmlFor="quantity">
          <span>Quantity</span>
          <input
            id="quantity"
            onChange={(event) =>
              setForm((prev) => ({ ...prev, quantity: event.target.value }))
            }
            required
            step="0.0001"
            type="number"
            value={form.quantity}
          />
        </label>
        <label className="field" htmlFor="price">
          <span>Price</span>
          <input
            id="price"
            onChange={(event) =>
              setForm((prev) => ({ ...prev, priceOriginal: event.target.value }))
            }
            required
            step="0.0001"
            type="number"
            value={form.priceOriginal}
          />
        </label>
        <label className="field" htmlFor="fee">
          <span>Fee</span>
          <input
            id="fee"
            onChange={(event) =>
              setForm((prev) => ({ ...prev, feeOriginal: event.target.value }))
            }
            required
            step="0.0001"
            type="number"
            value={form.feeOriginal}
          />
        </label>
        <button className="btn-primary" disabled={isSubmitting} type="submit">
          {isSubmitting ? "저장 중..." : "거래 추가"}
        </button>
      </form>

      {error ? <p className="error-text">{error}</p> : null}

      <section className="form-grid">
        <h2>거래 목록</h2>
        <p data-testid="trade-count">{trades.length}</p>
        {trades.map((trade) => (
          <p key={trade.id}>
            {trade.asset.symbol} {trade.side} {trade.quantity} @{" "}
            {trade.priceOriginal}
          </p>
        ))}
      </section>

      <section className="form-grid">
        <h2>포지션 집계</h2>
        {positions.map((position) => (
          <p
            data-testid={`position-row-${position.symbol}`}
            key={`${position.market}-${position.symbol}`}
          >
            {position.symbol} | Qty {position.openQuantity} | Realized{" "}
            {position.realizedPnlOriginal}
          </p>
        ))}
      </section>
    </div>
  );
}
