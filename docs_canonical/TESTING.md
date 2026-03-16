# TESTING.md

## 테스트 전략
현재 문서에서 확정된 테스트 원칙은 "도메인 리스크 중심"이다.

### Calculation engine
- unit tests 필수
- fixture 기반 회귀 테스트 필수
- 예상치/확정치 혼동 방지 테스트 필수
- KRW 환산 기준일 테스트 필수

### AI features
- prompt snapshot 또는 eval dataset 필수
- citation presence 체크 필수
- opinion vs fact separation 체크 필수

### UI
- Playwright smoke test 필수
- 최소 시나리오에는 거래 추가, 포지션 집계, 연말 forecast 확인, 메모 fact-check 실행이 포함되어야 한다.

## 테스트 구조(목표)
문서상 기대 구조:
- `tests/unit/`
- `tests/integration/`
- `tests/e2e/`

주의: 현재 코드베이스에는 위 디렉터리가 아직 존재하지 않는다.

## 검증 워크플로우
복잡 변경은 ExecPlan에 아래를 명시해야 한다.
- Unit 검증 방법
- Integration 검증 방법
- E2E 검증 방법
- 테스트 결과 및 리스크

## 표준 테스트 명령(M0 도입 목표)
- `pnpm test`
- `pnpm test:e2e`
- `pnpm test:coverage`

## 커버리지 기준(확정)
- line coverage >= `80%`
- branch coverage >= `70%`
- 핵심 계산 모듈과 세금 규칙 모듈은 신규 코드에 대해 커버리지 하향을 허용하지 않는다.

## 로컬 품질 게이트
- M0 단계에서는 CI 대신 로컬 검증을 필수 게이트로 사용한다.
- 최소 통과 조건은 `pnpm lint`, `pnpm typecheck`, `pnpm test`, 핵심 경로 smoke e2e 통과다.

## 테스트 하네스 리스크
- 아직 코드베이스가 초기 상태라 테스트 fixture 자산이 없다.
- CI 미구축 상태이므로 로컬 게이트를 우회하면 품질 편차가 커질 수 있다.
