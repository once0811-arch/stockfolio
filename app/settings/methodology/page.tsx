export default function MethodologyPage() {
  return (
    <div className="page-grid">
      <section className="hero-section">
        <h1 className="page-title">Methodology</h1>
        <p className="page-description">
          계산식, 기준일, 추정치의 한계를 명확히 공개합니다. 이 화면은 금융 정보 제공을
          목적으로 하며 투자 자문이 아닙니다.
        </p>
      </section>

      <section className="card-grid-2">
        <article className="panel-card">
          <p className="metric-label">손익 계산 기준</p>
          <ul className="key-list">
            <li>
              <span>실현손익</span>
              <span>매도대금 - 취득원가 - 비용</span>
            </li>
            <li>
              <span>미실현손익</span>
              <span>평가금액 - 남은 취득원가</span>
            </li>
            <li>
              <span>환산 기준 통화</span>
              <span>KRW + 원본통화 병기</span>
            </li>
          </ul>
        </article>

        <article className="panel-card">
          <p className="metric-label">상태 분리 규칙</p>
          <ul className="key-list">
            <li>
              <span>배당</span>
              <span>estimated / actual</span>
            </li>
            <li>
              <span>세금</span>
              <span>estimate / finalized</span>
            </li>
            <li>
              <span>목표 비교</span>
              <span>target / forecast / actual</span>
            </li>
          </ul>
        </article>
      </section>

      <section className="panel-card">
        <p className="metric-label">Disclaimer</p>
        <p className="page-description">
          본 서비스의 계산 결과와 AI fact-check 요약은 참고용 정보입니다. 매수/매도 추천을
          제공하지 않으며, 세무/투자 판단의 최종 책임은 사용자에게 있습니다.
        </p>
      </section>
    </div>
  );
}
