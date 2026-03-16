import { describe, expect, it } from "vitest";

import { calculateUnrealizedPnlOriginal } from "@/src/domain/calculations/unrealized-pnl";

describe("calculateUnrealizedPnlOriginal", () => {
  it("calculates unrealized pnl from open quantity and average cost", () => {
    const result = calculateUnrealizedPnlOriginal({
      openQuantity: 7,
      averageCostOriginal: 106.8,
      marketPriceOriginal: 110,
    });

    expect(result).toBe(22.4);
  });

  it("returns zero when open quantity is zero", () => {
    const result = calculateUnrealizedPnlOriginal({
      openQuantity: 0,
      averageCostOriginal: 106.8,
      marketPriceOriginal: 110,
    });

    expect(result).toBe(0);
  });
});
