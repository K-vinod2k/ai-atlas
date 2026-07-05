"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getNodeById } from "@/data/taxonomy";

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
      <section className="border-t border-neutral-200 pt-6">
        <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
          What&apos;s new
        </h2>
        <p className="text-sm text-neutral-400">Loading news...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="border-t border-neutral-200 pt-6">
        <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
          What&apos;s new
        </h2>
        <p className="text-sm text-red-600">{error}</p>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="border-t border-neutral-200 pt-6">
      <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
        What&apos;s new
      </h2>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="text-sm">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-800 hover:underline font-medium"
            >
              {item.title}
            </a>
            <span className="text-neutral-400 ml-2">{item.source}</span>
          </li>
        ))}
      </ul>
      <Link href="/feed" className="text-sm text-neutral-600 hover:underline mt-2 inline-block">
        View all news
      </Link>
    </section>
  );
}
