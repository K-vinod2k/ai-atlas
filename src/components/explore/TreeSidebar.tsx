"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import type { IndexedNode, NodeKind } from "@/data/types";
import { PROGRESS_COLOR, PROGRESS_LABEL } from "@/data/types";
import { nodeSearchText } from "@/data/taxonomy";
import { useProgress } from "@/components/progress/ProgressProvider";

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
  onSelectNode?: (id: string) => void;
}

export function TreeSidebar({
  roots,
  allNodes,
  selectedId,
  onSelectNode,
}: TreeSidebarProps) {
  const router = useRouter();
  const { statusOf } = useProgress();
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
    if (onSelectNode) {
      onSelectNode(id);
    } else {
      router.push(`/learn?node=${id}`);
    }
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
              className={`relative w-full flex items-center gap-1.5 px-2 py-2 rounded-lg text-left text-sm cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "tree-item-selected"
                  : "text-[color:var(--color-foreground)]/80 hover:bg-[rgba(127,163,192,0.06)] hover:text-[#7FA3C0]"
              }`}
              style={{ paddingLeft: depth * 14 + 10 }}
              aria-current={isSelected ? "page" : undefined}
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
                  className="w-5 h-5 flex items-center justify-center shrink-0 cursor-pointer text-[color:var(--color-muted-foreground)] hover:text-[#7FA3C0]"
                  aria-label={isOpen ? "Collapse" : "Expand"}
                >
                  {isOpen ? (
                    <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                </span>
              ) : (
                <span className="w-5 h-5 shrink-0" aria-hidden="true" />
              )}
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: PROGRESS_COLOR[statusOf(n.id)] }}
                title={PROGRESS_LABEL[statusOf(n.id)]}
                aria-hidden="true"
              />
              <span
                className={
                  isHit ? "font-semibold text-[#E8D5C4]" : ""
                }
              >
                {n.name}
              </span>
            </button>
            {hasChildren && isOpen && renderLevel(childNodes, depth + 1)}
          </div>
        );
      })}
    </>
  );

  const topChildren = roots;
  const hasResults = active
    ? Array.from(subtreeMatch.values()).some(Boolean)
    : true;

  return (
    <div className="flex flex-col h-full">
      <div
        className="p-3 border-b space-y-2.5"
        style={{ borderColor: "rgba(127,163,192,0.14)" }}
      >
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-[color:var(--color-muted-foreground)]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search terms..."
            aria-label="Search taxonomy terms"
            className="input-field pl-9 py-2"
          />
        </div>
        <div
          className="flex flex-wrap gap-1"
          role="group"
          aria-label="Filter by kind"
        >
          {KIND_OPTIONS.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => setKindFilter(k.id)}
              className={`filter-pill ${
                kindFilter === k.id ? "filter-pill-active" : ""
              }`}
              aria-pressed={kindFilter === k.id}
            >
              {k.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-2 pr-1 pl-1.5">
        {!hasResults ? (
          <p className="px-3 py-6 text-sm text-[color:var(--color-muted-foreground)] text-center">
            No terms match your search.
          </p>
        ) : (
          renderLevel(topChildren, 0)
        )}
      </div>
    </div>
  );
}
