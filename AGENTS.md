# AGENTS.md

## Repository Knowledge Harness

This repository uses a canonical documentation layer
for repository knowledge.

Repository architecture, workflows, coding conventions,
and testing policies are defined in:

docs_canonical/

Agents must read these documents before performing
repository tasks.

Canonical documentation is the authoritative source
for repository behavior.

Legacy documentation may be used only for reference.

If canonical documentation conflicts with legacy documentation,
canonical documentation takes precedence.

### Canonical authority order
1. `docs_canonical/*`
2. `docs/product-specs/portfolio-ops-prd.md`
3. `docs/*.md` (except product spec)
4. other markdown files (reference only)


## Purpose
이 저장소는 **해외주식 포트폴리오 운영 서비스**를 구현한다.  
핵심 도메인은 거래 원장, 실질 손익, 배당/세금/환율/대차 추정, 투자 가설 메모, AI fact-check, 관련 뉴스다.

## Read this first
작업 전 아래 문서를 순서대로 읽는다.

1. `docs_canonical/REPO_MAP.md`
2. `docs_canonical/ARCHITECTURE.md`
3. `docs_canonical/WORKFLOWS.md`
4. `docs_canonical/STYLEGUIDE.md`
5. `docs_canonical/TESTING.md`
6. `docs_canonical/TASKS.md`
7. `docs/product-specs/portfolio-ops-prd.md`
8. `docs/ARCHITECTURE.md`
9. `docs/CALCULATION_RULES.md`
10. `docs/DATA_SOURCES.md`

## Non-negotiable product invariants
1. **예상치, 확정치, 목표치를 절대로 같은 필드로 섞지 않는다.**
2. **거래 원본값을 덮어쓰지 않는다.**
   - 원본 통화
   - 원본 수량/단가/수수료
   - 체결일 / 결제일
   - 환산용 FX snapshot
3. **세금 계산은 설정 가능한 규칙 엔진으로 구현한다.**
   - tax_year
   - jurisdiction
   - lot_method
4. **AI는 매수/매도 추천을 하지 않는다.**
   - 허용: claim extraction, fact check, evidence summary, related news, retrospective prompts
   - 금지: “지금 사라/팔아라” 류의 투자 자문
5. **모든 AI 응답은 근거 링크 또는 citation metadata를 저장해야 한다.**
6. **계산식과 데이터 출처는 문서화되지 않았으면 기능 완료로 보지 않는다.**

## Planning
다음 조건 중 하나라도 만족하면 구현 전에 ExecPlan을 만든다.
- 2개 이상 모듈을 수정함
- 새로운 DB schema 또는 migration이 필요함
- 계산 로직 또는 tax logic을 변경함
- AI agent/tool orchestration을 추가함
- UI/BE/infra를 함께 건드림

ExecPlan은 `docs/exec-plans/active/` 아래에 추가한다.
작성 규칙은 `docs/PLANS.md`를 따른다.

## Testing requirements
모든 PR은 아래 최소 기준을 만족해야 한다.

### Calculation engine
- unit tests 필수
- fixture 기반 회귀 테스트 필수
- 예상치/확정치 혼동 테스트 필수
- KRW 환산 기준일 테스트 필수

### AI features
- prompt snapshot 또는 eval dataset 필수
- citation presence 체크 필수
- opinion vs fact separation 체크 필수

### UI
- 핵심 플로우 Playwright smoke test 필수
  - 거래 추가
  - 포지션 집계
  - 연말 forecast 확인
  - 메모 fact-check 실행

## Repo map
- `docs/product-specs/`: 제품 명세
- `docs/exec-plans/`: 기능별 실행계획
- `docs/references/`: 외부 조사와 링크
- `app/`: Next.js App Router
- `src/server/`: 서버 로직
- `src/domain/ledger/`: 거래 원장
- `src/domain/calculations/`: 손익/배당/세금/환율 계산
- `src/domain/ai/`: fact-check/news orchestration
- `src/domain/market-data/`: 외부 데이터 소스 adapter
- `src/db/`: Prisma schema, repositories
- `tests/`: unit/integration/e2e

## Delivery standard
- 큰 설명은 PR 코멘트 대신 repo 안 markdown에 남긴다.
- ambiguity가 생기면 임시로 하드코딩하지 말고 config 또는 explicit TODO를 만든다.
- 화면 텍스트는 “금융 정보 제공”과 “투자 자문 아님” 경계를 유지한다.

## Infrastructure policy (local-first)
- `LLM API`를 제외한 모든 구성요소는 로컬에서 실행 가능해야 한다.
- MVP 단계에서 관리형 클라우드 서비스(DB/queue/cache/worker) 의존을 금지한다.
- 데이터 저장소는 로컬 `PostgreSQL`을 기본으로 한다.
- 스케줄/백그라운드 작업은 로컬 프로세스 기반(`cron` 또는 in-process worker)으로 시작한다.
