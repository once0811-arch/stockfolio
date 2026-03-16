# CALCULATION_RULES.md

이 문서는 제품 레벨 계산 규칙을 정의한다.  
정확한 세법 해석이나 증권사별 처리 차이는 향후 `tax_year` / `jurisdiction` / `provider_behavior` 설정으로 분리한다.

## 1. Canonical principles
1. 보고 기준 통화는 KRW다.
2. 원본 거래 통화와 원화 환산값을 둘 다 저장한다.
3. 예상치 / 확정치를 절대로 합치지 않는다.
4. 세금 계산은 config-driven rule set으로 처리한다.
5. 대차수익은 기본적으로 estimate다.

## 2. Position reconstruction
입력:
- 거래 원장
- 종목
- 수량
- 원본 단가
- 수수료
- 체결일 / 결제일

출력:
- 보유 수량
- 평균단가 또는 lot-based 취득가액
- 실현손익
- 미실현손익

## 3. Realized P/L
기본 식:
`매도대금 - 취득원가 - 매도 관련 비용`

주의:
- 세금 보기와 앱 내부 성과 보기의 취득가액 계산법은 다를 수 있다.
- tax_lot_method는 별도 필드로 보관한다.

## 4. Unrealized P/L
기본 식:
`현재 평가금액 - 남은 취득원가`

## 5. FX impact
분해 원칙:
- local price effect
- FX effect
- combined total

필수 저장값:
- trade-settlement FX snapshot
- valuation-date FX rate

## 6. Dividend
### Estimated
- declared future dividends
- 과거 패턴 기반 예상
- status = `estimated`

### Actual
- 실제 입금/정산된 배당
- gross / withholding / net 분리
- status = `actual`

## 7. Tax estimate
MVP 규칙:
- 연도별 집계
- 사용자/포트폴리오 기준 집계
- realized gains/losses 기준
- 기본공제 적용
- 외국납부세액/원천징수 metadata 저장
- `estimate` badge 필수

필수 설정:
- `tax_year`
- `jurisdiction`
- `lot_method`
- `basic_deduction_krw`
- `rate_table_version`

## 8. Lending estimate
기본 식 예시:
`eligible_position_value * annualized_rate * eligible_days / 365`

필수 상태:
- `estimate`
- `actual`

실제 입금이 있으면 별도 income event로 적재한다.

## 9. Forecast
연말 예상치는 아래 요소를 조합한다.
- 현재 realized P/L
- open position unrealized P/L (선택적 포함)
- estimated dividends
- estimated tax
- estimated lending income
- 환율 가정치 (기본: current spot / latest reference)

## 10. Goal comparison
각 metric에 대해 항상 3열로 저장/표시한다.
- target_value
- forecast_value
- actual_value

금지:
- target_progress만 보여주고 actual/forecast source를 숨기는 것
