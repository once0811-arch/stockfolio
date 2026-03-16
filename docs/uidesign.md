# UI Design References (Portfolio Ops)

이 문서는 구현 참고용 레퍼런스 프롬프트 2개와 디자인 토큰 매핑표를 정의한다.
목표는 `Overview / Ledger / Research` 3화면 구조에서 인지부하를 줄이고, 거래-메모-검증 흐름을 강화하는 것이다.

## Prompt 1: Dense Operations Console
```text
Design a compact operations console for a solo overseas-equity investor.
Constraints:
- Primary nav has exactly 3 items: Overview, Ledger, Research.
- Overview must show six KPI cards and one target/forecast/actual matrix.
- Ledger must use a two-column layout: left (trade + position), right (symbol memo panel).
- Trade input defaults to quick mode with five fields; advanced fields are collapsed.
- Every trade row must display three statuses: memo, review, fact-check.
- Visual style should be dense, restrained, and low-decoration.
- Keep clear disclosure: financial information only, not investment advice.
```

## Prompt 2: Evidence-First Research Workspace
```text
Design a research workspace where memo fact-check is the main job.
Constraints:
- 3-column layout: pending memo queue, selected memo context, fact-check result.
- Fact-check runs only for one selected memo_id at a time.
- Results must include fact/opinion split, supporting/contradicting evidence, confidence, citation count.
- Show citation status prominently for trust.
- Avoid recommendation language; keep explicit disclaimer.
- Mobile should collapse into a one-column flow with tab switching.
```

## Token Mapping

| Category | Token | Value | Usage |
|---|---|---|---|
| Color | `--bg` | `#0c1220` | App background |
| Color | `--bg-card` | `#161f33` | Surface cards |
| Color | `--line` | `#2a3650` | Borders/dividers |
| Color | `--text` | `#ecf2ff` | Primary text |
| Color | `--muted` | `#9aa7c0` | Secondary text |
| Color | `--accent` | `#53c5ff` | Primary action |
| Color | `--accent-strong` | `#30d7b7` | Positive emphasis |
| Typography | `--font-display` | `Do Hyeon` | Page titles |
| Typography | `--font-body` | `Noto Sans KR` | Body copy |
| Typography | `--font-mono` | `JetBrains Mono` | Numeric metrics |
| Density | `card-padding` | `0.84rem` | Compact panel spacing |
| Density | `grid-gap` | `0.85rem` | Inter-card spacing |
| Interaction | `button-system` | `primary/secondary` | Fixed button hierarchy |
| Interaction | `mobile-pattern` | `tab switch` | Ledger list↔memo panel |

## Non-negotiable UI Rules
- Primary nav는 3개를 넘기지 않는다.
- 거래 Quick 입력 필드는 5개를 넘기지 않는다.
- 메모는 반드시 종목 또는 거래에 연결된다.
- 전역 자유 메모 입력 경로를 두지 않는다.
- `target/forecast/actual` 3열 비교는 Overview에 유지한다.
