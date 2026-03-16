# PLANS.md

이 문서는 **ExecPlan(Execution Plan)** 작성 규칙이다.  
복잡한 기능은 이 문서를 기준으로 `docs/exec-plans/active/*.md` 에 계획을 먼저 만들고 그 계획을 따라 구현한다.

## 목적
ExecPlan은 코딩 에이전트가 **외부 메모리 없이도** 기능을 끝까지 구현할 수 있게 만드는 실행 문서다.

## 필수 원칙
1. **Self-contained**
   - 해당 파일 하나만 읽어도 목표, 변경 파일, 검증 방법을 이해할 수 있어야 한다.
2. **Living document**
   - 구현 진행 중 결정/변경/리스크를 계속 기록한다.
3. **User-visible behavior first**
   - “무엇을 바꾸는가”보다 “사용자가 무엇을 할 수 있게 되는가”를 먼저 쓴다.
4. **Verifiable**
   - 실행 명령과 기대 결과가 있어야 한다.
5. **No hidden context**
   - Slack, 회의, 구두 합의를 전제하지 않는다.

## 기본 템플릿
- 제목
- 배경 / 목적
- 사용자 관점 결과
- 범위 / 비범위
- 변경 파일 또는 모듈
- 데이터 모델 영향
- 구현 단계 (milestones)
- 검증 절차
- 리스크 / rollback
- decision log
- progress checklist

## 이 프로젝트에서 반드시 포함할 항목
- 예상치 / 확정치 / 목표치 중 무엇을 추가/변경하는지
- KRW 환산 기준일이 무엇인지
- tax config 영향이 있는지
- AI feature라면 citation 저장이 어떻게 되는지
- 사용자에게 노출되는 disclaimer가 바뀌는지

## 좋은 ExecPlan의 예
- 거래 import CSV 구현
- 연말 forecast 계산 엔진 추가
- trade memo fact-check agent 추가
- dividend actual/estimate 분리 refactor

## 좋지 않은 ExecPlan의 예
- “대시보드 좀 개선”
- “AI 붙이기”
- “세금 계산 고도화”
