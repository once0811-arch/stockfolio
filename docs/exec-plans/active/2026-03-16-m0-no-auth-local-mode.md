# M0 Local No-Auth Mode ExecPlan

## 1. Why
로컬 개발 단계에서 로그인/세션 관리가 핵심 도메인 구현 속도를 저해하고 있다.  
현재 우선순위는 거래 원장과 계산 엔진이며, 인증은 제품 완성 단계에서 재도입해도 된다.  
이번 변경은 로컬에서 즉시 접근 가능한 무인증 모드로 전환해 개발 루프를 단순화한다.

## 2. User-visible outcome
사용자는 `/dashboard`, `/transactions`에 로그인 없이 바로 접근할 수 있다.  
홈 화면에서 로그인 진입 없이 핵심 개발 화면으로 이동할 수 있다.

## 3. Scope
- In:
- 라우트 보호(proxy) 제거
- dashboard/transactions 세션 체크 제거
- 로그인 페이지 및 Auth.js 라우트 비활성화(삭제)
- e2e 시나리오를 무인증 흐름으로 갱신
- Out:
- 제품 최종 인증 정책 결정
- 다중 사용자 권한 모델

## 4. Files / modules expected to change
- `app/page.tsx`
- `app/dashboard/page.tsx`
- `app/transactions/page.tsx`
- `proxy.ts`
- `tests/e2e/*`
- `app/login/*` (삭제)
- `app/api/auth/[...nextauth]/route.ts` (삭제)
- `src/server/auth/options.ts` (삭제)
- `src/types/next-auth.d.ts` (삭제)

## 5. Data model impact
- new tables:
- 없음
- changed fields:
- 없음
- migrations:
- 없음

필수 점검 항목:
- 예상치 / 확정치 / 목표치 중 무엇을 추가/변경하는지
- 변경 없음
- KRW 환산 기준일이 무엇인지
- 변경 없음 (`settlement_date` 기준 유지)
- tax config 영향이 있는지
- 없음
- AI feature라면 citation 저장이 어떻게 되는지
- AI 범위 아님
- 사용자에게 노출되는 disclaimer가 바뀌는지
- 변경 없음

## 6. Milestones
### M1.
- [ ] 무인증 라우팅 전환

### M2.
- [ ] 로그인/Auth.js 경로 제거

### M3.
- [ ] e2e 갱신 및 품질 게이트 통과

## 7. Verification
### Unit
- `pnpm test`

### Integration
- N/A

### E2E
- `pnpm test:e2e`
- `/dashboard`, `/transactions` 무인증 접근 확인

## 8. Risks / rollback
- Risk: 인증이 필요한 동작 검증이 당분간 누락될 수 있음
- Mitigation: 본 문서에 "로컬 무인증 임시 정책"을 명시하고 추후 인증 재도입 작업을 backlog에 유지
- Rollback: 삭제한 auth 파일 복구 및 proxy/session 체크 복원

## 9. Decision log
- 2026-03-16: 로컬 개발 속도 우선을 위해 인증을 후순위로 이연하고 무인증 모드를 기본값으로 전환한다.
- 2026-03-16: Playwright `3001` 포트 기존 서버 재사용(`reuseExistingServer`)을 기본으로 유지한다.

## 10. Progress
- [x] spec approved
- [x] schema updated (N/A, 변경 없음)
- [x] implementation complete
- [x] tests green
- [x] docs updated
