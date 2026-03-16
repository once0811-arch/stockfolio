import { describe, expect, it } from "vitest";

import { GET } from "@/app/api/positions/route";
import { clearLedgerForTests } from "@/src/server/ledger/in-memory-ledger";

describe("/api/positions current rate", () => {
  it("returns current value and unrealized rate for seeded demo holdings", async () => {
    await clearLedgerForTests();

    const response = await GET(
      new Request("http://localhost/api/positions?seedDemo=true"),
    );
    const payload = (await response.json()) as {
      positions: Array<{
        symbol: string;
        openQuantity: number;
        currentValueOriginal: number;
        unrealizedPnlOriginal: number;
        unrealizedPnlRatePct: number;
      }>;
    };

    const ionq = payload.positions.find((item) => item.symbol === "IONQ");
    const poet = payload.positions.find((item) => item.symbol === "POET");
    const tsla = payload.positions.find((item) => item.symbol === "TSLA");
    const intc = payload.positions.find((item) => item.symbol === "INTC");

    expect(response.status).toBe(200);
    expect(ionq?.openQuantity).toBe(115.606152);
    expect(Math.round(ionq?.currentValueOriginal ?? 0)).toBe(3867);
    expect(Math.round(ionq?.unrealizedPnlOriginal ?? 0)).toBe(-143);
    expect((ionq?.unrealizedPnlRatePct ?? 0).toFixed(2)).toBe("-3.56");

    expect(poet?.openQuantity).toBe(386.976336);
    expect((poet?.unrealizedPnlRatePct ?? 0).toFixed(2)).toBe("0.45");
    expect((tsla?.unrealizedPnlRatePct ?? 0).toFixed(2)).toBe("-4.94");
    expect((intc?.unrealizedPnlRatePct ?? 0).toFixed(2)).toBe("7.96");
  });
});
