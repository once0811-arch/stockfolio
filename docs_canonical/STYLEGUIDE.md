# STYLEGUIDE.md

## 목적
이 문서는 현재 문서에서 추출 가능한 코딩/구조 규범을 정리한다.
정의되지 않은 항목은 "미정"으로 명시한다.

## 기본 기술 표준
- Runtime: `Node.js 22 LTS`
- Package manager: `pnpm`
- Language: `TypeScript` (`strict=true`)
- Formatter: `Prettier`
- Linter: `ESLint`

## 도메인 불변조건 기반 규약
- 예상치(`estimate`), 확정치(`actual/finalized`), 목표치(`target`)를 동일 필드로 혼합하지 않는다.
- 거래 원본값(통화/수량/단가/수수료/체결일/결제일/FX snapshot)을 덮어쓰지 않는다.
- 세금 계산은 config-driven rule set(`tax_year`, `jurisdiction`, `lot_method`)으로 구현한다.
- AI 기능은 투자 추천 문구를 생성하지 않는다.
- AI 결과에는 citation metadata를 저장한다.

## 네이밍 기준(문서에서 확인된 패턴)
- 상태값: `estimated`, `actual`, `finalized`
- 세금 설정 키: `tax_year`, `jurisdiction`, `lot_method`, `rate_table_version`
- 목표 비교 키: `target_value`, `forecast_value`, `actual_value`

## 코드 조직 원칙(목표 구조)
- domain 경계를 분리(`ledger`, `calculations`, `ai`, `market-data`, `goals`)
- 외부 데이터 연동은 adapter 인터페이스 뒤로 숨긴다.
- 계산 로직은 테스트 가능한 순수 함수 중심으로 유지한다.
- 비용이 발생하는 외부 인프라 의존성을 MVP에서 금지한다.

## 문서/전달 규칙
- 큰 설명은 PR 코멘트보다 저장소 markdown에 남긴다.
- 모호성은 임시 하드코딩 대신 config 또는 명시적 TODO로 남긴다.
- 사용자 노출 문구는 "금융 정보 제공"과 "투자 자문 아님" 경계를 유지한다.
- 환경 변수는 `.env.local` 기반으로 관리하고 비밀값은 저장소에 커밋하지 않는다.

## 네이밍/파일 규칙
- 테스트 파일: `*.test.ts`, `*.spec.ts`
- E2E 파일: `*.e2e.ts`
- 상태 필드는 문자열 리터럴/enum으로 고정하고 임의 문자열을 금지한다.

## 미정/누락 항목(추후 확정 필요)
- import 정렬 정책(자동 정렬 도구 여부)
- 파일명 케이스(`kebab-case` vs `camelCase`)의 경로 규칙
- 에러 코드 체계와 공통 예외 타입
