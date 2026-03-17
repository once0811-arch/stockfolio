"use client";

import { useEffect, useMemo, useState } from "react";

import { SegmentedControl, Toast } from "@/src/ui/components";

type MemoItem = {
  id: string;
  symbol: string;
  tradeId: string | null;
  thesisText: string;
  createdAt: string;
  updatedAt: string;
  reviewOutcome: "UNRESOLVED" | "CORRECT" | "PARTIALLY_CORRECT" | "INCORRECT";
  retrospectiveNote: string | null;
  factCheckStatus: "NOT_RUN" | "PENDING" | "COMPLETED";
  citationCount: number;
};

type FactCheckPayload = {
  claims: string[];
  verifiable_claims: string[];
  opinion_claims: string[];
  supporting_evidence: Array<{ title: string; source: string }>;
  contradicting_evidence: Array<{ title: string; source: string }>;
  related_news: Array<{ title: string; source: string }>;
  citations: Array<{
    title: string;
    source: string;
    url?: string;
    publishedAt?: string;
    stance: "SUPPORTING" | "CONTRADICTING" | "RELATED_NEWS";
  }>;
  confidence: number;
  citationCount: number;
  disclaimer: string;
};

type RelatedNewsPayload = {
  symbol: string;
  provider: string;
  usageNotice: string;
  items: Array<{
    title: string;
    source: string;
    url: string;
    publishedAt: string;
  }>;
};

export default function ResearchPage() {
  const [memos, setMemos] = useState<MemoItem[]>([]);
  const [selectedMemoId, setSelectedMemoId] = useState<string | null>(null);
  const [factCheckResult, setFactCheckResult] = useState<FactCheckPayload | null>(null);
  const [statusText, setStatusText] = useState("선택된 메모가 없습니다.");
  const [queueFilter, setQueueFilter] = useState<"PENDING" | "ALL">("PENDING");
  const [relatedNews, setRelatedNews] = useState<RelatedNewsPayload["items"]>([]);
  const [newsProvider, setNewsProvider] = useState<string | null>(null);
  const [newsNotice, setNewsNotice] = useState("관련 뉴스를 아직 불러오지 않았습니다.");

  useEffect(() => {
    async function loadMemos() {
      const response = await fetch("/api/memos", { method: "GET" });
      const payload = (await response.json()) as { memos: MemoItem[] };
      setMemos(payload.memos);
      setSelectedMemoId((prev) => prev ?? payload.memos[0]?.id ?? null);
    }

    void loadMemos();
  }, []);

  const selectedMemo = useMemo(
    () => memos.find((memo) => memo.id === selectedMemoId) ?? null,
    [memos, selectedMemoId],
  );
  const pendingMemos = useMemo(
    () => memos.filter((memo) => memo.factCheckStatus !== "COMPLETED"),
    [memos],
  );
  const queueMemos = useMemo(
    () => (queueFilter === "PENDING" ? pendingMemos : memos),
    [memos, pendingMemos, queueFilter],
  );

  useEffect(() => {
    async function loadRelatedNews(symbol: string) {
      setRelatedNews([]);
      setNewsProvider(null);
      setNewsNotice("관련 뉴스를 불러오는 중...");
      const response = await fetch(
        `/api/news?symbol=${encodeURIComponent(symbol)}&max=5`,
        { method: "GET", cache: "no-store" },
      );

      if (!response.ok) {
        setRelatedNews([]);
        setNewsProvider(null);
        setNewsNotice("관련 뉴스 조회에 실패했습니다.");
        return;
      }

      const payload = (await response.json()) as RelatedNewsPayload;
      setRelatedNews(payload.items);
      setNewsProvider(payload.provider);
      setNewsNotice(payload.usageNotice);
    }

    if (!selectedMemo?.symbol) {
      return;
    }

    void loadRelatedNews(selectedMemo.symbol);
  }, [selectedMemo?.symbol]);

  async function reloadMemos() {
    const response = await fetch("/api/memos", { method: "GET" });
    const payload = (await response.json()) as { memos: MemoItem[] };
    setMemos(payload.memos);
  }

  async function runFactCheckForSelectedMemo() {
    if (!selectedMemoId) {
      setStatusText("먼저 메모를 선택해 주세요.");
      return;
    }

    setStatusText("팩트체크 실행 중...");
    const response = await fetch(`/api/fact-check/${selectedMemoId}`, {
      method: "POST",
    });

    if (!response.ok) {
      setStatusText("팩트체크 실행에 실패했습니다.");
      return;
    }

    const payload = (await response.json()) as {
      factCheck: FactCheckPayload;
    };

    setFactCheckResult(payload.factCheck);
    setStatusText(`팩트체크 완료: citation ${payload.factCheck.citationCount}`);
    await reloadMemos();
  }

  return (
    <div className="page-grid">
      <section className="hero-section">
        <h1 className="page-title">Research</h1>
        <p className="page-description">
          메모 큐에서 단일 메모를 선택하고 memo_id 단위로 fact-check를 실행합니다. 결과는
          claim 분리, 근거/반대근거, confidence, citation 상태로 요약됩니다.
        </p>
      </section>

      <section className="research-layout">
        <article className="panel-card">
            <p className="metric-label">검증 대기 메모 큐</p>
            <SegmentedControl
              ariaLabel="메모 큐 필터"
              options={[
                { value: "PENDING", label: `대기 ${pendingMemos.length}` },
                { value: "ALL", label: `전체 ${memos.length}` },
              ]}
              value={queueFilter}
              onChange={setQueueFilter}
            />
            <ul className="data-list">
            {queueMemos.length === 0 ? (
              <li className="data-row">아직 등록된 메모가 없습니다.</li>
            ) : (
              queueMemos.map((memo) => (
                <li className="data-row" key={memo.id}>
                  <button
                    className="table-link-btn"
                    onClick={() => setSelectedMemoId(memo.id)}
                    type="button"
                  >
                    {memo.symbol}
                  </button>
                  <p className="meta-row">
                    {memo.reviewOutcome} | {memo.factCheckStatus} | citation {memo.citationCount}
                  </p>
                </li>
              ))
            )}
          </ul>
        </article>

        <article className="panel-card">
          <p className="metric-label">선택 메모 본문</p>
          {selectedMemo ? (
            <>
              <p className="panel-title-compact">{selectedMemo.symbol}</p>
              <p className="status-strip">{selectedMemo.thesisText}</p>
              <p className="meta-row">
                review: {selectedMemo.reviewOutcome} | fact-check: {selectedMemo.factCheckStatus}
              </p>
              <button
                className="btn-primary"
                disabled={selectedMemo.factCheckStatus === "PENDING"}
                onClick={runFactCheckForSelectedMemo}
                type="button"
              >
                선택 메모 팩트체크
              </button>
            </>
          ) : (
            <p className="status-strip">메모를 먼저 선택해 주세요.</p>
          )}
        </article>

        <article className="panel-card">
          <p className="metric-label">Fact-check 결과</p>
          <p className="status-strip" data-testid="factcheck-citation-status">
            {statusText}
          </p>

          {factCheckResult ? (
            <>
              <ul className="data-list">
                {factCheckResult.verifiable_claims.map((item) => (
                  <li className="data-row" key={item}>
                    [Fact] {item}
                  </li>
                ))}
                {factCheckResult.opinion_claims.map((item) => (
                  <li className="data-row" key={item}>
                    [Opinion] {item}
                  </li>
                ))}
              </ul>

              <div className="status-kpi-row">
                <article className="mini-kpi">
                  <p className="metric-label">supporting</p>
                  <p className="metric-value">{factCheckResult.supporting_evidence.length}</p>
                </article>
                <article className="mini-kpi">
                  <p className="metric-label">contradicting</p>
                  <p className="metric-value">{factCheckResult.contradicting_evidence.length}</p>
                </article>
                <article className="mini-kpi">
                  <p className="metric-label">confidence</p>
                  <p className="metric-value">{factCheckResult.confidence.toFixed(2)}</p>
                </article>
              </div>

              <p className="metric-label">근거</p>
              <ul className="data-list">
                {factCheckResult.supporting_evidence.map((item) => (
                  <li className="data-row" key={`${item.title}-${item.source}-support`}>
                    [Supporting] {item.title}
                    <p className="meta-row">{item.source}</p>
                  </li>
                ))}
                {factCheckResult.contradicting_evidence.map((item) => (
                  <li className="data-row" key={`${item.title}-${item.source}-contra`}>
                    [Contradicting] {item.title}
                    <p className="meta-row">{item.source}</p>
                  </li>
                ))}
              </ul>

              <p className="metric-label">Citation metadata</p>
              <ul className="data-list">
                {factCheckResult.citations.map((item) => (
                  <li className="data-row" key={`${item.title}-${item.source}-${item.stance}`}>
                    [{item.stance}] {item.title}
                    <p className="meta-row">{item.source}</p>
                    {item.url ? (
                      <a href={item.url} rel="noreferrer" target="_blank">
                        {item.url}
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>

              <Toast>{factCheckResult.disclaimer}</Toast>
            </>
          ) : null}

          <p className="metric-label">관련 뉴스 ({newsProvider ?? "unloaded"})</p>
          <p className="meta-row">{newsNotice}</p>
          <ul className="data-list">
            {!selectedMemo ? (
              <li className="data-row">메모를 선택하면 관련 뉴스를 조회합니다.</li>
            ) : relatedNews.length === 0 ? (
              <li className="data-row">표시할 뉴스가 없습니다.</li>
            ) : (
              relatedNews.map((item) => (
                <li className="data-row" key={`${item.url}-${item.publishedAt}`}>
                  <a href={item.url} rel="noreferrer" target="_blank">
                    {item.title}
                  </a>
                  <p className="meta-row">
                    {item.source} | {item.publishedAt}
                  </p>
                </li>
              ))
            )}
          </ul>
        </article>
      </section>
    </div>
  );
}
