"use client";

import { useMemo } from "react";
import { ArrowRight, Route, X } from "lucide-react";
import { getNodeById } from "@/data/taxonomy";
import { pathBetween, stepLabel } from "@/lib/graph/query";
import type { PathStep } from "@/lib/graph/query";

interface PathPanelProps {
  pathA: string | null;
  pathB: string | null;
  onClear: () => void;
  onSelectNode: (id: string) => void;
}

export interface PathHighlight {
  nodeIds: Set<string>;
  edgeKeys: Set<string>;
}

export function computePathHighlight(steps: PathStep[] | null): PathHighlight | null {
  if (!steps || steps.length === 0) return null;
  const nodeIds = new Set<string>([steps[0].from]);
  const edgeKeys = new Set<string>();
  for (const step of steps) {
    nodeIds.add(step.to);
    edgeKeys.add(`${step.from}|${step.to}`);
  }
  return { nodeIds, edgeKeys };
}

function nodeName(id: string): string {
  return getNodeById(id)?.node.name ?? id;
}

export function PathPanel({ pathA, pathB, onClear, onSelectNode }: PathPanelProps) {
  const steps = useMemo(
    () => (pathA && pathB ? pathBetween(pathA, pathB) : null),
    [pathA, pathB],
  );

  if (!pathA && !pathB) return null;

  return (
    <section
      className="glass-panel rounded-2xl px-4 py-3"
      aria-label="Path between concepts"
    >
      <header className="flex items-center gap-2 mb-2">
        <Route className="w-4 h-4 text-[#7FA3C0]" aria-hidden="true" />
        <p className="section-label">Path between concepts</p>
        <button
          type="button"
          onClick={onClear}
          className="ml-auto p-1 rounded-md hover:bg-[rgba(242,239,236,0.08)] cursor-pointer"
          aria-label="Clear path"
        >
          <X className="w-3.5 h-3.5 text-[color:var(--color-muted-foreground)]" aria-hidden="true" />
        </button>
      </header>

      {(!pathA || !pathB) && (
        <p className="text-sm text-[color:var(--color-muted-foreground)]">
          {pathA
            ? `Start: ${nodeName(pathA)}. Pick a second node ("Path end") to trace the connection.`
            : `End: ${nodeName(pathB!)}. Pick a start node ("Path start") to trace the connection.`}
        </p>
      )}

      {pathA && pathB && steps === null && (
        <p className="text-sm text-[color:var(--color-destructive)]">
          No path found between {nodeName(pathA)} and {nodeName(pathB)}.
        </p>
      )}

      {pathA && pathB && steps !== null && (
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2 text-sm">
          <button
            type="button"
            onClick={() => onSelectNode(pathA)}
            className="font-semibold text-[#E8D5C4] hover:underline cursor-pointer"
          >
            {nodeName(pathA)}
          </button>
          {steps.map((step) => (
            <span key={`${step.from}-${step.to}`} className="inline-flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wide text-[#C8A88E]">
                {stepLabel(step)}
                <ArrowRight className="w-3 h-3" aria-hidden="true" />
              </span>
              <button
                type="button"
                onClick={() => onSelectNode(step.to)}
                className="font-semibold text-[#E8D5C4] hover:underline cursor-pointer"
              >
                {nodeName(step.to)}
              </button>
            </span>
          ))}
          <span className="w-full text-xs text-[color:var(--color-subtle-foreground)]">
            {steps.length} hop{steps.length === 1 ? "" : "s"}
          </span>
        </div>
      )}
    </section>
  );
}
