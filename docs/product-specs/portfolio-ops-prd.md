# Portfolio Ops PRD (Harness-Engineering Ready)

- Status: Draft v0.1
- Owner: Personal project
- Primary build target: Next.js App Router web application
- Primary user: 한국 거주 해외주식 투자자 개인
- Intent: **코딩 에이전트가 이 문서만으로도 MVP 방향을 잃지 않고 구현을 시작할 수 있게 만드는 제품 명세**

---

## 1. Product summary

해외주식 투자자의 **거래 원장, 실질 손익, 배당/세금/환율/대차 추정, 투자 가설 메모, AI fact-check, 관련 뉴스**를 하나의 흐름으로 묶는 포트폴리오 운영 서비스다.

대부분의 투자 앱은 “현재 평가금액”까지만 보여준다. 이 서비스는 그보다 한 단계 더 나아가 아래 질문에 답해야 한다.

- 올해 실현손익은 얼마인가?
- 배당과 세금을 반영하면 순수익은 얼마인가?
- 환율이 성과에 어떤 영향을 줬는가?
- 대차 수익을 포함하면 보유 전략의 기대값이 달라지는가?
- 내가 이 종목을 산 이유는 사실에 근거했는가?
- 시간이 지난 뒤 내 판단은 맞았는가?

---

## 2. Problem statement

### 2.1 User problem
해외주식 투자자는 보통 다음 문제를 겪는다.

1. **거래 기록과 성과 해석이 분리**되어 있다.  
   증권사 앱에는 거래내역이 있고, 엑셀에는 투자 일지가 있고, 뉴스는 따로 보고, 세금은 연말에야 계산한다.

2. **실질 수익이 불투명**하다.  
   주가 손익, 배당, 환율, 세금, 대차수익이 섞여 있어서 “실제로 얼마나 잘했는지” 해석하기 어렵다.

3. **투자 판단의 품질을 검증하기 어렵다.**  
   언제 왜 샀는지 남겨도, 이후 사실검증·뉴스 추적·회고가 연결되지 않는다.

4. **예상치와 확정치가 섞인다.**  
   배당 예상액, 세금 추정액, 실제 입금액, 원천징수액을 한 숫자로 취급하면 신뢰가 무너진다.

### 2.2 Opportunity
사용자에게 필요한 것은 추천 앱이 아니라, **투자 결과와 투자 판단을 운영 가능한 형태로 관리하는 시스템**이다.

---

## 3. Goals / non-goals

## 3.1 Goals
MVP 기준 목표는 다음과 같다.

1. 거래 원장 기반 포지션/손익 집계
2. 실현/미실현 손익 분리
3. 배당 actual / estimate 분리
4. 연말 기준 **목표치 / 예상치 / 확정치** 비교
5. 거래별 메모와 사후 회고 저장
6. AI fact-check + 관련 뉴스 연결
7. 계산 기준/데이터 출처를 사용자에게 설명하는 methodology 페이지 제공

## 3.2 Non-goals
MVP에서는 아래를 하지 않는다.

1. 자동 브로커 연동
2. 실거래 주문
3. 세무 신고 대행
4. 실시간 대차 가능 수량/호가 feed 연동
5. 투자 추천 또는 포트폴리오 자동 리밸런싱
6. 멀티유저 협업
7. 모바일 앱 네이티브 개발

---

## 4. Target user

### Primary persona
- 한국 거주 개인 투자자
- 미국/해외주식을 직접 거래
- 1년 이상 누적 거래가 있고, 연말 성과를 해석하고 싶음
- 배당/보유 전략과 단기 매매가 섞여 있을 수 있음
- 자신의 판단 메모를 남기고 회고하는 습관이 있음 또는 만들고 싶음

### Secondary persona
- 사이드프로젝트/포트폴리오 심사자
- 제품/운영/금융 데이터 구조화 역량을 확인하려는 면접관

---

## 5. Core jobs to be done

1. “내 포트폴리오의 연간 운영 상태를 한눈에 보고 싶다.”
2. “거래별로 왜 샀고 왜 팔았는지 남기고 싶다.”
3. “내 가설이 사실에 근거했는지 확인하고 싶다.”
4. “배당/세금/환율/대차를 반영한 순수익을 보고 싶다.”
5. “연말 목표 대비 지금 어디쯤 왔는지 알고 싶다.”

---

## 6. MVP user flows

### Flow A. 첫 진입 → 거래 입력
1. 사용자는 로그인한다.
2. 포트폴리오와 계좌를 만든다.
3. 수동 입력 또는 CSV import로 거래를 넣는다.
4. 시스템은 포지션, 평균단가, 실현/미실현 손익을 계산한다.

### Flow B. 대시보드 확인
1. 사용자는 대시보드에서 연간 요약을 본다.
2. 총 자산, YTD 손익, 배당, 세금 추정, 환율 영향, 대차 추정, 목표 대비 진행률을 확인한다.

### Flow C. 거래 메모 작성
1. 사용자는 특정 거래에 “왜 샀는지/왜 팔았는지” 메모를 남긴다.
2. 시스템은 메모를 저장하고 이후 회고 대상 상태로 관리한다.

### Flow D. AI fact-check
1. 사용자는 거래 메모에 대해 fact-check를 실행한다.
2. 시스템은 주장과 의견을 분리한다.
3. 검증 가능한 주장에 대해 근거와 반대 근거를 찾는다.
4. 관련 뉴스와 참고 링크를 함께 저장한다.

### Flow E. 연말 forecast 비교
1. 사용자는 연간 목표를 입력한다.
2. 시스템은 현재 데이터로 연말 예상치를 계산한다.
3. 확정된 값과 추정값을 구분해서 보여준다.

### Flow F. 회고
1. 일정 기간이 지나면 사용자는 거래 메모를 다시 연다.
2. “맞음 / 일부 맞음 / 틀림”과 이유를 남긴다.
3. 시스템은 거래 결과와 회고를 연결한다.

---

## 7. Information architecture

### Top-level routes
- `/dashboard`
- `/portfolio`
- `/portfolio/[portfolioId]/positions`
- `/transactions`
- `/transactions/[transactionId]`
- `/forecast`
- `/research`
- `/settings/goals`
- `/settings/methodology`
- `/settings/data-sources`

### Key views
1. **Dashboard**
   - 총 자산
   - YTD 실질 수익
   - 실현/미실현 손익
   - 예상 배당 / 확정 배당 / 목표 배당
   - 예상 세금 / 확정 세금
   - 환율 영향
   - 예상 대차수익
   - fact-check 미실행 메모 수

2. **Portfolio / Positions**
   - 종목별 보유 수량
   - 평균 매입단가
   - 평가손익
   - 배당
   - 환율 영향
   - 대차 추정
   - 상태 badge: active / closed / watch

3. **Transactions**
   - 원장형 리스트
   - 체결일 / 결제일
   - 수량 / 단가 / 수수료 / 통화
   - 메모 유무
   - 회고 상태
   - AI 검증 상태

4. **Forecast**
   - 목표치 / 예상치 / 확정치 비교
   - 연말 배당, 세금, 실현손익, 총수익 목표 진행률

5. **Research**
   - 종목 관련 뉴스
   - 거래 메모 fact-check 결과
   - 핵심 주장 / 근거 / 반례 / confidence

6. **Methodology**
   - 계산식
   - 데이터 출처
   - 마지막 업데이트 시각
   - 예상치와 확정치의 차이 설명
   - 투자 자문 아님 고지

---

## 8. Functional requirements

## 8.1 Authentication & user
### P0
- 이메일/소셜 로그인
- 사용자별 portfolio/account 분리
- 보호 라우트 적용

## 8.2 Trade ledger
### P0
- 거래 수동 입력
- CSV import
- 거래 수정/삭제
- buy/sell/dividend/fee/fx-adjustment/lending-income event 저장
- 체결일과 결제일 분리 저장
- 원본 통화 저장
- 원화 환산값 snapshot 저장

### Acceptance
- 동일 종목 다회 거래 후 포지션이 재현 가능해야 한다.
- 원장 재계산 시 원본 레코드는 변하지 않는다.

## 8.3 Position & P/L engine
### P0
- 실현손익
- 미실현손익
- 평균매입단가 또는 tax-lot 기반 보기
- 수수료 반영
- 통화별 / KRW 통합 보기

### P1
- 계좌별 분리 보기
- 태그(배당/모멘텀/장기보유 등) 기준 집계

## 8.4 Dividend engine
### P0
- actual dividend 저장
- expected dividend 계산
- ex-date / record date / pay date 저장 가능
- gross / withholding / net 분리
- 종목별 누적 배당

### Acceptance
- 실제 입금이 없는 미래 배당은 `estimated` 상태여야 한다.
- 실제 입금이 등록되면 `actual` 상태로 변경되어야 한다.

## 8.5 FX engine
### P0
- trade settlement-date FX snapshot 저장
- daily FX reference data 저장
- KRW 기준 평가/손익 표시
- FX impact 별도 분리

### Acceptance
- 사용자는 “주가 성과”와 “환율 성과”를 구분해 볼 수 있어야 한다.

## 8.6 Tax estimate engine
### P0
- tax jurisdiction = `KR_RESIDENT_OVERSEAS_EQUITY` 모드 제공
- annual tax-year grouping
- basic deduction config
- lot method config
- realized gains/losses aggregation
- foreign withholding metadata 저장
- estimate status 명시

### Constraints
- 세금 계산은 “안내용 추정치”다.
- tax logic은 하드코딩 금지, config 기반이어야 한다.
- 계산식과 기준연도는 methodology 페이지에 공개해야 한다.

## 8.7 Lending estimate engine
### P0
- 포지션별 대차 추정 수익 계산
- 수동 rate override 가능
- 계산 상태 = estimate only
- 보유일수 기준 누적 예상치 계산

### P1
- 종목군별 default borrow rate curve
- eligibility score

### Acceptance
- 대차수익은 항상 추정치 badge를 가져야 한다.
- 실제 입금 레코드가 있으면 별도 actual income event로 저장한다.

## 8.8 Goals / forecast / actual comparison
### P0
- 사용자 목표 입력
- 연말 forecast 계산
- actual 값 누적
- 3열 비교 UI: 목표치 / 예상치 / 확정치

### Metrics
- 연간 실현손익
- 연간 배당
- 연간 세후 순수익
- 연간 대차수익
- 현금흐름

## 8.9 Thesis memo & retrospective
### P0
- 거래별 memo 작성
- memo versioning
- retrospective outcome
  - correct
  - partially_correct
  - incorrect
  - unresolved
- retrospective note 작성

### P1
- “내가 자주 틀리는 근거 유형” 분석
- 반복 패턴 태깅

## 8.10 AI fact-check
### P0
- 거래 메모에서 claim extraction
- factual claim vs opinion 분리
- 최신 공개 근거 검색
- 관련 뉴스 요약
- 반대 근거/리스크 요약
- confidence score
- citation metadata 저장

### Response contract
- claims[]
- verifiable_claims[]
- opinion_claims[]
- supporting_evidence[]
- contradicting_evidence[]
- related_news[]
- confidence
- disclaimer

### Guardrails
- 투자 추천 금지
- 예측 확언 금지
- 숫자 근거가 없으면 명시적으로 불확실성 표시
- 모든 외부 근거는 링크 또는 citation metadata와 함께 저장

## 8.11 Methodology / transparency
### P0
- 데이터 출처 공개
- 계산식 공개
- last updated timestamp 공개
- estimate vs actual 설명
- tax/lending disclaimer 공개

---

## 9. Data model (conceptual)

## 9.1 Core entities
- `User`
- `Portfolio`
- `BrokerAccount`
- `Asset`
- `Trade`
- `PositionSnapshot`
- `FxRateSnapshot`
- `DividendEvent`
- `TaxRuleSet`
- `TaxEstimate`
- `LendingEstimate`
- `Goal`
- `ThesisMemo`
- `ThesisReview`
- `NewsItem`
- `FactCheckRun`
- `SourceCitation`

## 9.2 Important field choices
### Trade
- id
- user_id
- portfolio_id
- account_id
- asset_id
- side
- quantity
- price_original
- currency
- fee_original
- trade_date
- settlement_date
- fx_rate_to_krw
- memo_id?
- source_type (manual/csv/imported)
- raw_payload_json

### DividendEvent
- asset_id
- ex_date
- record_date
- pay_date
- gross_original
- withholding_original
- net_original
- currency
- fx_rate_to_krw
- status (estimated/actual)

### TaxEstimate
- tax_year
- jurisdiction
- lot_method
- realized_gain_krw
- deduction_krw
- taxable_base_krw
- estimated_tax_krw
- status (estimate/finalized)

### ThesisMemo
- trade_id
- thesis_text
- tags[]
- created_at
- updated_at

### FactCheckRun
- memo_id
- model
- status
- result_json
- created_at

---

## 10. Calculation rules (product-level)

정확한 계산식과 edge case는 `docs/CALCULATION_RULES.md`에 정의한다.  
이 PRD에서는 제품 수준 규칙만 고정한다.

1. **원본 거래 데이터는 immutable**  
   정정이 필요하면 새 이벤트 또는 수정 이력으로 남긴다.

2. **KRW는 canonical reporting currency**
   - 원본 통화는 반드시 보존
   - 모든 연간 성과 집계는 KRW 기준도 함께 계산

3. **예상치 / 확정치 분리**
   - expected dividend ≠ actual dividend
   - expected tax ≠ finalized tax
   - expected lending income ≠ actual lending income

4. **lot method configurable**
   - tax-year 기준 선택 가능해야 한다.
   - 내부 성과 보기와 세금 보기의 lot logic은 분리 가능하다.

5. **대차수익은 MVP에서 forecast-first**
   - 실제 대차 체결 데이터가 없으면 estimate only로 본다.

---

## 11. Technical architecture

## 11.1 Stack
- Frontend / BFF: Next.js App Router
- Auth: Auth.js
- DB ORM: Prisma
- DB: PostgreSQL
- Background jobs: cron or queue worker
- AI orchestration: OpenAI Responses API
- Search for fact-check/news: OpenAI web search + market/news provider adapter
- E2E: Playwright
- Unit / integration: Vitest or Jest

## 11.2 Architectural decisions
1. **App Router + server-centric data fetching**
   - 계산 집약 기능과 보호 라우트가 많으므로 server-first 구성이 적합
2. **DB는 relational**
   - 거래 원장, 포지션 스냅샷, dividend/tax/event join이 많음
3. **외부 데이터 소스는 adapter pattern**
   - price/dividend/news/fx 공급자를 교체 가능하게 설계
4. **AI features는 비동기 job 가능 구조**
   - fact-check 실행 후 결과를 저장하고 재열람 가능하게 설계
5. **문서가 에이전트 시스템의 source of truth**
   - repo-local markdown을 우선

## 11.3 Suggested project tree
```txt
AGENTS.md
README.md
docs/
  ARCHITECTURE.md
  CALCULATION_RULES.md
  DATA_SOURCES.md
  PLANS.md
  product-specs/
    portfolio-ops-prd.md
  exec-plans/
    active/
    completed/
  references/
    research-notes.md
app/
  (marketing)/
  (app)/
    dashboard/
    portfolio/
    transactions/
    forecast/
    research/
    settings/
src/
  db/
  server/
  domain/
    ledger/
    calculations/
    ai/
    market-data/
    goals/
    reporting/
tests/
  unit/
  integration/
  e2e/
```

---

## 12. External data strategy

구현 상세는 `docs/DATA_SOURCES.md`에 따르되, MVP 기본 원칙은 다음과 같다.

1. **Trade data**
   - 사용자가 입력하거나 CSV import
   - 브로커 자동 연동은 비범위

2. **Price / dividend / company news**
   - 단일 provider에 고정하지 않고 adapter로 추상화
   - `market_data_provider = AlphaVantage | Manual | FutureProvider`

3. **FX**
   - 공식 reference rate source를 우선
   - 보조 provider 가능

4. **AI fact-check**
   - 최신 공개 웹 근거 탐색 가능해야 함
   - citation metadata 저장 필수

---

## 13. Non-functional requirements

## 13.1 Auditability
- 거래 원본 변경 이력 추적 가능
- 계산 결과에 사용된 규칙 버전 추적 가능
- AI 결과에 citation trace 저장

## 13.2 Reliability
- market data fetch 실패 시 graceful degradation
- stale data badge
- last successful sync 기록

## 13.3 Security
- 개인 포트폴리오 데이터는 user scope로 격리
- 서버에서 API key 사용
- AI tool execution은 server-side only
- 민감 데이터 로그 마스킹

## 13.4 Performance
- 대시보드 initial render P95 < 2s 목표
- 거래 목록 검색/필터 반응형 유지
- calculation snapshot caching 허용

## 13.5 Legibility for agents
- 복잡한 규칙은 markdown 문서화
- 계산 로직은 pure function 위주
- domain boundary 명확화
- 거대한 god-service 금지

---

## 14. Success metrics

## Product metrics
- 거래 입력 완료율
- 메모 작성 비율
- fact-check 실행 비율
- 대시보드 재방문율
- methodology 페이지 진입률

## Quality metrics
- 계산 회귀 테스트 통과율
- AI citation presence rate
- AI fact/opinion separation accuracy
- stale data incident count
- import error rate

---

## 15. Milestones

### M0. Harness-ready scaffold
- 문서 구조 생성
- Auth / Next.js / Prisma 스캐폴드
- protected route
- base layout

### M1. Trade ledger + position engine
- 거래 입력/수정/삭제
- CSV import
- 포지션 집계
- 실현/미실현 손익

### M2. Dividend / FX / goals / forecast
- dividend event
- FX snapshot
- 연말 목표/예상/확정 비교

### M3. Thesis memo + retrospective
- 거래 메모
- 사후 평가
- 회고 리스트

### M4. AI fact-check + related news
- claim extraction
- web-backed fact-check
- citation 저장
- research page

### M5. Hardening
- methodology pages
- evals
- e2e tests
- observability
- stale-data handling

---

## 16. Risks

1. **세금 규칙 오해 리스크**
   - 완화: config-driven + methodology 공개 + estimate label
2. **외부 데이터 소스 제약**
   - 완화: provider abstraction + manual override
3. **AI hallucination**
   - 완화: citations required + no recommendation + evals
4. **예상치/확정치 혼동**
   - 완화: separate DB fields + badge + tests
5. **에이전트가 문서 없이 하드코딩**
   - 완화: AGENTS.md와 ExecPlan 절차 강제

---

## 17. Open questions
1. 세금 보기의 기본 lot method를 무엇으로 둘 것인가?
2. CSV import 포맷은 어떤 증권사 export를 1순위로 지원할 것인가?
3. 대차수익의 default 추정률은 사용자 입력으로 둘 것인가, admin curated 값으로 둘 것인가?
4. 뉴스 feed는 provider feed와 web search를 어떻게 조합할 것인가?
5. 포트폴리오 목표는 금액 중심으로 할지, 수익률 중심으로도 할지?

---

## 18. Definition of done (MVP)
아래가 모두 충족되면 MVP 완료로 본다.

- 사용자가 거래를 입력할 수 있다.
- 포지션과 실현/미실현 손익이 계산된다.
- 배당 actual/estimate가 분리되어 보인다.
- 연간 목표/예상/확정 비교가 가능하다.
- 거래별 메모와 회고를 남길 수 있다.
- 메모에 대한 AI fact-check를 실행하고 citation을 저장할 수 있다.
- methodology 페이지에서 계산 기준과 데이터 출처를 확인할 수 있다.
- 핵심 계산 로직 unit test, 핵심 흐름 e2e test가 존재한다.

---

## 19. Interview narrative (optional)
이 프로젝트는 단순 투자 앱이 아니라, **복잡한 금융 데이터와 투자 판단의 품질을 운영 가능한 제품 구조로 풀어낸 사례**로 설명할 수 있어야 한다.

핵심 메시지:
- 거래 데이터 구조화
- 예상치/확정치 분리
- 세금/배당/환율/대차의 통합 해석
- 투자 가설의 사후 검증
- AI를 “추천”이 아니라 “검증/맥락화”에 사용
