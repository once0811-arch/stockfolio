# DATA_SOURCES.md

## 1. Source strategy

MVP는 데이터 소스를 한 서비스에 종속시키지 않는다.  
각 기능은 adapter 인터페이스 뒤로 숨긴다.

## 2. Recommended provider mapping

### 2.1 Trade data
- source: manual input / CSV import
- reason: 브로커 자동 연동은 복잡하고 포트폴리오 데모 목적에 불필요

### 2.2 Equity prices / dividends
- primary (implemented): Yahoo Finance chart endpoint (no key)
- fallback (implemented): Stooq CSV daily prices (no key, price only)
- why:
  - key 없이 일봉 시세와 배당 이벤트 조회 가능
  - fallback source로 기본 차트 가용성 확보 가능

### 2.3 FX reference
- primary (implemented): Frankfurter API (ECB reference 기반, no key)
- why:
  - key 없이 date-based 환율 조회 가능
  - base/quote 조합 API 지원

### 2.4 Related news
- primary (implemented): Google News RSS search feed (no key)
- why:
  - symbol query 기반으로 최신 기사 목록 조회 가능
  - 별도 인증키 없이 서버 측 파싱 가능

### 2.5 AI fact-check and web-backed evidence
- primary: OpenAI Responses API with web search
- why:
  - 최신 웹 근거 검색 가능
  - citation metadata를 결과와 함께 저장 가능

## 3. Adapter interfaces

### MarketDataProvider
- `getDailyPrices(symbol, from, to)`
- `getDividendEvents(symbol, from, to)`
- `getCompanyNews(symbol, from, to)` (Google RSS adapter)

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
- Yahoo 실패 시 Stooq price fallback 사용

## 6. Important product caveats
- 데이터 공급자 응답 구조는 바뀔 수 있으므로 raw payload 일부를 저장한다.
- AI research는 최신 근거가 중요하므로 캐시 정책을 짧게 가져간다.
- 대차수익은 자동 데이터보다 추정 모델이 기본이다.
- Google News RSS는 개인/비상업적 feed-reader 사용 조건을 명시하므로, 운영 정책에 맞는 사용 범위를 고지한다.
