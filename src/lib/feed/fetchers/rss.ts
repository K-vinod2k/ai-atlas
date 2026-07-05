import Parser from "rss-parser";
import type { RawFeedItem } from "../tagger";

const RSS_FEEDS: Array<{ url: string; source: string }> = [
  { url: "https://openai.com/blog/rss.xml", source: "OpenAI Blog" },
  { url: "https://www.anthropic.com/rss.xml", source: "Anthropic Blog" },
  { url: "https://ai.googleblog.com/feeds/posts/default", source: "Google AI Blog" },
  { url: "https://huggingface.co/blog/feed.xml", source: "Hugging Face Blog" },
];

export async function fetchRssFeeds(maxPerFeed = 5): Promise<RawFeedItem[]> {
  const parser = new Parser({ timeout: 10000 });
  const items: RawFeedItem[] = [];

  for (const feed of RSS_FEEDS) {
    try {
      const parsed = await parser.parseURL(feed.url);
      const entries = (parsed.items ?? []).slice(0, maxPerFeed);
      for (const entry of entries) {
        if (!entry.title || !entry.link) continue;
        const id = `rss-${feed.source}-${entry.guid ?? entry.link}`.replace(/[^a-zA-Z0-9-]/g, "-");
        items.push({
          id,
          title: entry.title,
          url: entry.link,
          source: feed.source,
          summary: entry.contentSnippet ?? entry.summary,
          publishedAt: entry.isoDate ?? entry.pubDate ?? new Date().toISOString(),
        });
      }
    } catch {
      // Skip feeds that fail (CORS, 404, etc.)
    }
  }

  return items;
}
