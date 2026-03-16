export default function DataSourcesPage() {
  return (
    <div className="page-grid">
      <section className="hero-section">
        <h1 className="page-title">Data Sources</h1>
        <p className="page-description">
          MVP는 provider lock-in을 피하기 위해 adapter 패턴을 사용합니다. 장애 시 stale
          badge와 마지막 동기화 시각을 함께 보여줍니다.
        </p>
      </section>

      <section className="card-grid-3">
        <article className="panel-card">
          <p className="metric-label">Trade Data</p>
          <p className="metric-value">Manual / CSV</p>
          <p className="page-description">브로커 자동 연동은 MVP 비범위입니다.</p>
        </article>
        <article className="panel-card">
          <p className="metric-label">Market Data Adapter</p>
          <p className="metric-value">Yahoo chart + Stooq fallback</p>
          <p className="page-description">
            무키 무료 소스 기준으로 가격/배당을 조회하고, 실패 시 가격은 Stooq로 fallback합니다.
          </p>
        </article>
        <article className="panel-card">
          <p className="metric-label">News Feed</p>
          <p className="metric-value">Google News RSS</p>
          <p className="page-description">
            종목 검색 기반 RSS를 사용하며 개인/비상업적 feed-reader 사용 조건을 고지합니다.
          </p>
        </article>
      </section>

      <section className="panel-card">
        <p className="metric-label">Freshness policy</p>
        <table className="triple-table">
          <thead>
            <tr>
              <th>Feed</th>
              <th>Sync</th>
              <th>Fallback</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Price snapshots</td>
              <td>Daily</td>
              <td>stale badge + last success timestamp</td>
            </tr>
            <tr>
              <td>FX references</td>
              <td>Daily</td>
              <td>Frankfurter API + manual override</td>
            </tr>
            <tr>
              <td>Related news</td>
              <td>On-demand + short cache</td>
              <td>retryable status</td>
            </tr>
            <tr>
              <td>Fact-check</td>
              <td>User triggered</td>
              <td>raw error masked + rerun</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
