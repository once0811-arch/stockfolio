import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/news/route";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("/api/news", () => {
  it("returns related news items for a symbol from RSS", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        `<?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0"><channel>
          <item>
            <title>AAPL headline</title>
            <link>https://news.google.com/rss/articles/abc</link>
            <pubDate>Mon, 16 Mar 2026 13:00:00 GMT</pubDate>
            <source url="https://example.com">Example Media</source>
          </item>
        </channel></rss>`,
        { status: 200, headers: { "Content-Type": "application/xml" } },
      ),
    );

    const response = await GET(
      new Request("http://localhost/api/news?symbol=AAPL&max=5"),
    );

    expect(response.status).toBe(200);

    const payload = (await response.json()) as {
      symbol: string;
      provider: string;
      items: Array<{ title: string; source: string; url: string }>;
    };

    expect(payload.symbol).toBe("AAPL");
    expect(payload.items).toHaveLength(1);
    expect(payload.items[0]).toMatchObject({
      title: "AAPL headline",
      source: "Example Media",
      url: "https://news.google.com/rss/articles/abc",
    });
  });
});
