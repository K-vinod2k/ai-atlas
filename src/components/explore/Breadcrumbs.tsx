"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { TaxonomyNode } from "@/data/types";

interface BreadcrumbsProps {
  path: TaxonomyNode[];
}

export function Breadcrumbs({ path }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm">
      {path.map((node, i) => (
        <span key={node.id} className="flex items-center gap-1">
          {i > 0 && (
            <ChevronRight
              className="w-3.5 h-3.5 text-muted-foreground/50"
              aria-hidden="true"
            />
          )}
          {i < path.length - 1 ? (
            <Link
              href={`/node/${node.id}`}
              className="text-muted-foreground hover:text-primary transition-colors duration-200 cursor-pointer"
            >
              {node.name}
            </Link>
          ) : (
            <span className="text-foreground font-medium" aria-current="page">
              {node.name}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
