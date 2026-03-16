# M2 IA Consolidation + Memo-Centric Flow ExecPlan

## 1. Why
기존 UI는 화면 분절과 정보 과밀로 핵심 가치(운영/검증/회고)를 전달하지 못했다.
특히 메모가 종목/거래 맥락에 연결되지 않아 Ledger→Research 흐름이 끊기는 문제가 있었다.
이번 변경은 Primary IA를 3화면(Overview/Ledger/Research)으로 압축하고 메모를 memo_id 중심으로 연결해 핵심 플로우 성공률을 높인다.

## 2. User-visible outcome
- 사용자는 Primary 내비 3개만으로 주요 작업을 수행한다.
- Ledger에서 Quick 거래 입력 후 같은 화면에서 종목 메모를 작성/수정/조회한다.
- Research에서 선택된 memo_id 단위 fact-check를 실행하고 citation 상태를 확인한다.
- Overview에서 target/forecast/actual 매트릭스를 바로 확인한다.

## 3. Scope
- In:
- Primary IA 축소(Overview/Ledger/Research)
- `/forecast` -> `/dashboard#forecast` 리다이렉트
- Memo API 추가(`POST/GET /api/memos`, `PATCH /api/memos/:memoId`)
- Fact-check API 추가(`POST /api/fact-check/:memoId`)
- 거래 목록 상태 컬럼 추가(`memo_status`, `review_status`, `fact_check_status`)
- E2E/Unit 테스트 갱신
- `docs/uidesign.md` 레퍼런스 정합 복구
- Out:
- DB migration
- 외부 AI/뉴스 provider 실연동

## 4. Files / modules expected to change
- `app/layout.tsx`, `app/dashboard/page.tsx`, `app/transactions/TransactionsClient.tsx`, `app/research/page.tsx`, `app/forecast/page.tsx`, `app/globals.css`
- `app/api/trades/route.ts`, `app/api/memos/*`, `app/api/fact-check/*`
- `src/server/memos/*`, `src/server/ledger/quick-trade-defaults.ts`, `src/server/ledger/trade-schemas.ts`
- `tests/unit/api/*`, `tests/unit/memos/*`, `tests/unit/ledger/quick-trade-defaults.test.ts`, `tests/e2e/*`
- `docs/uidesign.md`

## 5. Data model impact
- new tables:
- 없음 (in-memory store only)
- changed fields:
- Trade GET 응답에 상태 요약 필드 3개 추가
- migrations:
- 없음

필수 점검 항목:
- 예상치 / 확정치 / 목표치 중 무엇을 추가/변경하는지
- Overview에 `target/forecast/actual` 3열 비교를 유지한다.
- KRW 환산 기준일이 무엇인지
- settlement-date FX snapshot 기준 유지.
- tax config 영향이 있는지
- 없음 (표시/연결 중심 변경).
- AI feature라면 citation 저장이 어떻게 되는지
- fact-check 응답에 citationCount를 포함하고 memo 상태에 반영한다.
- 사용자에게 노출되는 disclaimer가 바뀌는지
- 전역 및 research 결과 영역에 비자문 고지를 유지한다.

## 6. Milestones
### M1.
- [x] Unit/E2E RED 테스트 추가
- [x] 실패 확인

### M2.
- [x] API/도메인 구현
- [x] UI IA/화면 재구성

### M3.
- [x] 테스트/게이트 통과
- [x] 문서 업데이트 완료

## 7. Verification
### Unit
- `pnpm test`

### Integration
- `pnpm test`

### E2E
- `pnpm test:e2e`
- 시나리오: quick 거래 입력, 메모 저장/조회, memo fact-check, overview 매트릭스 확인

## 8. Risks / rollback
- Risk: 메모 상태 계산 로직과 거래 목록 상태 컬럼의 drift
- Mitigation: 상태 유틸 단위 테스트 추가
- Risk: UI 축소 과정에서 기존 링크 의존 E2E 깨짐
- Mitigation: 내비/핵심 경로 selector를 새 IA로 고정
- Rollback: 새 API/memo 모듈과 UI 파일 변경만 되돌리면 기존 M1 계산 기능은 유지된다

## 9. Decision log
- 2026-03-16: Primary IA를 3화면으로 고정한다.
- 2026-03-16: 메모는 전역 텍스트가 아닌 symbol/trade 연결 엔티티로 다룬다.
- 2026-03-16: fact-check 실행 단위를 memo_id로 고정한다.

## 10. Progress
- [x] spec approved
- [x] schema updated
- [x] implementation complete
- [x] tests green
- [x] docs updated
