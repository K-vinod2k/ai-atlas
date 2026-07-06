"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Loader2, Newspaper } from "lucide-react";
import type { NewsItem } from "@/db/schema";

interface NodeNewsCardProps {
  nodeId: string;
}

export function NodeNewsCard({ nodeId }: NodeNewsCardProps) {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/feed/node/${nodeId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load news");
        return r.json();
      })
      .then((data: { items: NewsItem[] }) => {
        if (!cancelled) setItems(data.items);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [nodeId]);

  return (
    <section
      className="glass-panel rounded-2xl overflow-hidden fade-in"
      aria-label="What's new for this concept"
    >
      <header
        className="px-4 py-3 border-b flex items-center gap-2"
        style={{ borderColor: "rgba(127,163,192,0.18)" }}
      >
        <Newspaper className="w-4 h-4 text-[#7FA3C0]" aria-hidden="true" />
        <p className="section-label">What&apos;s new</p>
        {!loading && items.length > 0 && (
          <span className="badge-highlight badge ml-auto">
            {items.length} new
          </span>
        )}
      </header>

      <div className="p-4">
        {loading && (
          <div
            className="flex items-center gap-2 text-sm text-[color:var(--color-muted-foreground)]"
            role="status"
          >
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            <span>Loading news...</span>
          </div>
        )}

        {!loading && error && (
          <p className="text-sm text-[color:var(--color-destructive)]" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && items.length === 0 && (
          <p className="text-sm text-[color:var(--color-muted-foreground)]">
            No recent articles tagged for this concept.
          </p>
        )}

        {!loading && !error && items.length > 0 && (
          <ul className="space-y-3">
            {items.slice(0, 5).map((item) => (
              <li key={item.id} className="text-sm">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-start gap-2 text-foreground hover:text-[#7FA3C0] transition-colors duration-200 cursor-pointer"
                >
                  <span className="mt-1 w-1.5 h-1.5 rounded-full shrink-0 bg-[#7FA3C0]" aria-hidden="true" />
                  <span className="flex-1 leading-snug font-medium">
                    {item.title}
                    <ExternalLink
                      className="w-3 h-3 inline-block ml-1 -translate-y-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      aria-hidden="true"
                    />
                  </span>
                </a>
                <span className="ml-3.5 text-[11px] text-[color:var(--color-subtle-foreground)]">
                  {item.source}
                </span>
              </li>
            ))}
          </ul>
        )}

        {!loading && !error && items.length > 0 && (
          <Link
            href="/feed"
            className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#7FA3C0] hover:text-[#E8D5C4] transition-colors duration-200 cursor-pointer"
          >
            View all news
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </Link>
        )}
      </div>
    </section>
  );
}
