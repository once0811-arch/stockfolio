# ARCHITECTURE.md

## 1. System overview

이 서비스는 다음 5개 레이어로 나눈다.

1. **Presentation**
   - Next.js App Router pages
   - dashboard / transactions / forecast / research UI

2. **Application**
   - route handlers
   - server actions
   - orchestration services

3. **Domain**
   - ledger
   - calculations
   - goals/forecast
   - ai fact-check
   - market-data adapters

4. **Persistence**
   - Prisma repositories
   - PostgreSQL

5. **External integrations**
   - market data provider
   - FX source
   - OpenAI Responses API
   - scheduler / queue

## 2. Domain boundaries

### ledger
거래 원장을 저장하고 포지션을 재구성한다.

### calculations
실현손익, 미실현손익, 환율 영향, 배당/세금/대차 추정을 계산한다.

### goals
연간 목표와 현재 진행 상태를 비교한다.

### ai
거래 메모 기반 claim extraction, fact-check, related news orchestration을 담당한다.

### market-data
외부 provider별 adapter를 둔다.
- quotes
- dividends
- news
- fx

## 3. API shape (suggested)

### Server actions / route handlers
- `POST /api/trades/import`
- `POST /api/trades`
- `PATCH /api/trades/:id`
- `POST /api/goals`
- `POST /api/fact-check/:memoId`
- `GET /api/news`
- `GET /api/positions`
- `GET /api/forecast`

## 4. Background jobs
- daily FX sync
- daily market snapshot sync
- dividend refresh
- pending memo reminder
- cached forecast recomputation
- AI fact-check async run (optional)

## 5. Storage strategy
- 원장은 append-friendly
- snapshot은 조회 최적화용
- AI raw result는 JSON 저장
- citation은 정규화 가능하지만 MVP는 JSON + extracted fields 혼합 허용

## 6. Observability
- sync success/failure logs
- stale data counters
- AI run latency
- import parse error metrics
- calculation mismatch alerts (if fixture drift detected)

## 7. Security notes
- third-party API keys are server-only
- PII 최소화
- raw uploaded CSV는 필요 시 암호화 또는 단기 보관
- user data access always scoped by authenticated user
