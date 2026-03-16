import { describe, expect, it } from "vitest";

import { getFxSnapshotDate } from "@/src/domain/calculations/fx-snapshot-date";

describe("getFxSnapshotDate", () => {
  it("uses settlement date as KRW conversion snapshot date", () => {
    const tradeDate = new Date("2026-03-10T00:00:00.000Z");
    const settlementDate = new Date("2026-03-12T00:00:00.000Z");

    const snapshotDate = getFxSnapshotDate(tradeDate, settlementDate);

    expect(snapshotDate.toISOString()).toBe(settlementDate.toISOString());
  });
});
