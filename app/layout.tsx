import type { Metadata } from "next";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { Do_Hyeon, JetBrains_Mono, Noto_Sans_KR } from "next/font/google";

import { getDemoMarketPriceOverrides } from "@/src/server/ledger/demo-portfolio";
import { listTrades } from "@/src/server/ledger/in-memory-ledger";
import { listMemos } from "@/src/server/memos/in-memory-memos";
import { derivePortfolioOverview } from "@/src/server/portfolio/derive-portfolio-overview";
import "./globals.css";

const bodyFont = Noto_Sans_KR({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = Do_Hyeon({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

const monoFont = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Portfolio Ops Console",
  description: "Overseas equity portfolio operations system",
};

function formatSignedPct(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  noStore();

  const overview = derivePortfolioOverview({
    trades: await listTrades(),
    memos: await listMemos(),
    marketPricesBySymbol: getDemoMarketPriceOverrides(),
  });

  const investedBaseKrw =
    overview.totals.estimateAssetKrw - overview.totals.estimateUnrealizedKrw;
  const ytdReturnPct =
    investedBaseKrw > 0
      ? (overview.totals.estimateYtdKrw / investedBaseKrw) * 100
      : 0;

  return (
    <html lang="ko">
      <body
        className={`${bodyFont.variable} ${displayFont.variable} ${monoFont.variable}`}
      >
        <div className="market-grid" />
        <div className="app-shell">
          <header className="app-header">
            <div className="brand-cluster">
              <p className="brand-eyebrow">Portfolio Operations</p>
              <p className="brand-title">KR Overseas Equity Desk</p>
            </div>
            <div className="market-pill-list" aria-label="market snapshot">
              <p className="market-pill">
                USD/KRW{" "}
                <span>
                  {overview.header.latestUsdKrw
                    ? overview.header.latestUsdKrw.toFixed(2)
                    : "-"}
                </span>
              </p>
              <p className="market-pill">
                YTD P/L <span>{formatSignedPct(ytdReturnPct)}</span>
              </p>
              <p className="market-pill">
                검증대기 메모 <span>{overview.header.unresolvedMemoCount}건</span>
              </p>
            </div>
          </header>

          <nav className="app-nav" aria-label="주요 화면">
            <Link href="/dashboard">Overview</Link>
            <Link href="/transactions">Ledger</Link>
            <Link href="/research">Research</Link>
          </nav>

          <main className="app-main">{children}</main>

          <footer className="app-footer">
            <p>금융 정보 제공 목적이며 투자 자문이 아닙니다.</p>
            <p className="footer-subtle">
              estimate / actual / target 수치는 분리 표기되며 원본 거래값은 보존됩니다.
            </p>
            <div className="footer-links">
              <Link href="/settings/methodology">Methodology</Link>
              <Link href="/settings/data-sources">Data Sources</Link>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
