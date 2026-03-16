import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Portfolio Ops",
  description: "Overseas equity portfolio operations harness",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <div className="app-shell">
          <header className="app-header">
            <span className="brand">Portfolio Ops</span>
            <span className="stage">M0 Local Scaffold</span>
          </header>
          <main>{children}</main>
          <footer className="app-footer">
            금융 정보 제공 목적이며 투자 자문이 아닙니다.
          </footer>
        </div>
      </body>
    </html>
  );
}
