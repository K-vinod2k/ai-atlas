import Link from "next/link";
import type { TaxonomyNode } from "@/data/types";

interface BreadcrumbsProps {
  path: TaxonomyNode[];
}

export function Breadcrumbs({ path }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-neutral-500">
      {path.map((node, i) => (
        <span key={node.id} className="flex items-center gap-1">
          {i > 0 && <span className="text-neutral-300">/</span>}
          {i < path.length - 1 ? (
            <Link href={`/node/${node.id}`} className="hover:text-neutral-800">
              {node.name}
            </Link>
          ) : (
            <span className="text-neutral-700">{node.name}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
