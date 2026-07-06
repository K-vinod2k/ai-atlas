"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Loader2 } from "lucide-react";
import type { NewsItem } from "@/db/schema";

interface NodeNewsProps {
  nodeId: string;
}

export function NodeNews({ nodeId }: NodeNewsProps) {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/feed/node/${nodeId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load news");
        return r.json();
      })
      .then((data: { items: NewsItem[] }) => setItems(data.items))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [nodeId]);

  if (loading) {
    return (
      <section
        className="border-t pt-6"
        style={{ borderColor: "color-mix(in srgb, var(--color-border) 40%, transparent)" }}
      >
        <h2 className="section-label mb-3">What&apos;s new</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          <span>Loading news...</span>
        </div>
        <div className="space-y-2 mt-3">
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-4/5" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        className="border-t pt-6"
        style={{ borderColor: "color-mix(in srgb, var(--color-border) 40%, transparent)" }}
      >
        <h2 className="section-label mb-3">What&apos;s new</h2>
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section
      className="border-t pt-6"
      style={{ borderColor: "color-mix(in srgb, var(--color-border) 40%, transparent)" }}
    >
      <h2 className="section-label mb-3">What&apos;s new</h2>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="text-sm">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary font-medium transition-colors duration-200 inline-flex items-center gap-1.5 group cursor-pointer"
            >
              {item.title}
              <ExternalLink
                className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                aria-hidden="true"
              />
            </a>
            <span className="text-muted-foreground ml-2">{item.source}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/feed"
        className="text-sm text-primary hover:underline mt-3 inline-block cursor-pointer transition-colors duration-200"
      >
        View all news
      </Link>
    </section>
  );
}
