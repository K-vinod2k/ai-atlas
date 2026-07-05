"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
          <p className="text-sm text-neutral-500">
            {lastRefresh
              ? `Last refreshed: ${new Date(lastRefresh).toLocaleString()}`
              : "Never refreshed"}
            {isStale && (
              <span className="ml-2 text-amber-700">Feed may be stale</span>
            )}
          </p>
          {refreshInfo && (
            <p className="text-sm text-neutral-600 mt-1">{refreshInfo}</p>
          )}
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium bg-neutral-800 text-white rounded-md hover:bg-neutral-700 disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh feed"}
        </button>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-800 text-sm rounded-lg p-4">
          {error}
        </div>
      )}

      {items.length === 0 && !loading && (
        <p className="text-neutral-500 text-sm">
          No news items yet. Click Refresh to pull from arXiv, Hacker News, and lab blogs.
        </p>
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

  useEffect(() => {
    fetch(`/api/feed/tags/${item.id}`)
      .then((r) => r.json())
      .then((d: { nodeIds: string[] }) => setTags(d.nodeIds))
      .catch(() => {});
  }, [item.id]);

  return (
    <li className="border border-neutral-200 rounded-lg p-4 bg-white">
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-neutral-900 font-medium hover:underline"
      >
        {item.title}
      </a>
      <p className="text-xs text-neutral-400 mt-1">
        {item.source} · {new Date(item.publishedAt).toLocaleDateString()}
      </p>
      {item.summary && (
        <p className="text-sm text-neutral-600 mt-2 line-clamp-2">{item.summary}</p>
      )}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {tags.map((nodeId) => {
            const indexed = getNodeById(nodeId);
            return indexed ? (
              <Link
                key={nodeId}
                href={`/node/${nodeId}`}
                className="text-xs px-2 py-0.5 rounded border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
              >
                {indexed.node.name}
              </Link>
            ) : null;
          })}
        </div>
      )}
    </li>
  );
}
