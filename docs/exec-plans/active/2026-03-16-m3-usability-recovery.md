# M3 Usability Recovery ExecPlan (PM + Investor Lens)

## 1. 배경 / 목적
현재 UI는 기능은 있으나 실사용 품질이 낮다. 주요 원인은 다음 3가지다.

1. 신뢰 붕괴: 상단 스냅샷 수치가 정적 텍스트여서 실제 포트폴리오 상태와 불일치할 수 있다.
2. 판단 지연: Overview가 보유 종목 전체가 아닌 일부(Top 3) 중심으로 보여 집중/분산 리스크 판단이 어렵다.
3. 실행 마찰: 거래 입력 이후 메모 연결, 검증 큐 우선순위, 근거 확인 흐름이 느슨해 사용자 작업이 끊긴다.

목표는 "지금 무엇을 판단하고, 무엇을 먼저 실행해야 하는지"가 10초 내에 보이게 만드는 것이다.

## 2. 사용자 관점 결과
- 투자자는 헤더와 Overview에서 실제 포지션 기반 YTD/환율/검증대기 상태를 즉시 확인한다.
- Overview에서 보유 종목 전체 비중과 집중 리스크 경고를 본다.
- 거래 추가 직후 해당 종목이 선택되고 메모 작성으로 바로 이어진다.
- Research에서 검증 대기 메모만 빠르게 선별해 fact-check를 실행하고 근거/반대근거를 바로 확인한다.

## 3. 범위 / 비범위
### 범위
- Root layout 상단 snapshot을 동적 지표로 교체
- Portfolio overview 파생 계산을 공통 모듈로 분리
- Overview 정보 구조 개선(전체 보유 비중 + 경고 + 다음 액션)
- Ledger post-submit 상호작용 개선(새 거래 자동 선택)
- Research 큐 필터 및 evidence 가시성 개선
- 단위 테스트 추가

### 비범위
- 세금 rule-engine 고도화
- AI 모델 응답 품질 개선
- DB 영속화 전환

## 4. 변경 파일 / 모듈
- `src/server/portfolio/derive-portfolio-overview.ts` (new)
- `app/layout.tsx`
- `app/dashboard/page.tsx`
- `app/transactions/TransactionsClient.tsx`
- `app/research/page.tsx`
- `app/globals.css`
- `tests/unit/portfolio/derive-portfolio-overview.test.ts` (new)

## 5. 데이터 모델 영향
- DB schema 변경 없음
- API contract의 필수 필드 변경 없음
- 계산 파생값(비중, 경고, next actions)만 server-side helper에서 추가 생성

## 6. Invariant checks
- estimate / actual / target 혼합 금지: 기존 3열 매트릭스 유지
- KRW 환산 기준: 종목별 최신 settlement-date FX snapshot 사용
- tax config 영향: 없음(표시/경고 영역만 변경)
- AI citation: Research 결과에서 citation 상태와 evidence 항목 노출 강화
- 투자 자문 금지: 모든 화면 disclaimer 유지

## 7. 구현 단계
1. 공통 파생 계산 모듈 작성 + 단위 테스트
2. Layout 동적 스냅샷 연결
3. Overview 재구성(전체 보유/집중경고/다음액션)
4. Ledger/Research 상호작용 개선
5. lint/type/unit/e2e 검증

## 8. 검증 절차
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:e2e`

## 9. 리스크 / rollback
- 리스크: server component 동적 계산으로 렌더 비용 증가 가능
- 완화: 공통 helper에서 단일 계산 수행, 데이터 양이 작아 O(n) 유지
- Rollback: `app/layout.tsx`, `app/dashboard/page.tsx`, `app/research/page.tsx`, `app/transactions/TransactionsClient.tsx`, `app/globals.css`를 이전 상태로 복원하면 기능 회귀 가능

## 10. decision log
- 2026-03-16: 품질 이슈의 1순위를 "시각 스타일"이 아닌 "의사결정 신뢰성/행동 전환율"로 고정
- 2026-03-16: Layout snapshot은 정적 텍스트를 폐기하고 실제 원장 기반 파생값(USD/KRW, YTD P/L, 검증대기 메모)으로 교체
- 2026-03-16: Overview는 Top 3 중심에서 전체 보유 비중 + 집중 리스크 경고 + 실행 우선순위 구조로 전환

## 11. progress checklist
- [x] 파생 계산 helper + 테스트
- [x] layout 동적 snapshot 반영
- [x] overview 전체 보유/리스크/액션 반영
- [x] ledger/research 실행마찰 개선
- [x] 전체 테스트 통과
