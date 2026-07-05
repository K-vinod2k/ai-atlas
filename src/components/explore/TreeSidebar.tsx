"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import type { IndexedNode, NodeKind } from "@/data/types";
import { nodeSearchText } from "@/data/taxonomy";

const KIND_OPTIONS: Array<{ id: NodeKind | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "model", label: "Models" },
  { id: "tool", label: "Tools" },
  { id: "family", label: "Architectures" },
  { id: "concept", label: "Concepts" },
  { id: "connector", label: "Connectors" },
  { id: "process", label: "Processes" },
  { id: "unit", label: "Units" },
];

interface TreeSidebarProps {
  roots: IndexedNode[];
  allNodes: IndexedNode[];
  selectedId: string;
}

export function TreeSidebar({ roots, allNodes, selectedId }: TreeSidebarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<NodeKind | "all">("all");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    ai: true,
    paradigms: true,
    arch: true,
    stack: true,
    apps: true,
    knowledge: true,
    modalities: true,
    governance: true,
  });

  const q = query.trim().toLowerCase();
  const active = q !== "" || kindFilter !== "all";

  const nodeMatches = useCallback(
    (n: IndexedNode["node"]) => {
      const qOk = q === "" || nodeSearchText(n).includes(q);
      const kOk = kindFilter === "all" || n.kind === kindFilter;
      return qOk && kOk;
    },
    [q, kindFilter],
  );

  const subtreeMatch = useMemo(() => {
    const cache = new Map<string, boolean>();
    const byParent = new Map<string | null, IndexedNode[]>();
    for (const indexed of allNodes) {
      const parentId =
        indexed.pathIds.length > 1
          ? indexed.pathIds[indexed.pathIds.length - 2]
          : null;
      const list = byParent.get(parentId) ?? [];
      list.push(indexed);
      byParent.set(parentId, list);
    }

    const visit = (id: string): boolean => {
      const indexed = allNodes.find((n) => n.node.id === id);
      if (!indexed) return false;
      let has = nodeMatches(indexed.node);
      const children = byParent.get(id) ?? [];
      for (const child of children) {
        if (visit(child.node.id)) has = true;
      }
      cache.set(id, has);
      return has;
    };

    visit("ai");
    return cache;
  }, [allNodes, nodeMatches]);

  const toggle = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const selectNode = (id: string) => {
    router.push(`/node/${id}`);
    const indexed = allNodes.find((n) => n.node.id === id);
    if (indexed) {
      setExpanded((prev) => {
        const next = { ...prev };
        indexed.pathIds.forEach((pid) => {
          if (allNodes.some((n) => n.node.id === pid && n.node.children?.length)) {
            next[pid] = true;
          }
        });
        return next;
      });
    }
  };

  const renderLevel = (nodes: IndexedNode[], depth: number) => (
    <>
      {nodes.map((indexed) => {
        const n = indexed.node;
        if (active && !subtreeMatch.get(n.id)) return null;
        const hasChildren = !!(n.children && n.children.length);
        const isOpen = active
          ? hasChildren && subtreeMatch.get(n.id)
          : !!expanded[n.id];
        const isSelected = n.id === selectedId;
        const isHit = active && nodeMatches(n);
        const childNodes = (n.children ?? [])
          .map((c) => allNodes.find((x) => x.node.id === c.id))
          .filter((x): x is IndexedNode => x !== undefined);

        return (
          <div key={n.id}>
            <button
              type="button"
              onClick={() => selectNode(n.id)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-sm ${
                isSelected
                  ? "bg-neutral-100 text-neutral-900 font-medium"
                  : "text-neutral-600 hover:bg-neutral-50"
              }`}
              style={{ paddingLeft: depth * 16 + 8 }}
            >
              {hasChildren ? (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(n.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.stopPropagation();
                      toggle(n.id);
                    }
                  }}
                  className="w-3 text-neutral-400 text-xs select-none"
                >
                  {isOpen ? "\u25be" : "\u25b8"}
                </span>
              ) : (
                <span className="w-3 text-neutral-300 text-xs">·</span>
              )}
              <span className={isHit ? "font-semibold" : ""}>{n.name}</span>
            </button>
            {hasChildren && isOpen && renderLevel(childNodes, depth + 1)}
          </div>
        );
      })}
    </>
  );

  const topChildren = roots;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-neutral-200 space-y-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search terms..."
          className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-400"
        />
        <div className="flex flex-wrap gap-1">
          {KIND_OPTIONS.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => setKindFilter(k.id)}
              className={`text-xs px-2 py-1 rounded border ${
                kindFilter === k.id
                  ? "bg-neutral-800 text-white border-neutral-800"
                  : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">{renderLevel(topChildren, 0)}</div>
    </div>
  );
}
