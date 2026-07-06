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
      <div className="max-w-3xl pb-24 lg:pb-0">
        <header className="mb-8">
          <h1
            className="text-2xl lg:text-3xl font-semibold text-foreground mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            News Feed
          </h1>
          <p className="text-sm text-muted-foreground">
            arXiv, Hacker News, and lab blogs auto-tagged to map nodes.
          </p>
        </header>
        <FeedList
          initialItems={items}
          lastRefresh={lastRefresh}
          isStale={stale}
        />
      </div>
    </AppShell>
  );
}
