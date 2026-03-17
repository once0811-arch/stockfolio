# M4 Toss DS Full Rebuild ExecPlan

## 1. Why
현재 UI는 단일 `globals.css` 중심의 커스텀 스타일에 의존하고 있어 확장성과 일관성이 낮다.
또한 PRD 상의 IA(Portfolio/Goals)와 데이터 모델(목표/예상/확정, citation metadata)의 일부가 구현되지 않아 제품 핵심 가치 전달이 약하다.
이번 변경은 토스증권형 UI를 내부 디자인 시스템으로 재구축하고, Postgres 중심 저장 구조를 고정해 UX/도메인 일관성을 확보하기 위함이다.

## 2. User-visible outcome
사용자는 라이트 기본(다크 선택) 테마에서 통일된 UI 컴포넌트로 Dashboard/Ledger/Research/Settings를 이용할 수 있다.
기존 URL과 핵심 상호작용(거래 추가, 포지션 확인, 메모 저장, fact-check 실행)은 유지된다.
추가로 Portfolio/Goals 화면과 forecast 비교 흐름이 확장되며, fact-check 결과의 citation metadata가 저장된다.

## 3. Scope
- In:
- 토스 스타일 내부 디자인 시스템(토큰/프리미티브/테마 토글) 구축
- 핵심 라우트 UI 재구성(`/dashboard`, `/transactions`, `/research`, `/forecast`, `/settings/*`)
- IA 확장 라우트 추가(`/portfolio`, `/portfolio/[portfolioId]/positions`, `/settings/goals`)
- Postgres 중심 goals/fact-check citation 저장 모델 추가 및 API 확장
- 기존 E2E 계약 selector/label 유지
- Out:
- 브로커 자동 연동
- 투자 추천/자문 기능
- 모바일 네이티브 앱

## 4. Files / modules expected to change
- `app/layout.tsx`
- `app/globals.css`
- `app/page.tsx`
- `app/dashboard/page.tsx`
- `app/transactions/TransactionsClient.tsx`
- `app/research/page.tsx`
- `app/forecast/page.tsx`
- `app/settings/methodology/page.tsx`
- `app/settings/data-sources/page.tsx`
- `app/settings/goals/page.tsx` (new)
- `app/portfolio/page.tsx` (new)
- `app/portfolio/[portfolioId]/positions/page.tsx` (new)
- `app/api/goals/route.ts` (new)
- `app/api/forecast/route.ts` (new)
- `src/ui/**` (new)
- `src/server/goals/**` (new)
- `src/server/research/**` (new)
- `src/server/persistence/mode.ts`
- `app/api/fact-check/[memoId]/route.ts`
- `prisma/schema.prisma`
- `prisma/migrations/*` (new)
- `tests/unit/**` (goals/fact-check coverage 추가)

## 5. Data model impact
- new tables:
- `GoalMetric`
- `TaxRuleSet`
- `FactCheckRun`
- `SourceCitation`
- changed fields:
- `Memo` relation 확장(`factCheckRuns`)
- migrations:
- Prisma migration 추가 필요

필수 점검 항목:
- 예상치 / 확정치 / 목표치 중 무엇을 추가/변경하는지
- `GoalMetric`에 `targetValue`, `forecastValue`, `actualValue`를 분리 저장한다.
- KRW 환산 기준일이 무엇인지
- 거래 환산은 settlement-date snapshot 규칙을 유지한다.
- tax config 영향이 있는지
- `TaxRuleSet`의 `taxYear`, `jurisdiction`, `lotMethod` 키를 도입한다.
- AI feature라면 citation 저장이 어떻게 되는지
- `FactCheckRun` + `SourceCitation`에 근거 메타데이터를 저장한다.
- 사용자에게 노출되는 disclaimer가 바뀌는지
- 기존 "금융 정보 제공, 투자 자문 아님" 문구를 유지하고 화면 노출 범위를 확대한다.

## 6. Milestones
### M1.
- [ ] 디자인 시스템 토대 구축(토큰/프리미티브/테마 토글)
- [ ] 기존 테스트 계약 요소 유지 확인

### M2.
- [ ] 핵심 라우트 UI 전면 재구성
- [ ] IA 확장 라우트 구현

### M3.
- [ ] Postgres 중심 goals/fact-check citation 모델/저장 구현
- [ ] unit/integration/e2e 품질 게이트 통과

## 7. Verification
### Unit
- `pnpm test` (계산/원장/goals/fact-check 회귀)

### Integration
- Postgres persistence 경로 CRUD 검증(거래/메모/목표/citation)

### E2E
- `pnpm test:e2e`
- 거래 추가, 포지션 집계, forecast 확인, memo fact-check 실행

## 8. Risks / rollback
- Risk: 대규모 UI 변경으로 접근성/테스트 셀렉터 드리프트 가능
- Mitigation: label/role/data-testid 계약 고정
- Risk: Postgres 기본화 과정에서 로컬 미설정 환경 실패 가능
- Mitigation: 테스트/비상 fallback 유지 + 명시적 경고
- Rollback: UI/DB migration 단위로 분리 롤백 가능하도록 단계별 커밋

## 9. Decision log
- 2026-03-17: 토스 스타일은 공개 패키지 의존 대신 내부 DS로 구현한다.
- 2026-03-17: 기본 테마는 라이트, 다크는 선택형으로 제공한다.
- 2026-03-17: 기존 URL 및 핵심 E2E 계약은 유지한다.
- 2026-03-17: Postgres 중심 저장을 우선하되 테스트/비상 fallback만 허용한다.
- 2026-03-17: Playwright webServer 기동 지연에 대응해 timeout을 300000ms로 상향한다.
- 2026-03-17: fact-check 저장은 run/citation/memo 상태 갱신을 단일 저장 경로(트랜잭션)로 묶어 부분 성공 상태를 제거한다.
- 2026-03-17: `PORTFOLIO_PERSISTENCE_MODE=auto` 는 production에서 Postgres 장애 시 fail-fast, non-production에서만 memory fallback을 허용한다.
- 2026-03-18: Postgres 강제 모드 E2E 검증을 수행했고, raw SQL enum/json/jsonb 필드에 명시 cast를 추가해 persistence 타입 불일치를 제거했다.
- 2026-03-18: fact-check 트랜잭션 실패 시 memo/run/citation 롤백을 검증하는 DB integration 테스트를 추가했다.

## 10. Progress
- [x] spec approved
- [x] schema updated
- [x] implementation complete
- [x] tests green
- [x] docs updated
