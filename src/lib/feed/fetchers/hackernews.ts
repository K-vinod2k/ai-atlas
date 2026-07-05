import type { RawFeedItem } from "../tagger";

interface HNHit {
  objectID: string;
  title: string;
  url?: string;
  story_url?: string;
  created_at: string;
  comment_text?: string;
}

export async function fetchHackerNews(maxResults = 20): Promise<RawFeedItem[]> {
  const queries = ["artificial intelligence", "machine learning", "large language model", "transformer"];
  const seen = new Set<string>();
  const items: RawFeedItem[] = [];

  for (const q of queries) {
    const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(q)}&tags=story&hitsPerPage=10`;
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) continue;

    const data = (await res.json()) as { hits: HNHit[] };
    for (const hit of data.hits) {
      if (seen.has(hit.objectID)) continue;
      seen.add(hit.objectID);
      items.push({
        id: `hn-${hit.objectID}`,
        title: hit.title,
        url: hit.url ?? hit.story_url ?? `https://news.ycombinator.com/item?id=${hit.objectID}`,
        source: "Hacker News",
        publishedAt: hit.created_at,
      });
      if (items.length >= maxResults) return items;
    }
  }

  return items;
}
