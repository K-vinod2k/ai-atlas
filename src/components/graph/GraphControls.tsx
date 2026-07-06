"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { searchNodes } from "@/data/taxonomy";
import { KIND_LABEL } from "@/data/types";
import type { NodeKind } from "@/data/types";
import {
  BRANCH_COLORS,
  BRANCH_LABEL,
  EDGE_GROUP_LABEL,
} from "@/lib/graph/view-model";
import type { EdgeGroup } from "@/lib/graph/view-model";

const EDGE_GROUPS: EdgeGroup[] = ["hierarchy", "association", "differs", "related"];
const KINDS: Array<NodeKind | "all"> = [
  "all",
  "paradigm",
  "concept",
  "family",
  "component",
  "model",
  "tool",
  "process",
  "connector",
  "unit",
];

const EDGE_SWATCH: Record<EdgeGroup, React.ReactNode> = {
  hierarchy: (
    <svg width="26" height="8" aria-hidden="true">
      <line x1="0" y1="4" x2="26" y2="4" stroke="#7FA3C0" strokeWidth="1.6" />
    </svg>
  ),
  association: (
    <svg width="26" height="8" aria-hidden="true">
      <line x1="0" y1="4" x2="26" y2="4" stroke="#C8A88E" strokeWidth="1.6" strokeDasharray="6 4" />
    </svg>
  ),
  differs: (
    <svg width="26" height="8" aria-hidden="true">
      <line x1="0" y1="4" x2="26" y2="4" stroke="#E0897A" strokeWidth="1.6" strokeDasharray="2 4" />
    </svg>
  ),
  related: (
    <svg width="26" height="8" aria-hidden="true">
      <line x1="0" y1="4" x2="26" y2="4" stroke="#94B4A4" strokeWidth="1.4" strokeDasharray="1 4" />
    </svg>
  ),
};

interface GraphControlsProps {
  edgeGroups: Set<EdgeGroup>;
  kind: NodeKind | "all";
  focusId: string | null;
  focusDepth: number;
  focusName?: string;
  onToggleEdgeGroup: (group: EdgeGroup) => void;
  onKindChange: (kind: NodeKind | "all") => void;
  onFocus: (id: string) => void;
  onClearFocus: () => void;
  onDepthChange: (depth: number) => void;
}

export function GraphControls({
  edgeGroups,
  kind,
  focusId,
  focusDepth,
  focusName,
  onToggleEdgeGroup,
  onKindChange,
  onFocus,
  onClearFocus,
  onDepthChange,
}: GraphControlsProps) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (query.trim().length < 2) return [];
    return searchNodes({ query, limit: 6 });
  }, [query]);

  return (
    <div className="flex flex-col gap-5">
      <div className="relative">
        <label htmlFor="graph-search" className="section-label block mb-2">
          Search and focus
        </label>
        <div className="relative">
          <Search
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--color-subtle-foreground)]"
            aria-hidden="true"
          />
          <input
            id="graph-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. attention, LoRA, RAG"
            className="w-full rounded-lg border bg-[rgba(10,14,19,0.6)] pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-[color:var(--color-subtle-foreground)] focus:outline-none focus:ring-1 focus:ring-[#7FA3C0]"
            style={{ borderColor: "rgba(138,122,109,0.32)" }}
          />
        </div>
        {results.length > 0 && (
          <ul
            className="absolute z-20 mt-1 w-full rounded-lg border bg-[#10151C] shadow-lg overflow-hidden"
            style={{ borderColor: "rgba(138,122,109,0.4)" }}
          >
            {results.map((r) => (
              <li key={r.node.id}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-[rgba(127,163,192,0.12)] cursor-pointer"
                  onClick={() => {
                    onFocus(r.node.id);
                    setQuery("");
                  }}
                >
                  <span className="font-medium text-foreground">{r.node.name}</span>
                  <span className="ml-2 text-[11px] text-[color:var(--color-subtle-foreground)]">
                    {KIND_LABEL[r.node.kind]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {focusId && (
        <div
          className="rounded-lg border px-3 py-2.5 flex items-center gap-2"
          style={{ borderColor: "rgba(232,213,196,0.35)", background: "rgba(232,213,196,0.06)" }}
        >
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[color:var(--color-muted-foreground)]">Focused on</p>
            <p className="text-sm font-semibold text-[#E8D5C4] truncate">{focusName ?? focusId}</p>
            <label htmlFor="graph-depth" className="mt-2 block text-xs text-[color:var(--color-muted-foreground)]">
              Neighborhood depth: {focusDepth}
            </label>
            <input
              id="graph-depth"
              type="range"
              min={1}
              max={4}
              step={1}
              value={focusDepth}
              onChange={(e) => onDepthChange(Number(e.target.value))}
              className="w-full accent-[#7FA3C0]"
            />
          </div>
          <button
            type="button"
            onClick={onClearFocus}
            className="p-1.5 rounded-md hover:bg-[rgba(242,239,236,0.08)] cursor-pointer"
            aria-label="Clear focus"
          >
            <X className="w-4 h-4 text-[color:var(--color-muted-foreground)]" aria-hidden="true" />
          </button>
        </div>
      )}

      <fieldset>
        <legend className="section-label mb-2">Relation types</legend>
        <div className="flex flex-col gap-1.5">
          {EDGE_GROUPS.map((group) => (
            <label
              key={group}
              className="flex items-center gap-2.5 text-sm cursor-pointer text-[color:var(--color-muted-foreground)] hover:text-foreground"
            >
              <input
                type="checkbox"
                checked={edgeGroups.has(group)}
                onChange={() => onToggleEdgeGroup(group)}
                className="accent-[#7FA3C0]"
              />
              {EDGE_SWATCH[group]}
              <span>{EDGE_GROUP_LABEL[group]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="graph-kind" className="section-label block mb-2">
          Node kind
        </label>
        <select
          id="graph-kind"
          value={kind}
          onChange={(e) => onKindChange(e.target.value as NodeKind | "all")}
          className="w-full rounded-lg border bg-[rgba(10,14,19,0.6)] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#7FA3C0] cursor-pointer"
          style={{ borderColor: "rgba(138,122,109,0.32)" }}
        >
          {KINDS.map((k) => (
            <option key={k} value={k}>
              {k === "all" ? "All kinds" : KIND_LABEL[k]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="section-label mb-2">Branches</p>
        <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          {Object.entries(BRANCH_LABEL)
            .filter(([id]) => id !== "ai")
            .map(([id, label]) => (
              <li key={id} className="flex items-center gap-2 text-xs text-[color:var(--color-muted-foreground)]">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: BRANCH_COLORS[id] }}
                  aria-hidden="true"
                />
                {label}
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
