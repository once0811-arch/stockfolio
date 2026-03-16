export default function Home() {
  return (
    <div className="panel">
      <h1>Portfolio Ops M0</h1>
      <p>Local-first scaffold is active.</p>
      <div className="actions">
        <a className="action-link" href="/dashboard">
          대시보드
        </a>
        <a className="action-link" href="/transactions">
          거래 관리
        </a>
      </div>
    </div>
  );
}
