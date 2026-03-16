# Research Notes

이 문서는 PRD/아키텍처 설계의 외부 근거를 남긴다.

## 1. Harness engineering / agent-first repo design
- OpenAI, *Harness engineering: leveraging Codex in an agent-first world*  
  https://openai.com/index/harness-engineering/
  - AGENTS.md는 encyclopedia가 아니라 table of contents로 두고
  - 구조화된 `docs/`를 system of record로 두는 방식
  - plan과 품질 문서를 repo-local artifact로 관리하는 패턴을 참고

- OpenAI Cookbook, *Using PLANS.md for multi-hour problem solving*  
  https://developers.openai.com/cookbook/articles/codex_exec_plans/
  - 복잡한 기능은 self-contained 실행 계획 문서로 관리하는 패턴을 참고

- OpenAI Cookbook, *Codex Prompting Guide*  
  https://developers.openai.com/cookbook/examples/gpt-5/codex_prompting_guide/
  - coding agent harness 설계와 tool/use patterns 참고

## 2. OpenAI agent / research stack
- OpenAI API docs, *Code generation*  
  https://developers.openai.com/api/docs/guides/code-generation/
- OpenAI API docs, *Web search*  
  https://developers.openai.com/api/docs/guides/tools-web-search/
- OpenAI API docs, *Computer use*  
  https://developers.openai.com/api/docs/guides/tools-computer-use/
- OpenAI API docs, *Working with evals*  
  https://developers.openai.com/api/docs/guides/evals/

## 3. Web app stack
- Next.js Docs, App Router  
  https://nextjs.org/docs/app
- Auth.js Getting Started / Protecting Resources  
  https://authjs.dev/getting-started  
  https://authjs.dev/getting-started/session-management/protecting
- Prisma + Next.js guide  
  https://www.prisma.io/docs/guides/frameworks/nextjs

## 4. Market / FX / research data
- Alpha Vantage homepage / documentation  
  https://www.alphavantage.co/  
  https://www.alphavantage.co/documentation/
- ECB reference rates  
  https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html
- ECB Data Portal API overview  
  https://data.ecb.europa.eu/help/api/overview

## 5. Korean tax and domain notes
- 국세청, 해외주식과 세금 (개인투자자용)  
  https://taxlaw.nts.go.kr/downloadPDFFile.do?fleId=300000000001047678&fleSn=923559
  - 배당 원천징수/종합과세 관련 설명
  - 해외주식 양도소득세 확정신고 관련 설명
  - 주당취득가액 산정 시 선입선출법 또는 이동평균법 관련 예시
- 국세청, 양도소득세 세액계산 흐름도  
  https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7709&mi=2310
  - 주식 양도소득 기본공제 250만원
- 국세청, 배당소득 원천징수 방법  
  https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7914&mi=40359

## 6. Toss lending domain context
- 토스증권 고객센터, 주식 빌려주기  
  https://corp.tossinvest.com/ko/business?tab=lending
  - 보유 주식을 빌려주고 대여료를 받는 구조
  - 사용자 가치가 “보유 자산 추가 수익화”에 있다는 점 참고
