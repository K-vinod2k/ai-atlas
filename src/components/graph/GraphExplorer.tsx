"use client";

import { useCallback, useMemo, useState } from "react";
import { getNodeById } from "@/data/taxonomy";
import type { NodeKind } from "@/data/types";
import { buildGraphView } from "@/lib/graph/view-model";
import type { EdgeGroup } from "@/lib/graph/view-model";
import { pathBetween } from "@/lib/graph/query";
import { TRIPLE_COUNT_BY_PREDICATE } from "@/lib/graph/triples";
import { GraphCanvas } from "./GraphCanvas";
import { GraphControls } from "./GraphControls";
import { GraphSidePanel } from "./GraphSidePanel";
import { PathPanel, computePathHighlight } from "./PathPanel";

/** related_to (1000+ mined edges) is off by default to keep the canvas readable. */
const DEFAULT_EDGE_GROUPS: EdgeGroup[] = ["hierarchy", "association", "differs"];

interface GraphExplorerProps {
  initialNodeId?: string;
}

export function GraphExplorer({ initialNodeId }: GraphExplorerProps) {
  const [edgeGroups, setEdgeGroups] = useState<Set<EdgeGroup>>(
    new Set(DEFAULT_EDGE_GROUPS),
  );
  const [kind, setKind] = useState<NodeKind | "all">("all");
  const [focusId, setFocusId] = useState<string | null>(initialNodeId ?? null);
  const [focusDepth, setFocusDepth] = useState(2);
  const [selectedId, setSelectedId] = useState<string | null>(initialNodeId ?? null);
  const [pathA, setPathA] = useState<string | null>(null);
  const [pathB, setPathB] = useState<string | null>(null);

  const view = useMemo(
    () =>
      buildGraphView({
        edgeGroups,
        kind,
        focusId: focusId ?? undefined,
        focusDepth: focusId ? focusDepth : undefined,
      }),
    [edgeGroups, kind, focusId, focusDepth],
  );

  const pathHighlight = useMemo(() => {
    if (!pathA || !pathB) return null;
    return computePathHighlight(pathBetween(pathA, pathB));
  }, [pathA, pathB]);

  const toggleEdgeGroup = useCallback((group: EdgeGroup) => {
    setEdgeGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next.size === 0 ? new Set(DEFAULT_EDGE_GROUPS) : next;
    });
  }, []);

  const handleFocus = useCallback((id: string) => {
    setFocusId(id);
    setSelectedId(id);
  }, []);

  const handleSetPathEndpoint = useCallback((slot: "a" | "b", id: string) => {
    if (slot === "a") setPathA(id);
    else setPathB(id);
  }, []);

  const focusName = focusId ? getNodeById(focusId)?.node.name : undefined;

  return (
    <div className="flex flex-col lg:flex-row gap-4 px-4 lg:px-6 py-4 h-[calc(100vh-73px)] min-h-[560px]">
      <div
        className="glass-panel rounded-2xl p-4 lg:w-72 shrink-0 overflow-y-auto"
        aria-label="Graph filters and legend"
      >
        <div className="mb-4">
          <h1 className="heading-display text-lg font-semibold text-foreground">
            Knowledge Graph
          </h1>
          <p className="text-xs text-[color:var(--color-muted-foreground)] mt-1">
            {view.nodes.length} nodes · {view.edges.length} relations shown ·{" "}
            {Object.values(TRIPLE_COUNT_BY_PREDICATE).reduce((a, b) => a + b, 0)}{" "}
            triples total
          </p>
        </div>
        <GraphControls
          edgeGroups={edgeGroups}
          kind={kind}
          focusId={focusId}
          focusDepth={focusDepth}
          focusName={focusName}
          onToggleEdgeGroup={toggleEdgeGroup}
          onKindChange={setKind}
          onFocus={handleFocus}
          onClearFocus={() => setFocusId(null)}
          onDepthChange={setFocusDepth}
        />
      </div>

      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <PathPanel
          pathA={pathA}
          pathB={pathB}
          onClear={() => {
            setPathA(null);
            setPathB(null);
          }}
          onSelectNode={setSelectedId}
        />
        <div className="glass-panel rounded-2xl flex-1 min-h-[400px] overflow-hidden">
          <GraphCanvas
            view={view}
            selectedId={selectedId}
            pathNodeIds={pathHighlight?.nodeIds}
            pathEdgeKeys={pathHighlight?.edgeKeys}
            onSelect={setSelectedId}
          />
        </div>
      </div>

      {selectedId && (
        <div className="lg:w-80 shrink-0 max-h-full">
          <GraphSidePanel
            nodeId={selectedId}
            onClose={() => setSelectedId(null)}
            onSelectNode={setSelectedId}
            onSetPathEndpoint={handleSetPathEndpoint}
          />
        </div>
      )}
    </div>
  );
}
