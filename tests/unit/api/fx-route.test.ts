import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/fx/route";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("/api/fx", () => {
  it("returns a daily fx reference rate", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          amount: 1,
          base: "USD",
          date: "2026-03-13",
          rates: { KRW: 1491.7 },
        }),
        { status: 200 },
      ),
    );

    const response = await GET(
      new Request(
        "http://localhost/api/fx?base=USD&quote=KRW&date=2026-03-13",
      ),
    );

    expect(response.status).toBe(200);

    const payload = (await response.json()) as {
      base: string;
      quote: string;
      date: string;
      rate: number;
      provider: string;
    };

    expect(payload.base).toBe("USD");
    expect(payload.quote).toBe("KRW");
    expect(payload.rate).toBe(1491.7);
  });
});
