import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/market/prices/route";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("/api/market/prices", () => {
  it("returns chart prices and dividend events for a symbol", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          chart: {
            result: [
              {
                meta: { currency: "USD", symbol: "AAPL" },
                timestamp: [1762646400, 1762732800],
                indicators: {
                  quote: [
                    {
                      open: [200, 201],
                      high: [202, 203],
                      low: [198, 199],
                      close: [201, 202],
                      volume: [1000, 2000],
                    },
                  ],
                },
                events: {
                  dividends: {
                    d1: {
                      amount: 0.25,
                      date: 1762646400,
                    },
                  },
                },
              },
            ],
          },
        }),
        { status: 200 },
      ),
    );

    const response = await GET(
      new Request("http://localhost/api/market/prices?symbol=AAPL&range=1mo"),
    );

    expect(response.status).toBe(200);

    const payload = (await response.json()) as {
      symbol: string;
      provider: string;
      prices: Array<{ date: string; close: number }>;
      dividends: Array<{ date: string; amount: number; currency: string }>;
    };

    expect(payload.symbol).toBe("AAPL");
    expect(payload.prices).toHaveLength(2);
    expect(payload.dividends[0]).toMatchObject({
      amount: 0.25,
      currency: "USD",
    });
  });
});
