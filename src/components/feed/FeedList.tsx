"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { getNodeById } from "@/data/taxonomy";
import type { NewsItem } from "@/db/schema";

interface FeedListProps {
  initialItems: NewsItem[];
  lastRefresh: string | null;
  isStale: boolean;
}

export function FeedList({ initialItems, lastRefresh, isStale }: FeedListProps) {
  const [items, setItems] = useState(initialItems);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshInfo, setRefreshInfo] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    setRefreshInfo(null);
    try {
      const res = await fetch("/api/feed/refresh", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Refresh failed");
      setRefreshInfo(
        `Fetched ${data.added} items (${Object.entries(data.sources as Record<string, number>)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ")})`,
      );
      if (data.errors?.length) {
        setError(`Partial errors: ${(data.errors as string[]).join("; ")}`);
      }
      const listRes = await fetch("/api/feed");
      const listData = await listRes.json();
      setItems(listData.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Refresh failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm text-muted-foreground">
            {lastRefresh
              ? `Last refreshed: ${new Date(lastRefresh).toLocaleString()}`
              : "Never refreshed"}
            {isStale && (
              <span className="ml-2 text-accent font-medium">Feed may be stale</span>
            )}
          </p>
          {refreshInfo && (
            <p className="text-sm text-foreground/80 mt-1">{refreshInfo}</p>
          )}
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="btn-primary"
          aria-label="Refresh news feed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              Refresh feed
            </>
          )}
        </button>
      </div>

      {error && (
        <div
          className="text-sm rounded-xl p-4 text-destructive"
          style={{
            border: "1px solid color-mix(in srgb, var(--color-destructive) 30%, transparent)",
            background: "color-mix(in srgb, var(--color-destructive) 8%, var(--color-surface))",
          }}
          role="alert"
        >
          {error}
        </div>
      )}

      {loading && items.length === 0 && (
        <div className="space-y-4" aria-label="Loading feed" role="status">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card space-y-3" style={{ padding: "1.25rem" }}>
              <div className="skeleton h-5 w-3/4" />
              <div className="skeleton h-3 w-1/3" />
              <div className="skeleton h-4 w-full" />
            </div>
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="card text-center py-8">
          <p className="text-muted-foreground text-sm">
            No news items yet. Click Refresh to pull from arXiv, Hacker News, and lab blogs.
          </p>
        </div>
      )}

      <ul className="space-y-4">
        {items.map((item) => (
          <FeedItemRow key={item.id} item={item} />
        ))}
      </ul>
    </div>
  );
}

function FeedItemRow({ item }: { item: NewsItem }) {
  const [tags, setTags] = useState<string[]>([]);
  const [tagsLoading, setTagsLoading] = useState(true);

  useEffect(() => {
    setTagsLoading(true);
    fetch(`/api/feed/tags/${item.id}`)
      .then((r) => r.json())
      .then((d: { nodeIds: string[] }) => setTags(d.nodeIds))
      .catch(() => {})
      .finally(() => setTagsLoading(false));
  }, [item.id]);

  return (
    <li className="card card-interactive">
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-foreground font-semibold hover:text-primary transition-colors duration-200 inline-flex items-start gap-1.5 group"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {item.title}
        <ExternalLink
          className="w-3.5 h-3.5 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0"
          aria-hidden="true"
        />
      </a>
      <p className="text-xs text-muted-foreground mt-1.5">
        {item.source} · {new Date(item.publishedAt).toLocaleDateString()}
      </p>
      {item.summary && (
        <p className="text-sm text-foreground/80 mt-2 line-clamp-2">{item.summary}</p>
      )}
      {tagsLoading ? (
        <div className="flex gap-1.5 mt-3">
          <div className="skeleton h-5 w-16 rounded-full" />
          <div className="skeleton h-5 w-20 rounded-full" />
        </div>
      ) : tags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {tags.map((nodeId) => {
            const indexed = getNodeById(nodeId);
            return indexed ? (
              <Link
                key={nodeId}
                href={`/node/${nodeId}`}
                className="badge badge-primary text-xs hover:bg-primary/20 transition-colors duration-200 cursor-pointer"
              >
                {indexed.node.name}
              </Link>
            ) : null;
          })}
        </div>
      ) : null}
    </li>
  );
}
