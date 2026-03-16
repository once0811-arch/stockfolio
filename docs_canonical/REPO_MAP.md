# REPO_MAP.md

## 목적
이 저장소는 해외주식 포트폴리오 운영 서비스 구현을 위한 에이전트 친화형 문서 하네스다.
현재 코드 구현체보다 문서 기반 설계 레이어가 중심이다.

## 코드베이스 실체(ground truth)
기준 시점: 2026-03-16

현재 확인된 최상위 경로:
- `AGENTS.md`
- `README.md`
- `docs/`
- `docs_canonical/`

현재 `app/`, `src/`, `tests/` 디렉터리는 실제로 존재하지 않는다.
해당 구조는 제품 문서에 "목표 트리"로만 제시되어 있다.

## 주요 디렉터리와 역할
- `docs/product-specs/`
  - 제품 요구사항(PRD)과 MVP 범위 정의
- `docs/`
  - 아키텍처, 계산 규칙, 데이터 소스, 계획 작성 규칙
- `docs/exec-plans/active/`
  - 실행 계획 템플릿 및 활성 ExecPlan 보관 위치
- `docs/references/`
  - 외부 근거 링크와 리서치 노트
- `docs_canonical/`
  - 에이전트 운영을 위한 canonical knowledge layer

## 핵심 모듈(문서상 정의)
문서에서 정의한 도메인 모듈:
- `ledger`
- `calculations`
- `goals/forecast`
- `ai fact-check`
- `market-data adapters`

주의: 위 모듈은 현재 코드가 아니라 설계 정의다.

## 주요 엔트리 포인트
- `AGENTS.md`: 에이전트 작업 규칙과 필수 읽기 문서
- `docs/product-specs/portfolio-ops-prd.md`: 제품 기능 요구사항의 중심
- `docs/ARCHITECTURE.md`: 레이어/도메인 경계
- `docs/CALCULATION_RULES.md`: 계산 불변조건
- `docs/DATA_SOURCES.md`: 외부 데이터 adapter 전략
- `docs/PLANS.md`: ExecPlan 작성 규칙

## 상위 의존 구조(문서 관점)
1. `AGENTS.md` 정책
2. PRD/Architecture/Rules/Data 문서
3. ExecPlan 문서
4. 구현 및 검증 산출물

## 충돌 및 주의사항(침묵 해소 금지)
- 사용자 입력에는 `CLAUDE.md`가 언급되지만 현재 저장소에서는 파일이 확인되지 않는다.
- PRD의 suggested tree(`app/`, `src/`, `tests/`)와 현재 실제 경로가 다르므로, 에이전트는 실제 경로를 우선해야 한다.
