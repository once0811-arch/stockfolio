import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { reconstructPositionFromLedger } from "@/src/domain/ledger/reconstruct-position";

type RegressionFixture = {
  trades: Array<{
    id: string;
    side: "BUY" | "SELL";
    quantity: number;
    priceOriginal: number;
    feeOriginal: number;
    currency: string;
    tradeDate: string;
    settlementDate: string;
    fxRateToKrw: number;
  }>;
  expected: {
    openQuantity: number;
    averageCostOriginal: number;
    remainingCostOriginal: number;
    realizedPnlOriginal: number;
  };
};

describe("reconstructPositionFromLedger", () => {
  it("reconstructs position and realized pnl from fixture regression case", () => {
    const fixturePath = resolve(
      process.cwd(),
      "tests/fixtures/ledger/reconstruction-case-001.json",
    );
    const fixture = JSON.parse(
      readFileSync(fixturePath, "utf-8"),
    ) as RegressionFixture;

    const result = reconstructPositionFromLedger(fixture.trades);

    expect(result.openQuantity).toBe(fixture.expected.openQuantity);
    expect(result.averageCostOriginal).toBe(fixture.expected.averageCostOriginal);
    expect(result.remainingCostOriginal).toBe(
      fixture.expected.remainingCostOriginal,
    );
    expect(result.realizedPnlOriginal).toBe(fixture.expected.realizedPnlOriginal);
  });

  it("throws when sell quantity exceeds remaining position", () => {
    expect(() =>
      reconstructPositionFromLedger([
        {
          id: "a1",
          side: "BUY",
          quantity: 1,
          priceOriginal: 100,
          feeOriginal: 0,
          currency: "USD",
          tradeDate: "2026-01-01T00:00:00.000Z",
          settlementDate: "2026-01-03T00:00:00.000Z",
          fxRateToKrw: 1300,
        },
        {
          id: "a2",
          side: "SELL",
          quantity: 2,
          priceOriginal: 110,
          feeOriginal: 0,
          currency: "USD",
          tradeDate: "2026-01-05T00:00:00.000Z",
          settlementDate: "2026-01-07T00:00:00.000Z",
          fxRateToKrw: 1300,
        },
      ]),
    ).toThrowError("Sell quantity exceeds open position");
  });
});
