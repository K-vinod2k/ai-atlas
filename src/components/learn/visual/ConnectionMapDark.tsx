"use client";

import { useMemo } from "react";
import { Radar } from "lucide-react";
import { getNodeById, getNodeIdByName, getPath } from "@/data/taxonomy";
import type { TaxonomyNode } from "@/data/types";

interface GraphNode {
  id: string;
  name: string;
  x: number;
  y: number;
  role: "current" | "parent" | "child" | "link";
}

interface GraphEdge {
  from: string;
  to: string;
  dashed?: boolean;
}

interface ConnectionMapDarkProps {
  node: TaxonomyNode;
  onSelectNode: (id: string) => void;
}

const W = 560;
const H = 240;
const NODE_R = 42;

const COLORS = {
  current: {
    fill: "rgba(232,213,196,0.16)",
    stroke: "#E8D5C4",
    text: "#E8D5C4",
  },
  parent: {
    fill: "rgba(44,42,43,0.9)",
    stroke: "rgba(127,163,192,0.7)",
    text: "#F1F8F7",
  },
  child: {
    fill: "rgba(44,42,43,0.9)",
    stroke: "rgba(127,163,192,0.55)",
    text: "#F1F8F7",
  },
  link: {
    fill: "rgba(44,42,43,0.9)",
    stroke: "rgba(127,163,192,0.4)",
    text: "#F1F8F7",
  },
} as const;

export function ConnectionMapDark({ node, onSelectNode }: ConnectionMapDarkProps) {
  const { nodes, edges } = useMemo(() => {
    const path = getPath(node.id);
    const parent = path.length > 1 ? path[path.length - 2] : null;
    const children = node.children ?? [];

    const linkIds = (node.links ?? [])
      .map((name) => getNodeIdByName(name))
      .filter((id): id is string => id !== undefined && id !== node.id);

    const graphNodes: GraphNode[] = [];
    const graphEdges: GraphEdge[] = [];

    graphNodes.push({
      id: node.id,
      name: node.name,
      x: W / 2,
      y: H / 2,
      role: "current",
    });

    if (parent) {
      graphNodes.push({
        id: parent.id,
        name: parent.name,
        x: W / 2,
        y: 44,
        role: "parent",
      });
      graphEdges.push({ from: parent.id, to: node.id });
    }

    const childCount = Math.min(children.length, 4);
    children.slice(0, 4).forEach((child, i) => {
      const spread = childCount > 1 ? (W - 160) / (childCount - 1) : 0;
      const x = childCount === 1 ? W / 2 : 80 + i * spread;
      graphNodes.push({
        id: child.id,
        name: child.name,
        x,
        y: H - 44,
        role: "child",
      });
      graphEdges.push({ from: node.id, to: child.id });
    });

    linkIds.slice(0, 3).forEach((linkId, i) => {
      const linked = getNodeById(linkId);
      if (!linked || graphNodes.some((n) => n.id === linkId)) return;
      const side = i === 0 ? -1 : 1;
      const yOffset = i === 2 ? 40 : 0;
      graphNodes.push({
        id: linkId,
        name: linked.node.name,
        x: W / 2 + side * 220,
        y: H / 2 + yOffset,
        role: "link",
      });
      graphEdges.push({ from: node.id, to: linkId, dashed: true });
    });

    return { nodes: graphNodes, edges: graphEdges };
  }, [node]);

  if (nodes.length <= 1) return null;

  return (
    <section
      className="glass-panel rounded-2xl overflow-hidden fade-in"
      aria-label="Local connection map"
    >
      <header
        className="px-4 py-3 border-b flex items-center gap-2"
        style={{ borderColor: "rgba(127,163,192,0.18)" }}
      >
        <Radar className="w-4 h-4 text-[#7FA3C0]" aria-hidden="true" />
        <p className="section-label">Connection neighborhood</p>
        <span className="ml-auto text-[11px] text-[color:var(--color-muted-foreground)]">
          Click to jump
        </span>
      </header>

      <div className="p-3">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full min-w-[320px] h-auto"
          role="img"
          aria-label={`Connection map for ${node.name}`}
        >
          <defs>
            <marker
              id="arrowhead-mint"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#7FA3C0" opacity="0.75" />
            </marker>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {edges.map((edge) => {
            const from = nodes.find((n) => n.id === edge.from);
            const to = nodes.find((n) => n.id === edge.to);
            if (!from || !to) return null;

            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            const nx = (dx / len) * NODE_R;
            const ny = (dy / len) * NODE_R;

            return (
              <line
                key={`${edge.from}-${edge.to}`}
                x1={from.x + nx * 0.4}
                y1={from.y + ny * 0.4}
                x2={to.x - nx * 0.7}
                y2={to.y - ny * 0.7}
                stroke="#7FA3C0"
                strokeOpacity={edge.dashed ? 0.4 : 0.65}
                strokeWidth={1.5}
                strokeDasharray={edge.dashed ? "4 3" : undefined}
                markerEnd="url(#arrowhead-mint)"
              />
            );
          })}

          {nodes.map((n) => {
            const c = COLORS[n.role];
            const label = n.name.length > 16 ? `${n.name.slice(0, 14)}…` : n.name;
            const isCurrent = n.role === "current";

            return (
              <g
                key={n.id}
                className="cursor-pointer"
                onClick={() => onSelectNode(n.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectNode(n.id);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Go to ${n.name}`}
                aria-current={isCurrent ? "true" : undefined}
              >
                <rect
                  x={n.x - NODE_R}
                  y={n.y - 18}
                  width={NODE_R * 2}
                  height={36}
                  rx={10}
                  fill={c.fill}
                  stroke={c.stroke}
                  strokeWidth={isCurrent ? 2 : 1.25}
                  filter={isCurrent ? "url(#glow)" : undefined}
                />
                <text
                  x={n.x}
                  y={n.y + 4}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={isCurrent ? 700 : 500}
                  fill={c.text}
                  style={{ pointerEvents: "none" }}
                >
                  {label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}
