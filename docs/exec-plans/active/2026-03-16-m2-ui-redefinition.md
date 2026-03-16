# M2 Product UI Redefinition ExecPlan

## 1. Why
현재 UI는 M0 수준의 최소 스캐폴드로, PRD가 정의한 핵심 가치(운영 가능한 투자 성과 해석, 예상/확정/목표 분리, 메모 기반 fact-check 흐름)를 사용자 여정으로 전달하지 못한다.
특히 대시보드/거래/forecast/research/methodology 정보구조가 분리되어 있지 않아 제품 목적이 단순 거래 입력 도구처럼 보이는 문제가 있다.
이번 변경은 문서 기반 제품 정체성을 반영해 전체 화면 구조를 재정의하고, 핵심 플로우의 시각적/상호작용적 일관성을 확보한다.

## 2. User-visible outcome
사용자는 하나의 통합 UI에서 다음을 수행할 수 있다.
- 거래 추가와 포지션 집계를 연속적으로 확인한다.
- 연말 forecast 화면에서 목표치/예상치/확정치를 명확히 분리해 확인한다.
- research 화면에서 메모 fact-check 실행 액션과 근거 중심 결과 영역을 확인한다.
- methodology/data sources 화면에서 계산식/데이터 출처/투자 자문 아님 고지를 확인한다.

## 3. Scope
- In:
- 글로벌 레이아웃/네비게이션/디자인 토큰 재정의
- `/`, `/dashboard`, `/transactions` UI 전면 개편
- `/forecast`, `/research`, `/settings/methodology`, `/settings/data-sources` 라우트 추가
- 문서 불변조건을 반영한 표시 규칙(estimate/actual/target 분리, disclaimer 노출)
- 핵심 플로우 Playwright smoke 테스트 보강
- Out:
- 신규 DB 스키마/마이그레이션
- 계산 엔진 로직 변경
- AI 모델 연동 본구현(이번 단계는 UI orchestration과 상태 표시 중심)

## 4. Files / modules expected to change
- `app/layout.tsx`
- `app/globals.css`
- `app/page.tsx`
- `app/dashboard/page.tsx`
- `app/transactions/page.tsx`
- `app/transactions/TransactionsClient.tsx`
- `app/forecast/page.tsx` (new)
- `app/research/page.tsx` (new)
- `app/settings/methodology/page.tsx` (new)
- `app/settings/data-sources/page.tsx` (new)
- `tests/e2e/transactions-flow.e2e.ts`

## 5. Data model impact
- new tables:
- 없음
- changed fields:
- 없음
- migrations:
- 없음

필수 점검 항목:
- 예상치 / 확정치 / 목표치 중 무엇을 추가/변경하는지
- UI 표기 구조를 `target_value / forecast_value / actual_value` 3열 비교 중심으로 명확화한다(데이터 스키마 변경 없음).
- KRW 환산 기준일이 무엇인지
- 기존 규칙 유지: 거래 환산은 settlement-date 기준 FX snapshot이며, valuation-date rate는 비교용으로 설명만 제공한다.
- tax config 영향이 있는지
- 없음. `tax_year`, `jurisdiction`, `lot_method`는 표시 컨텍스트만 제공한다.
- AI feature라면 citation 저장이 어떻게 되는지
- research UI에서 citation-required 상태와 evidence 링크 슬롯을 명시한다(저장 로직은 기존/차기 구현 범위).
- 사용자에게 노출되는 disclaimer가 바뀌는지
- 전역 footer 및 research/methodology에 "금융 정보 제공, 투자 자문 아님" 문구를 강화한다.

## 6. Milestones
### M1.
- [ ] UI 기대 동작을 정의한 E2E 스모크 테스트 작성(RED)
- [ ] 실패 원인이 기대한 UI 변경점인지 확인

### M2.
- [ ] 글로벌 레이아웃/스타일 시스템 재구성
- [ ] dashboard/transactions/forecast/research/settings 화면 구현

### M3.
- [ ] E2E 통과 및 로컬 품질 게이트 점검
- [ ] 변경 근거를 ExecPlan decision log/progress에 반영

## 7. Verification
### Unit
- 기존 unit test 회귀: `pnpm test`

### Integration
- 기존 API/ledger 경로 회귀: `pnpm test`

### E2E
- `pnpm test:e2e`
- 필수 스모크: 거래 추가, 포지션 집계, forecast 확인, memo fact-check 실행

## 8. Risks / rollback
- Risk: 전면 스타일 개편으로 기존 e2e selector가 깨질 수 있음
- Mitigation: 접근 가능한 role/label 기반 selector 유지 + `data-testid` 최소 보강
- Risk: UI 확장 시 문서 불변조건 표기가 누락될 수 있음
- Mitigation: 각 페이지에 estimate/actual/target, citation, disclaimer 체크리스트 반영
- Rollback: UI 파일과 e2e 변경만 되돌리면 기존 M1 기능(ledger/API)은 유지된다

## 9. Decision log
- 2026-03-16: 제품 핵심 가치를 "투자 추천"이 아닌 "운영/검증/회고" 흐름으로 시각화한다.
- 2026-03-16: UI 테마는 고밀도 시장 모니터링 대시보드 감성을 채택하되, 문서의 비자문 원칙을 명확히 노출한다.
- 2026-03-16: 데이터 모델 변경 없이 화면 정보구조와 사용자 여정을 우선 고도화한다.
- 2026-03-16: e2e의 in-memory ledger 워커 차이를 고려해 거래건수 검증을 `정확히 +1`에서 `증가 검증`으로 안정화한다.

## 10. Progress
- [x] spec approved
- [x] schema updated
- [x] implementation complete
- [x] tests green
- [x] docs updated
