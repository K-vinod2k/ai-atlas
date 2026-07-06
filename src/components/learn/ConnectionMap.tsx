"use client";

import { useMemo } from "react";
import { Network } from "lucide-react";
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

interface ConnectionMapProps {
  node: TaxonomyNode;
  onSelectNode: (id: string) => void;
}

const W = 560;
const H = 140;
const NODE_R = 36;

export function ConnectionMap({ node, onSelectNode }: ConnectionMapProps) {
  const { nodes, edges } = useMemo(() => {
    const path = getPath(node.id);
    const parent = path.length > 1 ? path[path.length - 2] : null;
    const children = node.children ?? [];

    const linkIds = (node.links ?? [])
      .map((name) => getNodeIdByName(name))
      .filter((id): id is string => id !== undefined && id !== node.id);

    const graphNodes: GraphNode[] = [];
    const graphEdges: GraphEdge[] = [];

    graphNodes.push({ id: node.id, name: node.name, x: W / 2, y: H / 2, role: "current" });

    if (parent) {
      graphNodes.push({
        id: parent.id,
        name: parent.name,
        x: W / 2,
        y: 28,
        role: "parent",
      });
      graphEdges.push({ from: parent.id, to: node.id });
    }

    const childCount = Math.min(children.length, 4);
    children.slice(0, 4).forEach((child, i) => {
      const spread = childCount > 1 ? (W - 120) / (childCount - 1) : 0;
      const x = childCount === 1 ? W / 2 : 60 + i * spread;
      graphNodes.push({
        id: child.id,
        name: child.name,
        x,
        y: H - 28,
        role: "child",
      });
      graphEdges.push({ from: node.id, to: child.id });
    });

    linkIds.slice(0, 3).forEach((linkId, i) => {
      const linked = getNodeById(linkId);
      if (!linked || graphNodes.some((n) => n.id === linkId)) return;
      const angle = (Math.PI / 4) * (i + 1);
      graphNodes.push({
        id: linkId,
        name: linked.node.name,
        x: W / 2 + Math.cos(angle) * 200,
        y: H / 2 + Math.sin(angle) * 20,
        role: "link",
      });
      graphEdges.push({ from: node.id, to: linkId, dashed: true });
    });

    return { nodes: graphNodes, edges: graphEdges };
  }, [node]);

  if (nodes.length <= 1) return null;

  const nodeColor = (role: GraphNode["role"]) => {
    switch (role) {
      case "current":
        return { fill: "color-mix(in srgb, var(--color-primary) 20%, var(--color-surface))", stroke: "var(--color-primary)" };
      case "parent":
        return { fill: "var(--color-surface)", stroke: "var(--color-muted-foreground)" };
      case "child":
        return { fill: "var(--color-surface)", stroke: "var(--color-secondary)" };
      default:
        return { fill: "var(--color-surface)", stroke: "var(--color-accent)" };
    }
  };

  return (
    <section
      className="rounded-xl overflow-hidden"
      style={{
        background: "var(--color-surface)",
        border: "1px solid color-mix(in srgb, var(--color-border) 40%, transparent)",
      }}
      aria-label="Concept connections"
    >
      <div
        className="px-4 py-2.5 border-b flex items-center gap-2"
        style={{ borderColor: "color-mix(in srgb, var(--color-border) 40%, transparent)" }}
      >
        <Network className="w-4 h-4 text-primary" aria-hidden="true" />
        <p className="section-label">Local connection map</p>
      </div>

      <div className="p-2 overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full min-w-[320px] h-auto"
          role="img"
          aria-label={`Connection map for ${node.name}`}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="var(--color-primary)" opacity="0.6" />
            </marker>
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
                x1={from.x + nx * 0.3}
                y1={from.y + ny * 0.3}
                x2={to.x - nx * 0.5}
                y2={to.y - ny * 0.5}
                stroke="var(--color-primary)"
                strokeOpacity={edge.dashed ? 0.35 : 0.55}
                strokeWidth={1.5}
                strokeDasharray={edge.dashed ? "4 3" : undefined}
                markerEnd="url(#arrowhead)"
              />
            );
          })}

          {nodes.map((n) => {
            const colors = nodeColor(n.role);
            const label =
              n.name.length > 14 ? `${n.name.slice(0, 12)}…` : n.name;
            const isCurrent = n.role === "current";

            return (
              <g
                key={n.id}
                className="cursor-pointer transition-opacity duration-200 hover:opacity-90"
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
                  rx={8}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth={isCurrent ? 2 : 1}
                />
                <text
                  x={n.x}
                  y={n.y + 4}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={isCurrent ? 600 : 400}
                  fill="var(--color-foreground)"
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
