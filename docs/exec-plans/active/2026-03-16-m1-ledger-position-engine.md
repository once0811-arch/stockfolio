# M1 Trade Ledger + Position Engine ExecPlan

## 1. Why
M0에서 로컬 실행 가능한 스캐폴드와 품질 게이트를 구성했지만, 실제 투자 데이터 운영의 핵심인 거래 원장/포지션 계산 기능은 아직 없다.  
M1에서는 거래 이벤트를 기준으로 보유 수량, 평균 취득가, 실현손익을 재구성할 수 있어야 이후 배당/세금/환율/forecast 기능으로 확장할 수 있다.  
본 단계는 계산 엔진의 순수 함수 구현과 fixture 기반 회귀 테스트를 우선 적용해 계산 신뢰도를 먼저 확보한다.

## 2. User-visible outcome
개발자는 거래 배열을 입력해 현재 포지션과 실현손익을 재현할 수 있다.  
과매도 등 잘못된 입력은 명시적으로 오류로 처리된다.  
핵심 계산 로직이 fixture 기반 테스트로 보호된다.

## 3. Scope
- In:
- 거래 원장 계산 도메인 모듈(`src/domain/ledger`)
- 실현/미실현 손익 계산 최소 함수
- fixture 기반 회귀 테스트
- 과매도 등 edge case 테스트
- Out:
- 거래 CRUD UI/API 전체 완성
- CSV import 파서 본구현
- 세금/배당/환율 영향 분리 본구현
- research/AI 연동

## 4. Files / modules expected to change
- `src/domain/ledger/*`
- `src/domain/calculations/*`
- `tests/unit/ledger/*`
- `tests/fixtures/*`

## 5. Data model impact
- new tables:
- 없음 (M1 1차는 순수 계산 모듈 중심)
- changed fields:
- 없음
- migrations:
- 없음

필수 점검 항목:
- 예상치 / 확정치 / 목표치 중 무엇을 추가/변경하는지
- 본 작업은 거래/손익 계산이며 해당 3값 필드는 변경하지 않는다.
- KRW 환산 기준일이 무엇인지
- 현재 정책 유지: 거래 환산은 `settlement_date` 기준 snapshot.
- tax config 영향이 있는지
- 없음 (`tax_year`, `jurisdiction`, `lot_method` 계산은 M2+에서 본구현)
- AI feature라면 citation 저장이 어떻게 되는지
- AI 범위 아님
- 사용자에게 노출되는 disclaimer가 바뀌는지
- 변경 없음

## 6. Milestones
### M1.
- [ ] 포지션 재구성 실패 테스트 작성(RED)
- [ ] 최소 구현으로 테스트 통과(GREEN)

### M2.
- [ ] fixture 기반 회귀 테스트 추가
- [ ] 과매도 에러 케이스 추가

### M3.
- [ ] 타입/함수 refactor
- [ ] lint/typecheck/test/coverage 통과

## 7. Verification
### Unit
- `pnpm test`
- `pnpm test:coverage`

### Integration
- N/A (본 단계 범위 밖, DB 의존 없음)

### E2E
- N/A (본 단계 범위 밖)

## 8. Risks / rollback
- Risk: 평균단가 방식만 구현하면 세법 lot-method 확장 시 재작업 필요
- Mitigation: 계산 인터페이스를 lot method 확장 가능 형태로 설계
- Rollback: 도메인 모듈 변경 제거 시 M0 상태로 복귀 가능

## 9. Decision log
- 2026-03-16: M1 1차는 DB/API보다 계산 엔진 신뢰성 확보를 우선한다.
- 2026-03-16: M1 1차는 평균단가(average cost) 기반 포지션 재구성을 기본 구현으로 채택한다.
- 2026-03-16: 과매도는 계산 엔진에서 즉시 오류 처리한다.

## 10. Progress
- [x] spec approved
- [x] schema updated
- [x] implementation complete
- [x] tests green
- [x] docs updated
