"use client";

import Link from "next/link";
import { useMemo } from "react";
import { BookOpen, GitBranch, X } from "lucide-react";
import { getNodeById } from "@/data/taxonomy";
import { KIND_LABEL } from "@/data/types";
import { neighbors } from "@/lib/graph/query";
import { PREDICATE_LABEL } from "@/lib/graph/triples";
import type { Neighbor } from "@/lib/graph/query";
import { BRANCH_COLORS, edgeGroupOf } from "@/lib/graph/view-model";

interface GraphSidePanelProps {
  nodeId: string;
  onClose: () => void;
  onSelectNode: (id: string) => void;
  onSetPathEndpoint: (slot: "a" | "b", id: string) => void;
}

const GROUP_RANK = { hierarchy: 0, association: 1, differs: 2, related: 3 } as const;

function groupNeighbors(list: Neighbor[]): Map<string, Neighbor[]> {
  const sorted = [...list].sort(
    (a, b) =>
      GROUP_RANK[edgeGroupOf(a.predicate)] - GROUP_RANK[edgeGroupOf(b.predicate)] ||
      (b.triple.weight ?? 0) - (a.triple.weight ?? 0),
  );
  const groups = new Map<string, Neighbor[]>();
  for (const n of sorted) {
    const label = n.direction === "out"
      ? PREDICATE_LABEL[n.predicate]
      : `${PREDICATE_LABEL[n.predicate]} (incoming)`;
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(n);
  }
  return groups;
}

export function GraphSidePanel({
  nodeId,
  onClose,
  onSelectNode,
  onSetPathEndpoint,
}: GraphSidePanelProps) {
  const indexed = getNodeById(nodeId);
  const nodeNeighbors = useMemo(() => neighbors(nodeId), [nodeId]);
  const grouped = useMemo(() => groupNeighbors(nodeNeighbors), [nodeNeighbors]);

  if (!indexed) return null;
  const { node, branchId } = indexed;

  return (
    <aside
      className="glass-panel rounded-2xl overflow-hidden flex flex-col h-full"
      aria-label={`Details for ${node.name}`}
    >
      <header
        className="px-4 py-3 border-b flex items-start gap-3"
        style={{ borderColor: "rgba(127,163,192,0.18)" }}
      >
        <span
          className="mt-1 w-3 h-3 rounded-full shrink-0"
          style={{ background: BRANCH_COLORS[branchId] ?? "#7FA3C0" }}
          aria-hidden="true"
        />
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold leading-tight text-foreground">
            {node.name}
          </h2>
          <p className="text-[11px] uppercase tracking-wide text-[color:var(--color-subtle-foreground)] mt-0.5">
            {KIND_LABEL[node.kind]} · {nodeNeighbors.length} relations
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-[rgba(242,239,236,0.08)] cursor-pointer"
          aria-label="Close details"
        >
          <X className="w-4 h-4 text-[color:var(--color-muted-foreground)]" aria-hidden="true" />
        </button>
      </header>

      <div className="p-4 overflow-y-auto flex-1 space-y-4">
        <p className="text-sm leading-relaxed text-[color:var(--color-muted-foreground)]">
          {node.one}
        </p>
        {node.differs && (
          <p className="text-sm leading-relaxed text-[color:var(--color-muted-foreground)]">
            <span className="font-semibold text-[#E8D5C4]">Differs: </span>
            {node.differs}
          </p>
        )}
        {node.ex && node.ex.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {node.ex.map((example) => (
              <span
                key={example}
                className="text-[11px] px-2 py-0.5 rounded-full border text-[color:var(--color-muted-foreground)]"
                style={{ borderColor: "rgba(138,122,109,0.32)" }}
              >
                {example}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/learn?node=${node.id}`}
            className="btn-secondary text-xs px-3 py-1.5 inline-flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
            Open in Learn
          </Link>
          <button
            type="button"
            onClick={() => onSetPathEndpoint("a", node.id)}
            className="btn-secondary text-xs px-3 py-1.5 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <GitBranch className="w-3.5 h-3.5" aria-hidden="true" />
            Path start
          </button>
          <button
            type="button"
            onClick={() => onSetPathEndpoint("b", node.id)}
            className="btn-secondary text-xs px-3 py-1.5 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <GitBranch className="w-3.5 h-3.5 rotate-180" aria-hidden="true" />
            Path end
          </button>
        </div>

        {Array.from(grouped.entries()).map(([label, list]) => (
          <div key={label}>
            <p className="section-label mb-1.5">{label}</p>
            <ul className="space-y-1">
              {list.map((n) => {
                const target = getNodeById(n.id);
                if (!target) return null;
                return (
                  <li key={`${label}-${n.id}`}>
                    <button
                      type="button"
                      onClick={() => onSelectNode(n.id)}
                      className="text-sm text-[#7FA3C0] hover:text-[#E8D5C4] transition-colors cursor-pointer text-left"
                    >
                      {target.node.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}
