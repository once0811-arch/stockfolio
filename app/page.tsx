import Link from "next/link";

export default function Home() {
  return (
    <div className="page-grid">
      <section className="hero-section">
        <p className="page-title">Portfolio Ops Control Room</p>
        <p className="page-description">
          화면을 Overview, Ledger, Research 3축으로 통합해 거래-메모-검증-회고 흐름을
          끊김 없이 연결합니다.
        </p>
        <div className="hero-meta">
          <span className="badge">Local-first</span>
          <span className="badge">KRW Canonical Reporting</span>
          <span className="badge">Estimate/Actual/Target Split</span>
        </div>
        <div className="actions">
          <Link className="action-link" href="/dashboard">
            Overview
          </Link>
          <Link className="action-link" href="/transactions">
            Ledger
          </Link>
          <Link className="action-link" href="/research">
            Research
          </Link>
        </div>
      </section>

      <section className="card-grid-3">
        <article className="metric-card">
          <p className="metric-label">핵심 가치 1</p>
          <p className="metric-value">원본값 불변</p>
          <p className="page-description">
            거래 통화/수량/단가/체결일/결제일/FX snapshot을 덮어쓰지 않습니다.
          </p>
        </article>
        <article className="metric-card">
          <p className="metric-label">핵심 가치 2</p>
          <p className="metric-value">3열 분리 표기</p>
          <p className="page-description">
            목표치, 예상치, 확정치를 절대 같은 숫자로 혼합하지 않습니다.
          </p>
        </article>
        <article className="metric-card">
          <p className="metric-label">핵심 가치 3</p>
          <p className="metric-value">AI 근거 필수</p>
          <p className="page-description">
            팩트체크 결과는 citation metadata와 함께 저장하고 투자 자문은 금지합니다.
          </p>
        </article>
      </section>
    </div>
  );
}
