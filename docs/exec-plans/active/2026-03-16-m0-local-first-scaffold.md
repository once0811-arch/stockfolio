# M0 Local-First Scaffold ExecPlan

## 1. Why
현재 저장소는 문서 중심 상태이며 실행 가능한 애플리케이션 골격이 없다.  
M1 이상의 기능 구현 전에 인증, 데이터 접근, 테스트 하네스를 먼저 고정해야 이후 계산/세금/AI 기능을 안정적으로 확장할 수 있다.  
또한 이 프로젝트는 `LLM API`를 제외하면 서버비용 없이 로컬에서 동작해야 하므로 인프라 의존성을 초기에 제한해야 한다.

## 2. User-visible outcome
개발자는 로컬 환경에서 앱을 실행하고 로그인 보호 라우트와 기본 화면을 확인할 수 있다.  
초기 데이터 모델과 마이그레이션이 준비되어 거래 원장 기능 구현(M1)으로 바로 넘어갈 수 있다.  
로컬 테스트 명령(unit/e2e)과 품질 게이트가 통일된다.

## 3. Scope
- In:
- Next.js + TypeScript + Auth.js + Prisma 스캐폴드
- local PostgreSQL 연결 및 초기 migration
- 보호 라우트 1개와 base layout
- 테스트 하네스(Vitest + Playwright smoke) 초기 구성
- 품질 명령(`lint`, `typecheck`, `test`, `test:e2e`) 표준화
- 로컬 우선 인프라 원칙 문서 반영
- Out:
- 거래 CRUD/CSV import 기능
- 손익/세금/배당/환율/대차 계산 엔진 본구현
- AI fact-check 실행 로직 본구현
- 외부 데이터 provider 연동

## 4. Files / modules expected to change
- `app/` (기본 라우트 및 보호 라우트)
- `src/server/` (auth/bff 최소 구성)
- `src/db/` (Prisma client/repository 골격)
- `prisma/` (schema, migrations)
- `tests/` (unit/e2e 기본 골격)
- `package.json`, `pnpm-lock.yaml`, 설정 파일들
- `docs/*` 및 `docs_canonical/*` (표준/방법론 갱신 시)

## 5. Data model impact
- new tables:
- `User`
- `Portfolio`
- `BrokerAccount`
- `Asset`
- `Trade` (원본 필드 중심 최소 컬럼)
- changed fields:
- N/A (초기 생성)
- migrations:
- initial baseline migration 1회 생성

필수 점검 항목:
- 예상치 / 확정치 / 목표치 중 무엇을 추가/변경하는지
- M0에서는 해당 값을 직접 계산/저장하지 않는다. 다만 향후 분리를 강제할 수 있도록 상태/필드 확장 여지를 남긴다.
- KRW 환산 기준일이 무엇인지
- 정책만 고정: 거래 환산은 `settlement_date` 기준 FX snapshot을 사용한다.
- tax config 영향이 있는지
- 계산 구현은 범위 밖이지만 `tax_year`, `jurisdiction`, `lot_method`를 수용하는 스키마 확장 경로를 유지한다.
- AI feature라면 citation 저장이 어떻게 되는지
- M0에서는 AI 실행 기능을 구현하지 않는다. 이후 `SourceCitation` 저장 구조를 추가할 수 있도록 모델 경계를 유지한다.
- 사용자에게 노출되는 disclaimer가 바뀌는지
- base layout/footer에 "금융 정보 제공, 투자 자문 아님" 문구 슬롯을 준비한다.

## 6. Milestones
### M1. Scaffold and runtime baseline
- [ ] Next.js + TypeScript 프로젝트 부트스트랩
- [ ] Auth.js 최소 설정 및 보호 라우트
- [ ] Node 22 + pnpm + env 템플릿 확정

### M2. Local data and quality baseline
- [ ] Prisma schema 초안 및 local PostgreSQL 연결
- [ ] 초기 migration 적용 및 기본 seed 전략 문서화
- [ ] `lint/typecheck/test` 명령 스크립트 고정

### M3. Test harness and handoff readiness
- [ ] Vitest 기본 테스트 1개 이상
- [ ] Playwright smoke 시나리오 1개 이상
- [ ] M1 구현 착수 체크리스트 문서화

## 7. Verification
### Unit
- `pnpm test` 실행
- 최소 1개 도메인 유틸 테스트 통과

### Integration
- Prisma 연결 테스트 및 기본 repository read/write 검증
- migration 이후 앱 기동 검증

### E2E
- `pnpm test:e2e` 실행
- 비로그인 사용자 보호 라우트 접근 차단 검증

로컬 품질 게이트:
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:e2e`

## 8. Risks / rollback
- Risk: 초기 스캐폴드 선택이 M1 이후 구조를 제약할 수 있음
- Mitigation: domain boundary(`ledger`, `calculations`, `ai`, `market-data`)를 폴더 레벨로 먼저 분리
- Risk: 로컬 DB 환경 편차로 온보딩 실패 가능
- Mitigation: docker-compose 예시 또는 로컬 설치 가이드 동시 제공
- Rollback: M0에서는 초기 migration 기준으로 되돌리고 문서 상태로 복귀 가능

## 9. Decision log
- 2026-03-16: `LLM API` 제외 전 구성요소 로컬 실행 원칙 채택
- 2026-03-16: M0 범위를 scaffold/test baseline으로 제한하고 계산 엔진 본구현은 M1 이후로 분리
- 2026-03-16: canonical authority를 `docs_canonical/*` 우선으로 고정
- 2026-03-16: Prisma는 안정적인 로컬 migration 흐름을 위해 6.x 라인으로 고정

## 10. Progress
- [x] spec approved
- [x] schema updated
- [x] implementation complete
- [x] tests green
- [x] docs updated
