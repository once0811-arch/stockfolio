# ARCHITECTURE.md

## 시스템 개요
현재 저장소는 "문서 우선 설계 단계"이며, 실제 애플리케이션 코드는 아직 없다.
따라서 아래 아키텍처는 "구현 대상 설계"로 취급해야 한다.

문서상 목표 아키텍처는 5개 레이어다.
1. Presentation (Next.js App Router UI)
2. Application (route handlers, server actions, orchestration)
3. Domain (ledger/calculations/goals/ai/market-data)
4. Persistence (Prisma + PostgreSQL)
5. External Integrations (market data, FX, OpenAI, scheduler/queue)

## 코어 모듈과 경계
- `ledger`
  - 거래 원장 저장, 포지션 재구성
- `calculations`
  - 실현/미실현 손익, 환율 영향, 배당/세금/대차 계산
- `goals`
  - 목표/예상/확정 비교
- `ai`
  - claim extraction, fact-check, 관련 뉴스 요약
- `market-data`
  - provider 교체 가능한 adapter 인터페이스

경계 원칙:
- 거래 원본값은 immutable
- 예상치/확정치/목표치 분리
- 세금 로직은 config-driven
- AI는 추천 금지, citation 저장 필수

## 데이터 흐름(설계 기준)
1. 사용자가 거래를 입력 또는 CSV import
2. ledger에서 이벤트를 저장하고 포지션을 재구성
3. calculations가 P/L, FX impact, dividend/tax/lending estimate 계산
4. goals/forecast가 연말 목표 대비 진행률 계산
5. memo/ai가 거래 가설을 fact-check하고 근거를 저장
6. dashboard/forecast/research 화면에 집계 결과 표시

## 주요 아키텍처 제약
- KRW를 canonical reporting currency로 사용하되 원본 통화 필드 유지
- FX snapshot(정산일 기준)과 valuation-date rate를 분리 보관
- tax_year/jurisdiction/lot_method를 규칙 키로 사용
- citation 없는 AI 결과는 완료로 간주하지 않음

## 구현 상태 주의
- API 엔드포인트, background job, DB schema는 문서상 제안이며 아직 코드로 존재하지 않는다.
- 에이전트는 "문서에 제시된 목표 구조"와 "실제 파일 구조"를 구분해서 해석해야 한다.

## 문서 충돌 플래그
- PRD/ARCHITECTURE 문서에 동일 주제(아키텍처/외부 데이터 전략)가 중복 기술되어 있어 드리프트 위험이 있다.
