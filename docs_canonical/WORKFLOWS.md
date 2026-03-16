# WORKFLOWS.md

## Canonical authority workflow
1. 문서 충돌이 있으면 `docs_canonical/*`를 우선 적용한다.
2. 제품 요구사항의 상세 수치/플로우는 `docs/product-specs/portfolio-ops-prd.md`를 참조한다.
3. legacy 문서는 배경 참고용으로만 사용한다.

## 개발 워크플로우
1. `AGENTS.md`와 canonical 문서를 읽는다.
2. 변경 범위가 복잡 조건에 해당하면 ExecPlan을 먼저 작성한다.
3. 구현을 진행한다.
4. Unit/Integration/E2E 기준으로 검증한다.
5. 계산식/데이터 출처/의사결정 변경점을 문서에 반영한다.

복잡 조건(ExecPlan 필수):
- 2개 이상 모듈 수정
- DB schema/migration 변경
- 계산 또는 tax 로직 변경
- AI agent/tool orchestration 추가
- UI/BE/infra 동시 변경

## Agent Task Lifecycle
표준 루프:
- Plan: 범위 정의, 영향 분석, 검증 계획 수립
- Implement: 도메인 불변조건을 유지하며 구현
- Verify: 테스트와 회귀 검증
- Document: 변경 근거/방법론/리스크 기록

## M0 로컬 실행 표준
- `LLM API`를 제외한 구성요소는 로컬 단독 실행을 원칙으로 한다.
- 기본 개발 스택은 `Node.js 22 LTS` + `pnpm` + local `PostgreSQL`이다.
- M0에서 허용하는 실행 단위는 web app process, local database process, local test runner, local scheduler/in-process worker다.

## 표준 실행 명령(M0 도입 목표)
- `pnpm dev`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:e2e`

## CI/CD 및 배포 정책
- 원칙: 로컬 검증 가능성이 CI보다 먼저 확보되어야 한다.
- 상태: CI/CD 파이프라인은 아직 미구축이다.
- M0에서는 로컬 품질 게이트를 운영 기준으로 사용한다.
- 배포 자동화는 M1 이후 별도 계획에서 다룬다.
