import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/src/server/auth/options";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="panel">
      <h1>Dashboard</h1>
      <p>M0 scaffold is running with route protection enabled.</p>
      <p>
        Signed in as <strong>{session.user?.email ?? "unknown user"}</strong>
      </p>
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
