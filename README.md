# Portfolio Ops Harness Base

이 폴더는 **해외주식 포트폴리오 종합 관리 서비스**를 에이전트 친화적으로 구현하기 위한 기본 문서 세트입니다.

## 포함 파일
- `AGENTS.md`: 코딩 에이전트용 최상위 라우팅 문서
- `docs_canonical/`: canonical repository knowledge layer
- `docs_canonical/REPO_MAP.md`: 저장소 구조와 권한 경로
- `docs_canonical/ARCHITECTURE.md`: canonical 아키텍처 요약
- `docs_canonical/WORKFLOWS.md`: 개발/작업 lifecycle 표준
- `docs_canonical/STYLEGUIDE.md`: 코딩/구조/네이밍 표준
- `docs_canonical/TESTING.md`: 테스트 전략과 품질 게이트
- `docs_canonical/TASKS.md`: 우선순위 백로그
- `docs/product-specs/portfolio-ops-prd.md`: 실행 가능한 수준의 PRD
- `docs/ARCHITECTURE.md`: 기술 아키텍처와 모듈 경계
- `docs/CALCULATION_RULES.md`: 손익/배당/세금/환율/대차 추정 계산 규칙
- `docs/DATA_SOURCES.md`: 시장데이터/환율/AI 리서치 소스 전략
- `docs/PLANS.md`: ExecPlan 작성 규칙
- `docs/exec-plans/active/TEMPLATE.md`: 기능 구현용 실행 계획 템플릿
- `docs/references/research-notes.md`: 외부 조사 근거와 링크

## 문서 사용 순서
1. `AGENTS.md`
2. `docs_canonical/REPO_MAP.md`
3. `docs_canonical/ARCHITECTURE.md`
4. `docs_canonical/WORKFLOWS.md`
5. `docs_canonical/STYLEGUIDE.md`
6. `docs_canonical/TESTING.md`
7. `docs_canonical/TASKS.md`
8. `docs/product-specs/portfolio-ops-prd.md`
9. `docs/ARCHITECTURE.md`
10. `docs/CALCULATION_RULES.md`
11. `docs/DATA_SOURCES.md`
12. 복잡한 작업이면 `docs/PLANS.md` + `docs/exec-plans/active/TEMPLATE.md`

## 설계 원칙
- **예상치 / 확정치 / 목표치 분리**
- **원본 거래 통화와 원화 환산 스냅샷 동시 보존**
- **세금 계산 로직 버전 관리**
- **AI는 추천이 아니라 검증과 맥락화에 집중**
- **문서가 시스템 오브 레코드**
- **`LLM API` 제외 인프라는 로컬 단독 실행(서버비용 0)**

## M0 로컬 실행
1. 의존성 설치
- `pnpm install`
2. 로컬 PostgreSQL 실행
- `pnpm db:start`
3. 환경변수 준비
- `.env.example`을 기준으로 `.env` 값을 확인
4. Prisma 생성/마이그레이션
- `pnpm db:generate`
- `pnpm db:migrate`
5. 개발 서버 실행
- `pnpm dev`

## 품질 게이트 명령
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:coverage`
- `pnpm test:e2e`
