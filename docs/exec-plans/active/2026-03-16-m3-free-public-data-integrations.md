# M3 Free Public Data Integrations (No User API Key)

## 1. 배경 / 목적
현재 제품은 거래/메모 중심의 내부 데이터만으로 동작하며, 시세 차트/배당 이벤트/환율 참조/관련 뉴스가 외부 데이터와 연결되지 않았다.
이번 작업의 목적은 사용자 API 키 입력 없이 연결 가능한 무료 공개 소스를 우선 적용해 운영 화면의 실사용성을 높이는 것이다.

## 2. 사용자 관점 결과
- Overview에서 보유 종목의 시세 이력(차트)과 배당 이벤트를 조회할 수 있다.
- Ledger에서 체결일/통화를 기준으로 FX snapshot 자동 조회를 실행할 수 있다.
- Research에서 선택 종목 기준 관련 뉴스 목록을 확인할 수 있다.
- 외부 소스 실패 시 fallback/경고 상태를 명시하고 앱 동작은 유지된다.

## 3. 범위 / 비범위
- In:
  - 무료/무키 외부 데이터 연동
    - Price + dividend: Yahoo chart endpoint (fallback: Stooq price CSV)
    - FX: Frankfurter API
    - News: Google News RSS search feed
  - API route 추가
    - `GET /api/market/prices`
    - `GET /api/fx`
    - `GET /api/news`
  - Overview/Research/Ledger UI 연결
- Out:
  - OpenAI fact-check 실연동 (사용자 키 필요 범위)
  - 유료 provider/브로커 API 연동
  - DB schema migration

## 4. 변경 파일/모듈
- `src/domain/market-data/*` (신규)
- `app/api/market/prices/route.ts` (신규)
- `app/api/fx/route.ts` (신규)
- `app/api/news/route.ts` (신규)
- `app/dashboard/page.tsx`, `app/research/page.tsx`, `app/transactions/TransactionsClient.tsx`
- `tests/unit/api/*` 신규 테스트
- 필요 시 `tests/e2e/transactions-flow.e2e.ts` 소폭 보강

## 5. 데이터 모델 영향
- new tables: 없음
- changed fields: 없음 (응답 payload 확장만 수행)
- migrations: 없음

필수 점검 항목:
- 예상치 / 확정치 / 목표치 변경
  - 기존 3열 정책 유지. 외부 데이터는 estimate/참조 데이터로만 표시한다.
- KRW 환산 기준일
  - 거래/표시 기본은 settlement-date FX snapshot 유지.
  - 자동조회는 해당 일자 참조 환율을 채우는 보조 기능으로 제공한다.
- tax config 영향
  - 없음. tax rule engine 범위는 변경하지 않는다.
- AI citation 저장
  - fact-check 저장 계약은 기존 유지(변경 없음).
- disclaimer 변경
  - 기존 비자문 고지 유지, 외부 뉴스/데이터는 참고용임을 명시한다.

## 6. 구현 단계 (Milestones)
### M1. Provider adapter + route 테스트 RED
- [x] `/api/market/prices`, `/api/fx`, `/api/news` 실패 테스트 작성
- [x] 실패 원인이 미구현임을 확인

### M2. 최소 구현 GREEN
- [x] market/fx/news adapter 구현
- [x] route 연결 및 파싱/에러 처리 구현
- [x] 테스트 GREEN

### M3. UI 연결
- [x] Overview 시세/배당 시각화 섹션 연결
- [x] Ledger FX 자동조회 액션 연결
- [x] Research 뉴스 패널 연결

### M4. 검증 및 문서 반영
- [x] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`
- [x] Data Sources 문구를 실제 구현 상태에 맞게 보정

## 7. 검증 절차
- Unit: `pnpm test`
- E2E: `pnpm test:e2e`
- 품질 게이트: `pnpm lint && pnpm typecheck`
- 수동 확인:
  - `/dashboard`에서 시세 차트/배당 섹션 노출
  - `/transactions` FX 자동조회 동작
  - `/research` 관련 뉴스 리스트 노출

## 8. 리스크 / 롤백
- Risk: 공개 무키 엔드포인트의 제한/스키마 변경
- Mitigation: provider fallback, timeout, 파싱 실패 시 안전한 빈 응답
- Risk: 뉴스 피드 사용 조건(개인용/비상업적) 제약
- Mitigation: 고지 문구 추가 및 provider 추상화로 교체 가능 구조 유지
- Rollback: 신규 route + market-data 모듈 + UI 연결 커밋만 되돌리면 기존 기능 복원 가능

## 9. Decision log
- 2026-03-16: 사용자 API 키가 필요한 외부 연동(OpenAI 등)은 제외한다.
- 2026-03-16: 무키 무료 소스 우선 원칙으로 Yahoo/Frankfurter/Google RSS를 채택한다.
- 2026-03-16: 외부 데이터는 참고 정보로만 노출하며 원장 불변조건을 유지한다.

## 10. Progress checklist
- [x] spec approved
- [x] schema updated
- [x] implementation complete
- [x] tests green
- [x] docs updated
