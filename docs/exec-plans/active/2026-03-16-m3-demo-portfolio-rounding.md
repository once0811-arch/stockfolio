# M3 Demo Portfolio Seeding + Current Return Metrics

## 1. Why
사용자가 제공한 보유 종목(수량/평가금액/현재 수익률)을 더미 데이터로 즉시 확인할 수 있어야 한다.
현재 시스템은 기본적으로 체결가 기준 포지션 집계만 수행해 현재 수익률이 0으로 보이는 경로가 있어, 더미 포트폴리오 재현 정확도가 떨어진다.

## 2. User-visible outcome
- 기본 더미 포트폴리오(IONQ/POET/TSLA/INTC)가 자동 로드된다.
- 수량은 제공값 그대로 유지한다.
- 포지션에 현재가/평가금액/미실현 수익률(%)이 표시된다.
- 통화 금액은 소수점 표시 대신 반올림 정수 중심으로 노출한다.

## 3. Scope
- In:
  - in-memory ledger에 더미 포트폴리오 시드 로직 추가
  - positions 계산 결과에 `marketPriceOriginal`, `currentValueOriginal`, `unrealizedPnlRatePct` 추가
  - `/api/positions`에서 현재가 맵을 반영한 포지션 응답
  - Ledger UI 포지션 행에 수량/평가금액/수익률 표시 강화
- Out:
  - DB migration
  - AI fact-check 로직 변경
  - 인증/권한 체계 변경

## 4. Files
- `src/server/ledger/demo-portfolio.ts` (new)
- `src/server/ledger/in-memory-ledger.ts`
- `src/server/ledger/types.ts`
- `src/server/ledger/positions-from-trades.ts`
- `app/api/positions/route.ts`
- `app/dashboard/page.tsx`
- `app/transactions/page.tsx`
- `app/transactions/TransactionsClient.tsx`
- `tests/unit/ledger/*`, `tests/unit/api/*`

## 5. Invariant checks
- estimate/actual/target 혼합 없음 (표시 확장만 수행)
- 거래 원본값 불변 유지
- tax config 영향 없음
- AI citation 저장 경로 영향 없음
- 비자문 고지 변경 없음

## 6. Milestones
### M1. RED
- [x] 더미 시드/현재 수익률 관련 단위 테스트 추가
- [x] 미구현 상태 실패 확인

### M2. GREEN
- [ ] 더미 시드 + 포지션 현재가/수익률 계산 구현
- [ ] API/화면 반영
- [ ] 테스트 통과

## 7. Verification
- `pnpm test tests/unit/ledger/demo-portfolio-seed.test.ts`
- `pnpm test tests/unit/api/positions-current-rate.test.ts`
- `pnpm test`
- `pnpm test:e2e`

## 8. Risks
- 테스트 환경에서 자동 시드가 기존 테스트를 오염시킬 수 있음
- 완화: 테스트에서는 기본 시드 비활성화, 명시 옵션으로만 활성화

## 9. Progress
- [x] spec approved
- [ ] implementation complete
- [ ] tests green
- [ ] docs updated
