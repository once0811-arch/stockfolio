"use client";

import { useEffect, useMemo, useState } from "react";

import { mergeQuickTradeWithDefaults } from "@/src/server/ledger/quick-trade-defaults";

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
  memo_status: "NONE" | "ATTACHED";
  review_status: "UNRESOLVED" | "CORRECT" | "PARTIALLY_CORRECT" | "INCORRECT";
  fact_check_status: "NOT_RUN" | "PENDING" | "COMPLETED";
};

type PositionItem = {
  symbol: string;
  market: string;
  currency: string;
  openQuantity: number;
  averageCostOriginal: number;
  marketPriceOriginal: number;
  currentValueOriginal: number;
  realizedPnlOriginal: number;
  unrealizedPnlOriginal: number;
  unrealizedPnlRatePct: number;
};

type MemoItem = {
  id: string;
  symbol: string;
  tradeId: string | null;
  thesisText: string;
  createdAt: string;
  updatedAt: string;
  status: "ACTIVE" | "ARCHIVED";
  reviewOutcome: "UNRESOLVED" | "CORRECT" | "PARTIALLY_CORRECT" | "INCORRECT";
  retrospectiveNote: string | null;
  factCheckStatus: "NOT_RUN" | "PENDING" | "COMPLETED";
  citationCount: number;
};

type QuickFormState = {
  symbol: string;
  side: "BUY" | "SELL";
  quantity: string;
  priceOriginal: string;
  tradeDate: string;
};

type AdvancedFormState = {
  market: string;
  currency: string;
  feeOriginal: string;
  settlementDate: string;
  fxRateToKrw: string;
};

const initialQuickForm: QuickFormState = {
  symbol: "AAPL",
  side: "BUY",
  quantity: "10",
  priceOriginal: "100",
  tradeDate: "2026-03-16",
};

const initialAdvancedForm: AdvancedFormState = {
  market: "NASDAQ",
  currency: "USD",
  feeOriginal: "0",
  settlementDate: "2026-03-16",
  fxRateToKrw: "1300",
};

type TransactionsClientProps = {
  initialTrades: TradeItem[];
  initialPositions: PositionItem[];
};

export function TransactionsClient({
  initialTrades,
  initialPositions,
}: TransactionsClientProps) {
  const [quickForm, setQuickForm] = useState<QuickFormState>(initialQuickForm);
  const [advancedForm, setAdvancedForm] = useState<AdvancedFormState>(initialAdvancedForm);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [trades, setTrades] = useState<TradeItem[]>(initialTrades);
  const [positions, setPositions] = useState<PositionItem[]>(initialPositions);
  const [isSubmittingTrade, setIsSubmittingTrade] = useState(false);
  const [tradeError, setTradeError] = useState<string | null>(null);
  const [isFetchingFx, setIsFetchingFx] = useState(false);
  const [fxNotice, setFxNotice] = useState<string | null>(null);

  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(
    initialTrades[0]?.id ?? null,
  );
  const [memos, setMemos] = useState<MemoItem[]>([]);
  const [activeMemoId, setActiveMemoId] = useState<string | null>(null);
  const [memoDraft, setMemoDraft] = useState("");
  const [memoReviewOutcome, setMemoReviewOutcome] = useState<MemoItem["reviewOutcome"]>(
    "UNRESOLVED",
  );
  const [memoRetrospectiveNote, setMemoRetrospectiveNote] = useState("");
  const [memoError, setMemoError] = useState<string | null>(null);
  const [memoNotice, setMemoNotice] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<"ledger" | "memo">("ledger");

  const selectedTrade = useMemo(
    () =>
      trades.find((trade) => trade.id === selectedTradeId) ??
      trades[0] ??
      null,
    [selectedTradeId, trades],
  );

  const selectedSymbol = selectedTrade?.asset.symbol ?? null;

  const totalRealized = useMemo(
    () => positions.reduce((sum, item) => sum + item.realizedPnlOriginal, 0),
    [positions],
  );

  function resetMemoEditor() {
    setMemos([]);
    setActiveMemoId(null);
    setMemoDraft("");
    setMemoReviewOutcome("UNRESOLVED");
    setMemoRetrospectiveNote("");
    setMemoNotice(null);
    setMemoError(null);
  }

  useEffect(() => {
    if (!selectedSymbol) {
      return;
    }
    const controller = new AbortController();

    async function loadMemosForSymbol(symbol: string) {
      try {
        const response = await fetch(`/api/memos?symbol=${symbol}`, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          setMemoError("메모 목록을 불러오지 못했습니다.");
          return;
        }

        const payload = (await response.json()) as { memos: MemoItem[] };
        setMemos(payload.memos);
      } catch {
        if (!controller.signal.aborted) {
          setMemoError("메모 목록을 불러오는 중 네트워크 오류가 발생했습니다.");
        }
      }
    }

    void loadMemosForSymbol(selectedSymbol);

    return () => {
      controller.abort();
    };
  }, [selectedSymbol]);

  function syncSettlementDate(nextTradeDate: string) {
    setAdvancedForm((prev) => {
      if (prev.settlementDate !== quickForm.tradeDate) {
        return prev;
      }
      return { ...prev, settlementDate: nextTradeDate };
    });
  }

  async function refreshTradesAndPositions() {
    const tradeResponse = await fetch("/api/trades", {
      method: "GET",
      cache: "no-store",
    });

    const tradePayload = (await tradeResponse.json()) as {
      trades: TradeItem[];
      positions?: PositionItem[];
    };

    setTrades(tradePayload.trades);
    if (tradePayload.positions) {
      setPositions(tradePayload.positions);
    }
  }

  async function refreshMemosForSelectedSymbol() {
    if (!selectedSymbol) {
      return;
    }

    const response = await fetch(`/api/memos?symbol=${selectedSymbol}`, {
      method: "GET",
      cache: "no-store",
    });
    const payload = (await response.json()) as { memos: MemoItem[] };
    setMemos(payload.memos);
  }

  async function fetchFxSnapshot() {
    const base = advancedForm.currency.trim().toUpperCase() || "USD";
    const tradeDate = quickForm.tradeDate;

    if (!tradeDate) {
      setFxNotice("체결일을 먼저 입력해 주세요.");
      return;
    }

    if (base === "KRW") {
      setAdvancedForm((prev) => ({ ...prev, fxRateToKrw: "1" }));
      setFxNotice("KRW 기준 통화이므로 1을 적용했습니다.");
      return;
    }

    setIsFetchingFx(true);
    setFxNotice(null);

    try {
      const response = await fetch(
        `/api/fx?base=${encodeURIComponent(base)}&quote=KRW&date=${encodeURIComponent(tradeDate)}`,
        { method: "GET", cache: "no-store" },
      );

      if (!response.ok) {
        setFxNotice("환율 조회에 실패했습니다.");
        setIsFetchingFx(false);
        return;
      }

      const payload = (await response.json()) as {
        rate: number;
        date: string;
        provider: string;
      };

      setAdvancedForm((prev) => ({ ...prev, fxRateToKrw: String(payload.rate) }));
      setFxNotice(`${payload.date} ${payload.provider} 기준 환율을 반영했습니다.`);
    } catch {
      setFxNotice("환율 조회 중 네트워크 오류가 발생했습니다.");
    }

    setIsFetchingFx(false);
  }

  async function onSubmitQuickTrade(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTradeError(null);
    setIsSubmittingTrade(true);

    try {
      const merged = mergeQuickTradeWithDefaults(
        {
          symbol: quickForm.symbol,
          side: quickForm.side,
          quantity: Number(quickForm.quantity),
          priceOriginal: Number(quickForm.priceOriginal),
          tradeDate: quickForm.tradeDate,
        },
        {
          market: advancedForm.market,
          currency: advancedForm.currency,
          feeOriginal: Number(advancedForm.feeOriginal),
          settlementDate: advancedForm.settlementDate,
          fxRateToKrw: Number(advancedForm.fxRateToKrw),
        },
      );

      const response = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(merged),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        setTradeError(payload.error ?? "거래 저장에 실패했습니다.");
        setIsSubmittingTrade(false);
        return;
      }

      const payload = (await response.json()) as { trade?: { id: string } };
      await refreshTradesAndPositions();
      resetMemoEditor();
      setSelectedTradeId(payload.trade?.id ?? null);
      setMobileTab("memo");
    } catch {
      setTradeError("거래 요청 중 네트워크 오류가 발생했습니다.");
    }

    setIsSubmittingTrade(false);
  }

  function setEditingMemo(memo: MemoItem) {
    setActiveMemoId(memo.id);
    setMemoDraft(memo.thesisText);
    setMemoReviewOutcome(memo.reviewOutcome);
    setMemoRetrospectiveNote(memo.retrospectiveNote ?? "");
    setMemoNotice(null);
    setMemoError(null);
  }

  async function saveMemo() {
    if (!selectedSymbol) {
      setMemoError("먼저 거래를 선택해 주세요.");
      return;
    }

    if (!memoDraft.trim()) {
      setMemoError("메모 내용을 입력해 주세요.");
      return;
    }

    setMemoError(null);
    setMemoNotice(null);

    const endpoint = activeMemoId ? `/api/memos/${activeMemoId}` : "/api/memos";
    const method = activeMemoId ? "PATCH" : "POST";
    const body = activeMemoId
      ? {
          thesisText: memoDraft,
          reviewOutcome: memoReviewOutcome,
          retrospectiveNote: memoRetrospectiveNote || null,
        }
      : {
          symbol: selectedSymbol,
          tradeId: selectedTrade?.id ?? null,
          thesisText: memoDraft,
          reviewOutcome: memoReviewOutcome,
          retrospectiveNote: memoRetrospectiveNote || null,
        };

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      setMemoError("메모 저장에 실패했습니다.");
      return;
    }

    await Promise.all([refreshMemosForSelectedSymbol(), refreshTradesAndPositions()]);
    setMemoNotice(activeMemoId ? "메모를 수정했습니다." : "메모를 저장했습니다.");
    setActiveMemoId(null);
    setMemoDraft("");
    setMemoReviewOutcome("UNRESOLVED");
    setMemoRetrospectiveNote("");
  }

  return (
    <div className="page-grid">
      <section className="hero-section">
        <h1 className="page-title">Ledger</h1>
        <p className="page-description">
          Quick 입력으로 거래를 빠르게 기록하고, 종목별 메모를 거래 맥락에 연결합니다.
          거래 원본값은 불변으로 유지되며 상태 컬럼에서 memo/review/fact-check를 바로
          확인할 수 있습니다.
        </p>
      </section>

      <div className="mobile-tabs" role="tablist" aria-label="Ledger panels">
        <button
          aria-pressed={mobileTab === "ledger"}
          className={mobileTab === "ledger" ? "btn-primary" : "btn-secondary"}
          onClick={() => setMobileTab("ledger")}
          type="button"
        >
          거래/포지션
        </button>
        <button
          aria-pressed={mobileTab === "memo"}
          className={mobileTab === "memo" ? "btn-primary" : "btn-secondary"}
          onClick={() => setMobileTab("memo")}
          type="button"
        >
          종목 메모
        </button>
      </div>

      <div className="ledger-layout">
        <section className={`panel-card ${mobileTab === "memo" ? "mobile-hidden" : ""}`}>
          <div className="section-header-inline">
            <p className="metric-label">Quick 거래 입력</p>
            <button
              className="btn-secondary"
              onClick={() => setIsAdvancedOpen((prev) => !prev)}
              type="button"
            >
              {isAdvancedOpen ? "Advanced 닫기" : "Advanced 열기"}
            </button>
          </div>

          <form className="quick-form-grid" onSubmit={onSubmitQuickTrade}>
            <label className="field" htmlFor="quick-symbol">
              <span>종목 코드</span>
              <input
                id="quick-symbol"
                onChange={(event) =>
                  setQuickForm((prev) => ({ ...prev, symbol: event.target.value }))
                }
                required
                type="text"
                value={quickForm.symbol}
              />
            </label>
            <label className="field" htmlFor="quick-side">
              <span>매수/매도</span>
              <select
                id="quick-side"
                onChange={(event) =>
                  setQuickForm((prev) => ({
                    ...prev,
                    side: event.target.value as "BUY" | "SELL",
                  }))
                }
                value={quickForm.side}
              >
                <option value="BUY">BUY</option>
                <option value="SELL">SELL</option>
              </select>
            </label>
            <label className="field" htmlFor="quick-quantity">
              <span>수량</span>
              <input
                id="quick-quantity"
                onChange={(event) =>
                  setQuickForm((prev) => ({ ...prev, quantity: event.target.value }))
                }
                required
                step="0.0001"
                type="number"
                value={quickForm.quantity}
              />
            </label>
            <label className="field" htmlFor="quick-price">
              <span>단가</span>
              <input
                id="quick-price"
                onChange={(event) =>
                  setQuickForm((prev) => ({ ...prev, priceOriginal: event.target.value }))
                }
                required
                step="0.0001"
                type="number"
                value={quickForm.priceOriginal}
              />
            </label>
            <label className="field" htmlFor="quick-trade-date">
              <span>체결일</span>
              <input
                id="quick-trade-date"
                onChange={(event) => {
                  syncSettlementDate(event.target.value);
                  setQuickForm((prev) => ({ ...prev, tradeDate: event.target.value }));
                }}
                required
                type="date"
                value={quickForm.tradeDate}
              />
            </label>

            <button className="btn-primary" disabled={isSubmittingTrade} type="submit">
              {isSubmittingTrade ? "저장 중..." : "Quick 거래 추가"}
            </button>
          </form>

          {isAdvancedOpen ? (
            <div className="advanced-panel">
              <p className="metric-label">Advanced</p>
              <div className="quick-form-grid">
                <label className="field" htmlFor="adv-market">
                  <span>시장</span>
                  <input
                    id="adv-market"
                    onChange={(event) =>
                      setAdvancedForm((prev) => ({ ...prev, market: event.target.value }))
                    }
                    type="text"
                    value={advancedForm.market}
                  />
                </label>
                <label className="field" htmlFor="adv-currency">
                  <span>통화</span>
                  <input
                    id="adv-currency"
                    onChange={(event) =>
                      setAdvancedForm((prev) => ({ ...prev, currency: event.target.value }))
                    }
                    type="text"
                    value={advancedForm.currency}
                  />
                </label>
                <label className="field" htmlFor="adv-fee">
                  <span>수수료</span>
                  <input
                    id="adv-fee"
                    onChange={(event) =>
                      setAdvancedForm((prev) => ({ ...prev, feeOriginal: event.target.value }))
                    }
                    step="0.0001"
                    type="number"
                    value={advancedForm.feeOriginal}
                  />
                </label>
                <label className="field" htmlFor="adv-settlement-date">
                  <span>결제일</span>
                  <input
                    id="adv-settlement-date"
                    onChange={(event) =>
                      setAdvancedForm((prev) => ({ ...prev, settlementDate: event.target.value }))
                    }
                    type="date"
                    value={advancedForm.settlementDate}
                  />
                </label>
                <label className="field" htmlFor="adv-fx">
                  <span>FX snapshot</span>
                  <input
                    id="adv-fx"
                    onChange={(event) =>
                      setAdvancedForm((prev) => ({ ...prev, fxRateToKrw: event.target.value }))
                    }
                    step="0.0001"
                    type="number"
                    value={advancedForm.fxRateToKrw}
                  />
                </label>
              </div>
              <div className="actions">
                <button
                  className="btn-secondary"
                  disabled={isFetchingFx}
                  onClick={fetchFxSnapshot}
                  type="button"
                >
                  {isFetchingFx ? "환율 조회 중..." : "환율 자동조회"}
                </button>
              </div>
              {fxNotice ? <p className="status-strip">{fxNotice}</p> : null}
            </div>
          ) : null}

          {tradeError ? <p className="error-text">{tradeError}</p> : null}

          <div className="status-kpi-row">
            <article className="mini-kpi">
              <p className="metric-label">거래 수</p>
              <p className="metric-value" data-testid="trade-count">
                {trades.length}
              </p>
            </article>
            <article className="mini-kpi">
              <p className="metric-label">총 실현손익</p>
              <p className="metric-value">
                {totalRealized.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}
              </p>
            </article>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>종목</th>
                  <th>구분</th>
                  <th>수량</th>
                  <th>단가</th>
                  <th>메모</th>
                  <th>회고</th>
                  <th>AI</th>
                </tr>
              </thead>
              <tbody>
                {trades.length === 0 ? (
                  <tr>
                    <td colSpan={7}>거래가 없습니다.</td>
                  </tr>
                ) : (
                  trades.map((trade) => (
                    <tr
                      className={
                        trade.id === selectedTradeId ? "row-selected" : undefined
                      }
                      key={trade.id}
                    >
                      <td>
                        <button
                          className="table-link-btn"
                          data-testid={`trade-row-${trade.asset.symbol}`}
                          onClick={() => {
                            resetMemoEditor();
                            setSelectedTradeId(trade.id);
                            setMobileTab("memo");
                          }}
                          type="button"
                        >
                          {trade.asset.symbol}
                        </button>
                      </td>
                      <td>{trade.side}</td>
                      <td>{trade.quantity}</td>
                      <td>{trade.priceOriginal}</td>
                      <td data-testid={`memo-status-${trade.asset.symbol}`}>
                        {trade.memo_status}
                      </td>
                      <td>{trade.review_status}</td>
                      <td>{trade.fact_check_status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <ul className="data-list">
            {positions.map((position) => (
              <li
                className="data-row"
                data-testid={`position-row-${position.symbol}`}
                key={`${position.market}-${position.symbol}`}
              >
                {position.symbol} | Qty {position.openQuantity.toFixed(6)} | Price{" "}
                {Math.round(position.marketPriceOriginal)} {position.currency} | Value{" "}
                {Math.round(position.currentValueOriginal)} {position.currency} | P/L{" "}
                {Math.round(position.unrealizedPnlOriginal)} (
                {position.unrealizedPnlRatePct >= 0 ? "+" : ""}
                {position.unrealizedPnlRatePct.toFixed(2)}%)
              </li>
            ))}
          </ul>
        </section>

        <aside className={`panel-card ${mobileTab === "ledger" ? "mobile-hidden" : ""}`}>
          <p className="metric-label">종목 메모 패널</p>
          <p className="panel-title-compact">{selectedSymbol ?? "거래를 선택하세요"}</p>

          <label className="field" htmlFor="symbol-memo">
            <span>종목 메모</span>
            <textarea
              id="symbol-memo"
              onChange={(event) => setMemoDraft(event.target.value)}
              value={memoDraft}
            />
          </label>

          <div className="quick-form-grid">
            <label className="field" htmlFor="memo-review-outcome">
              <span>회고 결과</span>
              <select
                id="memo-review-outcome"
                onChange={(event) =>
                  setMemoReviewOutcome(
                    event.target.value as MemoItem["reviewOutcome"],
                  )
                }
                value={memoReviewOutcome}
              >
                <option value="UNRESOLVED">UNRESOLVED</option>
                <option value="CORRECT">CORRECT</option>
                <option value="PARTIALLY_CORRECT">PARTIALLY_CORRECT</option>
                <option value="INCORRECT">INCORRECT</option>
              </select>
            </label>
            <label className="field" htmlFor="memo-retro-note">
              <span>회고 메모</span>
              <input
                id="memo-retro-note"
                onChange={(event) => setMemoRetrospectiveNote(event.target.value)}
                type="text"
                value={memoRetrospectiveNote}
              />
            </label>
          </div>

          <div className="actions">
            <button className="btn-primary" onClick={saveMemo} type="button">
              메모 저장
            </button>
            <button
              className="btn-secondary"
              onClick={() => {
                setActiveMemoId(null);
                setMemoDraft("");
                setMemoReviewOutcome("UNRESOLVED");
                setMemoRetrospectiveNote("");
              }}
              type="button"
            >
              새 메모
            </button>
          </div>

          {memoNotice ? <p className="status-strip">{memoNotice}</p> : null}
          {memoError ? <p className="error-text">{memoError}</p> : null}

          <p className="metric-label">연결된 메모</p>
          <ul className="data-list">
            {memos.length === 0 ? (
              <li className="data-row">선택된 종목 메모가 없습니다.</li>
            ) : (
              memos.map((memo) => (
                <li className="data-row" key={memo.id}>
                  <button
                    className="table-link-btn"
                    onClick={() => setEditingMemo(memo)}
                    type="button"
                  >
                    {memo.thesisText}
                  </button>
                  <p className="meta-row">
                    {memo.reviewOutcome} | {memo.factCheckStatus} | citation {memo.citationCount}
                  </p>
                </li>
              ))
            )}
          </ul>
        </aside>
      </div>
    </div>
  );
}
