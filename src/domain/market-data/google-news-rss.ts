import type { RelatedNewsItem } from "@/src/domain/market-data/types";

type GoogleNewsResult = {
  provider: string;
  usageNotice: string;
  items: RelatedNewsItem[];
};

function decodeXmlEntity(value: string): string {
  return value
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&amp;", "&")
    .trim();
}

function extractTag(block: string, tag: string): string {
  const matched = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return matched?.[1] ? decodeXmlEntity(matched[1]) : "";
}

export async function getRelatedNewsFromGoogleRss(
  symbol: string,
  max: number,
): Promise<GoogleNewsResult> {
  const safeMax = Number.isFinite(max) ? Math.min(Math.max(max, 1), 20) : 10;
  const query = `${symbol.toUpperCase()} stock`;
  const url = new URL("https://news.google.com/rss/search");
  url.searchParams.set("q", query);
  url.searchParams.set("hl", "en-US");
  url.searchParams.set("gl", "US");
  url.searchParams.set("ceid", "US:en");

  const response = await fetch(url.toString(), {
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) {
    throw new Error(`Google News RSS error: ${response.status}`);
  }

  const xml = await response.text();
  const itemBlocks = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];

  const items = itemBlocks.slice(0, safeMax).map((block) => ({
    title: extractTag(block, "title"),
    url: extractTag(block, "link"),
    source: extractTag(block, "source") || "Google News",
    publishedAt: extractTag(block, "pubDate"),
  }));

  return {
    provider: "google-news-rss",
    usageNotice:
      "Google News RSS feed usage is intended for personal, non-commercial feed reader scenarios.",
    items: items.filter((item) => item.title && item.url),
  };
}
