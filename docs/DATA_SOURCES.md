# DATA_SOURCES.md

## 1. Source strategy

MVP는 데이터 소스를 한 서비스에 종속시키지 않는다.  
각 기능은 adapter 인터페이스 뒤로 숨긴다.

## 2. Recommended provider mapping

### 2.1 Trade data
- source: manual input / CSV import
- reason: 브로커 자동 연동은 복잡하고 포트폴리오 데모 목적에 불필요

### 2.2 Equity prices / dividends / market news
- primary adapter candidate: Alpha Vantage
- why:
  - global equity time series
  - dividend corporate actions
  - market news & sentiment endpoint
  - forex endpoints

### 2.3 FX reference
- primary reference candidate: ECB reference rates
- why:
  - 공식 통계 기반 reference series
  - API/데이터 포털 제공

### 2.4 AI fact-check and web-backed evidence
- primary: OpenAI Responses API with web search
- why:
  - 최신 웹 근거 검색 가능
  - citation metadata를 결과와 함께 저장 가능

## 3. Adapter interfaces

### MarketDataProvider
- `getDailyPrices(symbol, from, to)`
- `getDividendEvents(symbol, from, to)`
- `getCompanyNews(symbol, from, to)`

### FxProvider
- `getDailyRate(base, quote, date)`
- `getSeries(base, quote, from, to)`

### ResearchProvider
- `factCheckMemo({ memo, ticker, dateRange })`
- `getRelatedNews({ ticker, memoKeywords })`

## 4. Data freshness policy
- price snapshots: daily
- FX reference: daily
- dividends: daily or on demand
- AI fact-check: user-triggered
- related news: on demand + short cache

## 5. Failure policy
- provider failure 시 stale badge 표기
- 마지막 성공 동기화 시각 유지
- fact-check 실패 시 raw error 대신 retryable status 반환

## 6. Important product caveats
- 데이터 공급자 응답 구조는 바뀔 수 있으므로 raw payload 일부를 저장한다.
- AI research는 최신 근거가 중요하므로 캐시 정책을 짧게 가져간다.
- 대차수익은 자동 데이터보다 추정 모델이 기본이다.
