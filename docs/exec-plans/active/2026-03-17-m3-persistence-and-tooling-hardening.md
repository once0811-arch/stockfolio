# M3 Persistence + Tooling Hardening ExecPlan

## 1. 배경 / 목적
현재 서비스는 trade/memo 상태를 in-memory로 유지해 프로세스 재시작 시 데이터가 소실된다.
또한 `pnpm lint`, `pnpm typecheck`가 로컬 환경에서 비정상적으로 장시간 걸리는 문제가 있다.

이번 작업의 목표:
1. 런타임 저장소를 PostgreSQL(Prisma) 중심으로 전환해 데이터 휘발을 제거한다.
2. 정적검사(tsc/eslint) hang 원인을 제거해 품질 게이트를 안정화한다.

## 2. 사용자 관점 결과
- 서버 재시작 후에도 거래/메모가 유지된다.
- 개발자가 `lint/typecheck`를 실질적으로 완료할 수 있다.
- 기존 핵심 플로우(거래 입력, 메모 저장, fact-check, overview 확인)는 회귀 없이 동작한다.

## 3. 범위 / 비범위
### 범위
- trade/memo repository를 async API로 변경
- Prisma 기반 trade/memo persistence 구현
- Postgres 연결 실패 시 auto-memory fallback 정책 추가
- memo Prisma schema + migration 추가
- API route/server component/tests await 전환
- TS/ESLint 정적검사 설정 정리

### 비범위
- 세금 계산 엔진 고도화
- AI fact-check 품질 개선
- 인증/권한 모델 확장

## 4. 변경 파일 / 모듈
- `src/server/ledger/in-memory-ledger.ts`
- `src/server/memos/in-memory-memos.ts`
- `src/server/runtime-state.ts`
- `src/server/persistence/*` (new)
- `app/api/trades/route.ts`
- `app/api/positions/route.ts`
- `app/api/memos/route.ts`
- `app/api/memos/[memoId]/route.ts`
- `app/api/fact-check/[memoId]/route.ts`
- `app/layout.tsx`
- `app/dashboard/page.tsx`
- `app/transactions/page.tsx`
- `prisma/schema.prisma`
- `prisma/migrations/*` (new)
- `tsconfig.json`
- `eslint.config.mjs`

## 5. 데이터 모델 영향
- `Memo` 모델 추가
  - `id`, `portfolioId`, `symbol`, `tradeId`, `thesisText`, `status`, `reviewOutcome`, `retrospectiveNote`, `factCheckStatus`, `citationCount`, `createdAt`, `updatedAt`
- Trade/Memo 조회 기준은 local no-auth 기본 포트폴리오 컨텍스트를 사용

## 6. Invariant checks
- estimate/actual/target 혼합 없음 (UI 계산표시 로직 유지)
- 원장 원본값(수량/단가/통화/체결/결제/FX snapshot) 덮어쓰기 금지
- AI 결과 citation 상태 저장 유지
- 투자 자문 금지 문구 유지

## 7. 구현 단계
1. persistence mode 및 prisma context helper 추가
2. ledger/memo repository postgres 경로 구현 + fallback
3. API/page/tests async 전환
4. prisma schema/migration 반영
5. tooling 설정(정적검사 hang) 수정
6. lint/typecheck/test/e2e/build 검증

## 8. 검증 절차
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:e2e`
- `pnpm build`

## 9. 리스크 / rollback
- 리스크: DB 미가용 환경에서 API 실패 가능
- 완화: `PORTFOLIO_PERSISTENCE_MODE=auto` 시 메모리 fallback
- rollback: repository와 schema 변경만 되돌리면 이전 메모리 동작 복구 가능

## 10. decision log
- 2026-03-17: local no-auth UX를 유지하기 위해 기본 포트폴리오 컨텍스트 자동 생성 정책 채택
- 2026-03-17: `eslint-config-next` 경유 lint hang을 제거하기 위해 standalone ESLint flat config(`@eslint/js`, `typescript-eslint`, `react`, `react-hooks`)로 전환
- 2026-03-17: `PORTFOLIO_PERSISTENCE_MODE=auto`에서 Postgres 연결 실패 시 1회 경고 후 메모리 fallback 고정(반복 연결 재시도 방지)

## 11. progress checklist
- [x] persistence helper 구현
- [x] ledger/memo postgres 전환
- [x] async 호출부 전환
- [x] prisma schema/migration 반영
- [x] lint/typecheck hang 해결
- [x] 전체 검증 통과
