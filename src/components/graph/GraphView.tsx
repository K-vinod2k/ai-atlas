"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, type WheelEvent, type PointerEvent } from "react";
import { AlertTriangle } from "lucide-react";
import { graphStats, type Predicate } from "@/lib/kg";
import {
  BRANCH_LABEL,
  branchColor,
  EDGE_STYLE,
  FILTERABLE_PREDICATES,
  PREDICATE_FILTER_LABEL,
} from "./graph-theme";
import {
  useGraphLayout,
  VIEW_HEIGHT,
  VIEW_WIDTH,
  type GraphViewLink,
  type GraphViewNode,
} from "./useGraphLayout";

const DEFAULT_PREDICATES: Predicate[] = ["parent_of", "connects_to", "differs_from"];

interface Transform {
  x: number;
  y: number;
  k: number;
}

function linkEnds(link: GraphViewLink): { source: GraphViewNode; target: GraphViewNode } | null {
  if (typeof link.source !== "object" || typeof link.target !== "object") return null;
  return { source: link.source, target: link.target };
}

export function GraphView() {
  const router = useRouter();
  const { layout, error, loading } = useGraphLayout();
  const [active, setActive] = useState<Set<Predicate>>(new Set(DEFAULT_PREDICATES));
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, k: 1 });
  const dragRef = useRef<{ startX: number; startY: number; origin: Transform } | null>(null);
  const stats = useMemo(() => graphStats(), []);

  const visibleLinks = useMemo(
    () => (layout ? layout.links.filter((l) => active.has(l.predicate)) : []),
    [layout, active],
  );

  const hoverNeighborIds = useMemo(() => {
    if (!hoveredId) return null;
    const ids = new Set([hoveredId]);
    for (const l of visibleLinks) {
      if (l.sourceId === hoveredId) ids.add(l.targetId);
      if (l.targetId === hoveredId) ids.add(l.sourceId);
    }
    return ids;
  }, [hoveredId, visibleLinks]);

  const hoveredNode = useMemo(
    () => (layout && hoveredId ? layout.nodes.find((n) => n.id === hoveredId) ?? null : null),
    [layout, hoveredId],
  );

  const togglePredicate = (p: Predicate) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  };

  const onWheel = (e: WheelEvent<SVGSVGElement>) => {
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    setTransform((t) => ({
      ...t,
      k: Math.min(6, Math.max(0.4, t.k * factor)),
    }));
  };

  const onPointerDown = (e: PointerEvent<SVGSVGElement>) => {
    dragRef.current = { startX: e.clientX, startY: e.clientY, origin: transform };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    setTransform({
      ...drag.origin,
      x: drag.origin.x + (e.clientX - drag.startX),
      y: drag.origin.y + (e.clientY - drag.startY),
    });
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  if (error) {
    return (
      <div className="card flex items-start gap-3 max-w-xl mx-auto mt-12" role="alert">
        <AlertTriangle className="w-5 h-5 shrink-0 text-[#F49A8A]" aria-hidden="true" />
        <div>
          <p className="font-semibold text-foreground">Could not build the graph</p>
          <p className="mt-1 text-sm text-[color:var(--color-foreground)]/80">{error}</p>
        </div>
      </div>
    );
  }

  if (loading || !layout) {
    return (
      <div className="flex items-center justify-center min-h-[480px] card rounded-xl" role="status">
        <div className="skeleton w-8 h-8 rounded-full" aria-hidden="true" />
        <span className="ml-3 text-sm text-[color:var(--color-muted-foreground)]">
          Laying out {stats.nodes} concepts and {stats.triples} relationships...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by relationship type">
          {FILTERABLE_PREDICATES.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => togglePredicate(p)}
              aria-pressed={active.has(p)}
              className={active.has(p) ? "link-pill" : "badge opacity-50"}
            >
              <span
                className="inline-block w-2 h-2 rounded-full mr-1.5"
                style={{ background: EDGE_STYLE[p].stroke }}
                aria-hidden="true"
              />
              {PREDICATE_FILTER_LABEL[p]} ({stats.byPredicate[p]})
            </button>
          ))}
        </div>
        <p className="text-xs text-[color:var(--color-muted-foreground)]">
          Scroll to zoom, drag to pan, click a node to open it in Learn.
        </p>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden relative">
        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          className="w-full h-[68vh] min-h-[440px] touch-none cursor-grab active:cursor-grabbing"
          role="img"
          aria-label="Knowledge graph of the AI landscape"
          onWheel={onWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          <g transform={`translate(${transform.x} ${transform.y}) scale(${transform.k})`}>
            {visibleLinks.map((link, i) => {
              const ends = linkEnds(link);
              if (!ends) return null;
              const style = EDGE_STYLE[link.predicate];
              const touched =
                hoveredId !== null &&
                (link.sourceId === hoveredId || link.targetId === hoveredId);
              const opacity = hoveredId ? (touched ? 0.9 : style.opacity * 0.25) : style.opacity;
              return (
                <line
                  key={`${link.predicate}-${i}`}
                  x1={ends.source.x}
                  y1={ends.source.y}
                  x2={ends.target.x}
                  y2={ends.target.y}
                  stroke={style.stroke}
                  strokeOpacity={opacity}
                  strokeWidth={touched ? 1.6 : 1}
                  strokeDasharray={style.dash}
                />
              );
            })}
            {layout.nodes.map((node) => {
              const dimmed = hoverNeighborIds !== null && !hoverNeighborIds.has(node.id);
              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x ?? 0} ${node.y ?? 0})`}
                  opacity={dimmed ? 0.25 : 1}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredId(node.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => router.push(`/learn?node=${node.id}`)}
                >
                  <circle
                    r={node.radius}
                    fill={branchColor(node.branchId)}
                    fillOpacity={node.depth <= 1 ? 0.95 : 0.8}
                    stroke="rgba(10,14,19,0.9)"
                    strokeWidth={1}
                  />
                  {(node.depth <= 1 || hoveredId === node.id) && (
                    <text
                      y={-node.radius - 5}
                      textAnchor="middle"
                      fill="#F2EFEC"
                      fontSize={node.depth <= 1 ? 13 : 11}
                      fontWeight={600}
                      paintOrder="stroke"
                      stroke="rgba(10,14,19,0.85)"
                      strokeWidth={3}
                    >
                      {node.name}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {hoveredNode && (
          <div
            className="absolute bottom-4 left-4 max-w-sm card !p-3 pointer-events-none"
            role="status"
          >
            <p className="text-sm font-semibold text-foreground">{hoveredNode.name}</p>
            <p className="mt-1 text-xs text-[color:var(--color-foreground)]/75 leading-relaxed">
              {hoveredNode.one}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Branch color legend">
        {Object.entries(BRANCH_LABEL).map(([id, label]) => (
          <span key={id} className="flex items-center gap-1.5 text-xs text-[color:var(--color-muted-foreground)]">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: branchColor(id) }}
              aria-hidden="true"
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
