import { AppShell } from "@/components/layout/AppShell";
import { FeedList } from "@/components/feed/FeedList";
import {
  getFeedItems,
  getLastRefreshAt,
  isFeedStale,
} from "@/lib/feed/refresh";

export default async function FeedPage() {
  const [items, lastRefresh] = await Promise.all([
    getFeedItems(50),
    getLastRefreshAt(),
  ]);
  const stale = isFeedStale(lastRefresh);

  return (
    <AppShell>
      <div className="max-w-3xl">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-2">News Feed</h1>
        <p className="text-sm text-neutral-500 mb-6">
          arXiv, Hacker News, and lab blogs auto-tagged to map nodes.
        </p>
        <FeedList
          initialItems={items}
          lastRefresh={lastRefresh}
          isStale={stale}
        />
      </div>
    </AppShell>
  );
}
