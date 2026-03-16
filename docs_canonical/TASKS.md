# TASKS.md

## 현재 백로그 요약
아래 항목은 기존 PRD 마일스톤과 하네스 평가 결과를 결합한 우선순위 백로그다.

## 상태 업데이트 (2026-03-16)
- [x] canonical authority 확정
- [x] M0 ExecPlan 작성
- [x] 기술 표준 v1 확정
- [x] M0 scaffold 구현(Next.js/Prisma/Vitest/Playwright, 로컬 무인증 모드)
- [x] M1 1차 구현(거래 원장 포지션 재구성 계산 엔진 + 회귀 테스트)

## P0: Harness 안정화(문서 운영)
1. Workflow 운영 규약 보강
- CI/CD, 릴리스, 롤백 절차 문서화
- PR 승인 게이트(필수 테스트, 문서 업데이트 조건) 명시

2. 기술 표준 운영 정착
- lint/format/type 규칙의 실제 리포지토리 설정 반영
- 파일/함수/테스트 네이밍 규칙의 리뷰 체크리스트 반영

3. 테스트 게이트 운영 자동화
- 커버리지 기준(`line 80%`, `branch 70%`)의 자동 검증 연결
- 테스트 실행 명령 표준의 CI 파이프라인 연결

## P1: 제품 구현 마일스톤(PRD 기준)
1. M0 Harness-ready scaffold
- Next.js/Prisma 초기 스캐폴드
- local no-auth 개발 라우트/base layout

2. M1 Trade ledger + position engine
- 거래 CRUD/CSV import
- 포지션 집계, 실현/미실현 손익

3. M2 Dividend/FX/goals/forecast
- 배당 이벤트
- FX snapshot
- 목표/예상/확정 비교

4. M3 Thesis memo + retrospective
- 거래 메모/사후 평가/회고 리스트

5. M4 AI fact-check + related news
- claim extraction
- 웹 근거 기반 검증
- citation 저장

6. M5 Hardening
- methodology 페이지
- evals/e2e/observability/stale-data handling

## P2: 결정 필요(오픈 이슈)
- 세금 보기 기본 lot method 선택
- 우선 지원할 CSV 브로커 포맷 결정
- 대차 기본 추정률 정책(사용자 입력 vs curated)
- 뉴스 provider feed와 web search 조합 전략
- 목표 지표 타입(금액 중심 vs 수익률 포함)
