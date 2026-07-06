"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { TaxonomyNode } from "@/data/types";

interface BreadcrumbsProps {
  path: TaxonomyNode[];
  onSelectNode?: (id: string) => void;
}

export function Breadcrumbs({ path, onSelectNode }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-1 text-xs"
    >
      {path.map((node, i) => (
        <span key={node.id} className="flex items-center gap-1">
          {i > 0 && (
            <ChevronRight
              className="w-3 h-3"
              style={{ color: "rgba(127,163,192,0.4)" }}
              aria-hidden="true"
            />
          )}
          {i < path.length - 1 ? (
            onSelectNode ? (
              <button
                type="button"
                onClick={() => onSelectNode(node.id)}
                className="text-[color:var(--color-muted-foreground)] hover:text-[#7FA3C0] transition-colors duration-200 cursor-pointer tracking-wide uppercase"
              >
                {node.name}
              </button>
            ) : (
              <Link
                href={`/node/${node.id}`}
                className="text-[color:var(--color-muted-foreground)] hover:text-[#7FA3C0] transition-colors duration-200 cursor-pointer tracking-wide uppercase"
              >
                {node.name}
              </Link>
            )
          ) : (
            <span
              className="font-semibold tracking-wide uppercase"
              style={{ color: "#E8D5C4" }}
              aria-current="page"
            >
              {node.name}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
