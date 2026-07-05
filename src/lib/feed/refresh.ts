import { eq, desc, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { newsItems, newsNodeTags, feedMeta } from "@/db/schema";
import { fetchArxiv } from "./fetchers/arxiv";
import { fetchHackerNews } from "./fetchers/hackernews";
import { fetchRssFeeds } from "./fetchers/rss";
import { tagFeedItem, type RawFeedItem } from "./tagger";

const LAST_REFRESH_KEY = "last_refresh_at";
const DEFAULT_STALE_HOURS = 6;

export function getStaleHours(): number {
  const env = process.env.FEED_STALE_HOURS;
  return env ? parseInt(env, 10) : DEFAULT_STALE_HOURS;
}

export async function getLastRefreshAt(): Promise<string | null> {
  const db = getDb();
  const row = await db
    .select()
    .from(feedMeta)
    .where(eq(feedMeta.key, LAST_REFRESH_KEY))
    .limit(1);
  return row[0]?.value ?? null;
}

export function isFeedStale(lastRefresh: string | null): boolean {
  if (!lastRefresh) return true;
  const staleMs = getStaleHours() * 60 * 60 * 1000;
  return Date.now() - new Date(lastRefresh).getTime() > staleMs;
}

async function upsertItems(items: RawFeedItem[]) {
  const db = getDb();
  const now = new Date().toISOString();

  for (const item of items) {
    await db
      .insert(newsItems)
      .values({
        id: item.id,
        title: item.title,
        url: item.url,
        source: item.source,
        summary: item.summary ?? null,
        publishedAt: item.publishedAt,
        fetchedAt: now,
      })
      .onConflictDoUpdate({
        target: newsItems.id,
        set: {
          title: item.title,
          summary: item.summary ?? null,
          fetchedAt: now,
        },
      });

    const nodeIds = tagFeedItem(item);
    for (const nodeId of nodeIds) {
      await db
        .insert(newsNodeTags)
        .values({ newsId: item.id, nodeId })
        .onConflictDoNothing();
    }
  }
}

export async function refreshFeed(): Promise<{
  added: number;
  sources: Record<string, number>;
  errors: string[];
}> {
  const errors: string[] = [];
  const sources: Record<string, number> = {};
  const allItems: RawFeedItem[] = [];

  const fetchers: Array<{ name: string; fn: () => Promise<RawFeedItem[]> }> = [
    { name: "arXiv", fn: () => fetchArxiv(15) },
    { name: "Hacker News", fn: () => fetchHackerNews(15) },
    { name: "RSS", fn: () => fetchRssFeeds(5) },
  ];

  for (const { name, fn } of fetchers) {
    try {
      const items = await fn();
      sources[name] = items.length;
      allItems.push(...items);
    } catch (err) {
      errors.push(`${name}: ${err instanceof Error ? err.message : String(err)}`);
      sources[name] = 0;
    }
  }

  await upsertItems(allItems);

  const db = getDb();
  const now = new Date().toISOString();
  await db
    .insert(feedMeta)
    .values({ key: LAST_REFRESH_KEY, value: now })
    .onConflictDoUpdate({ target: feedMeta.key, set: { value: now } });

  return { added: allItems.length, sources, errors };
}

export async function getFeedItems(limit = 50) {
  const db = getDb();
  return db
    .select()
    .from(newsItems)
    .orderBy(desc(newsItems.publishedAt))
    .limit(limit);
}

export async function getNewsForNode(nodeId: string, limit = 10) {
  const db = getDb();
  const tags = await db
    .select()
    .from(newsNodeTags)
    .where(eq(newsNodeTags.nodeId, nodeId));

  if (tags.length === 0) return [];

  const ids = tags.map((t) => t.newsId);
  return db
    .select()
    .from(newsItems)
    .where(inArray(newsItems.id, ids))
    .orderBy(desc(newsItems.publishedAt))
    .limit(limit);
}

export async function getTagsForNews(newsId: string) {
  const db = getDb();
  return db
    .select()
    .from(newsNodeTags)
    .where(eq(newsNodeTags.newsId, newsId));
}
