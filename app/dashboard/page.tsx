import Link from "next/link";

export default async function DashboardPage() {
  return (
    <div className="panel">
      <h1>Dashboard</h1>
      <p>M0 scaffold is running in local no-auth mode.</p>
      <div className="actions">
        <Link className="action-link" href="/transactions">
          거래 관리
        </Link>
        <Link className="action-link" href="/">
          홈으로
        </Link>
      </div>
    </div>
  );
}
