import type { Metadata } from "next";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { Do_Hyeon, JetBrains_Mono, Noto_Sans_KR } from "next/font/google";

import { getDemoMarketPriceOverrides } from "@/src/server/ledger/demo-portfolio";
import { listTrades } from "@/src/server/ledger/in-memory-ledger";
import { listMemos } from "@/src/server/memos/in-memory-memos";
import { derivePortfolioOverview } from "@/src/server/portfolio/derive-portfolio-overview";
import { AppShell, ThemeToggle, TopNav } from "@/src/ui/components";
import "@/src/ui/design-system.css";
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
  title: "Portfolio Ops Desk",
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
        <AppShell
          header={
            <>
              <div>
                <p className="ds-brand-eyebrow">Portfolio Operations</p>
                <p className="ds-brand-title">KR Overseas Equity Desk</p>
              </div>
              <div className="ds-pill-row" aria-label="market snapshot">
                <p className="ds-pill">
                  USD/KRW{" "}
                  <strong>
                    {overview.header.latestUsdKrw
                      ? overview.header.latestUsdKrw.toFixed(2)
                      : "-"}
                  </strong>
                </p>
                <p className="ds-pill">
                  YTD P/L <strong>{formatSignedPct(ytdReturnPct)}</strong>
                </p>
                <p className="ds-pill">
                  검증대기 메모 <strong>{overview.header.unresolvedMemoCount}건</strong>
                </p>
                <ThemeToggle />
              </div>
            </>
          }
          nav={
            <TopNav
              items={[
                { href: "/dashboard", label: "Overview" },
                { href: "/transactions", label: "Ledger" },
                { href: "/research", label: "Research" },
              ]}
            />
          }
          footer={
            <>
              <p>금융 정보 제공 목적이며 투자 자문이 아닙니다.</p>
              <p>
                estimate / actual / target 수치는 분리 표기되며 원본 거래값은 보존됩니다.
              </p>
              <div className="ds-footer-links">
                <Link href="/settings/methodology">Methodology</Link>
                <Link href="/settings/data-sources">Data Sources</Link>
                <Link href="/settings/goals">Goals</Link>
                <Link href="/portfolio">Portfolio</Link>
              </div>
            </>
          }
        >
          {children}
        </AppShell>
      </body>
    </html>
  );
}
