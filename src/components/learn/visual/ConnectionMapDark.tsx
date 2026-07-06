"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Radar, Share2 } from "lucide-react";
import { getNodeById } from "@/data/taxonomy";
import type { TaxonomyNode } from "@/data/types";
import { neighbors } from "@/lib/graph/query";
import type { Neighbor } from "@/lib/graph/query";
import { PREDICATE_LABEL } from "@/lib/graph/triples";
import { edgeGroupOf } from "@/lib/graph/view-model";
import type { EdgeGroup } from "@/lib/graph/view-model";

interface MapNode {
  id: string;
  name: string;
  x: number;
  y: number;
  hop: 1 | 2;
  role: "current" | "hierarchy" | "link";
}

interface MapEdge {
  from: string;
  to: string;
  label: string;
  group: EdgeGroup;
  hop: 1 | 2;
}

interface ConnectionMapDarkProps {
  node: TaxonomyNode;
  onSelectNode: (id: string) => void;
}

const W = 560;
const H = 300;
const MAX_HOP1 = 8;
const MAX_HOP2_PER_NODE = 2;

const EDGE_COLOR: Record<EdgeGroup, string> = {
  hierarchy: "#7FA3C0",
  association: "#C8A88E",
  differs: "#E0897A",
  related: "#94B4A4",
};

const EDGE_DASH: Record<EdgeGroup, string | undefined> = {
  hierarchy: undefined,
  association: "6 4",
  differs: "2 4",
  related: "1 4",
};

function truncate(name: string, max: number): string {
  return name.length > max ? `${name.slice(0, max - 2)}…` : name;
}

/** Hierarchy edges first, then typed associations, then differs, then mined relations. */
function sortNeighbors(list: Neighbor[]): Neighbor[] {
  const rank = (n: Neighbor) => {
    const group = edgeGroupOf(n.predicate);
    if (group === "hierarchy") return 0;
    if (group === "association") return n.predicate === "connects_to" ? 2 : 1;
    if (group === "differs") return 3;
    return 4;
  };
  return [...list].sort(
    (a, b) => rank(a) - rank(b) || (b.triple.weight ?? 0) - (a.triple.weight ?? 0),
  );
}

function buildMap(nodeId: string, twoHop: boolean) {
  const cx = W / 2;
  const cy = H / 2;
  const mapNodes: MapNode[] = [
    { id: nodeId, name: getNodeById(nodeId)?.node.name ?? nodeId, x: cx, y: cy, hop: 1, role: "current" },
  ];
  const mapEdges: MapEdge[] = [];
  const placed = new Set<string>([nodeId]);

  const hop1 = sortNeighbors(neighbors(nodeId)).slice(0, MAX_HOP1);
  const ringA = twoHop ? 88 : 105;
  const ringB = twoHop ? 96 : 112;

  hop1.forEach((n, i) => {
    if (placed.has(n.id)) return;
    const target = getNodeById(n.id);
    if (!target) return;
    const angle = (i / hop1.length) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(angle) * (ringA + (i % 2) * 18) * 1.6;
    const y = cy + Math.sin(angle) * ringB * 0.72;
    placed.add(n.id);
    mapNodes.push({
      id: n.id,
      name: target.node.name,
      x,
      y,
      hop: 1,
      role: edgeGroupOf(n.predicate) === "hierarchy" ? "hierarchy" : "link",
    });
    mapEdges.push({
      from: n.direction === "out" ? nodeId : n.id,
      to: n.direction === "out" ? n.id : nodeId,
      label: PREDICATE_LABEL[n.predicate],
      group: edgeGroupOf(n.predicate),
      hop: 1,
    });

    if (!twoHop) return;
    const hop2 = sortNeighbors(neighbors(n.id))
      .filter((m) => !placed.has(m.id))
      .slice(0, MAX_HOP2_PER_NODE);
    hop2.forEach((m, j) => {
      const outer = getNodeById(m.id);
      if (!outer || placed.has(m.id)) return;
      const spread = angle + (j - (hop2.length - 1) / 2) * 0.42;
      const x2 = cx + Math.cos(spread) * 175 * 1.55;
      const y2 = cy + Math.sin(spread) * 138;
      placed.add(m.id);
      mapNodes.push({ id: m.id, name: outer.node.name, x: x2, y: y2, hop: 2, role: "link" });
      mapEdges.push({
        from: m.direction === "out" ? n.id : m.id,
        to: m.direction === "out" ? m.id : n.id,
        label: PREDICATE_LABEL[m.predicate],
        group: edgeGroupOf(m.predicate),
        hop: 2,
      });
    });
  });

  return { mapNodes, mapEdges, total: neighbors(nodeId).length };
}

export function ConnectionMapDark({ node, onSelectNode }: ConnectionMapDarkProps) {
  const [twoHop, setTwoHop] = useState(false);
  const { mapNodes, mapEdges, total } = useMemo(
    () => buildMap(node.id, twoHop),
    [node.id, twoHop],
  );

  if (mapNodes.length <= 1) return null;
  const byId = new Map(mapNodes.map((n) => [n.id, n]));

  return (
    <section
      className="glass-panel rounded-2xl overflow-hidden fade-in"
      aria-label="Typed connection neighborhood"
    >
      <header
        className="px-4 py-3 border-b flex items-center gap-2"
        style={{ borderColor: "rgba(127,163,192,0.18)" }}
      >
        <Radar className="w-4 h-4 text-[#7FA3C0]" aria-hidden="true" />
        <p className="section-label">Connection neighborhood</p>
        <label className="ml-auto flex items-center gap-1.5 text-[11px] text-[color:var(--color-muted-foreground)] cursor-pointer">
          <input
            type="checkbox"
            checked={twoHop}
            onChange={(e) => setTwoHop(e.target.checked)}
            className="accent-[#7FA3C0]"
          />
          2-hop
        </label>
        <Link
          href={`/graph?node=${node.id}`}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#7FA3C0] hover:text-[#E8D5C4] transition-colors"
        >
          <Share2 className="w-3 h-3" aria-hidden="true" />
          Full graph
        </Link>
      </header>

      <div className="p-3">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full min-w-[320px] h-auto"
          role="img"
          aria-label={`Typed connection map for ${node.name}`}
        >
          {mapEdges.map((edge) => {
            const from = byId.get(edge.from);
            const to = byId.get(edge.to);
            if (!from || !to) return null;
            const mx = (from.x + to.x) / 2;
            const my = (from.y + to.y) / 2;
            const faint = edge.hop === 2;
            return (
              <g key={`${edge.from}-${edge.to}-${edge.label}`}>
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={EDGE_COLOR[edge.group]}
                  strokeOpacity={faint ? 0.3 : 0.6}
                  strokeWidth={faint ? 1 : 1.4}
                  strokeDasharray={EDGE_DASH[edge.group]}
                />
                {!faint && (
                  <text
                    x={mx}
                    y={my - 4}
                    textAnchor="middle"
                    fontSize={8.5}
                    fill={EDGE_COLOR[edge.group]}
                    fillOpacity={0.9}
                    style={{ pointerEvents: "none" }}
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}

          {mapNodes.map((n) => {
            const isCurrent = n.role === "current";
            const faint = n.hop === 2;
            const w = isCurrent ? 100 : faint ? 72 : 84;
            const h = isCurrent ? 38 : faint ? 26 : 32;
            const fill = isCurrent ? "rgba(232,213,196,0.16)" : "rgba(44,42,43,0.9)";
            const stroke = isCurrent
              ? "#E8D5C4"
              : n.role === "hierarchy"
                ? "rgba(127,163,192,0.7)"
                : "rgba(200,168,142,0.55)";
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
                  x={n.x - w / 2}
                  y={n.y - h / 2}
                  width={w}
                  height={h}
                  rx={9}
                  fill={fill}
                  fillOpacity={faint ? 0.7 : 1}
                  stroke={stroke}
                  strokeWidth={isCurrent ? 2 : 1.2}
                />
                <text
                  x={n.x}
                  y={n.y + 3.5}
                  textAnchor="middle"
                  fontSize={faint ? 9 : 10.5}
                  fontWeight={isCurrent ? 700 : 500}
                  fill={isCurrent ? "#E8D5C4" : "#F1F8F7"}
                  fillOpacity={faint ? 0.75 : 1}
                  style={{ pointerEvents: "none" }}
                >
                  {truncate(n.name, faint ? 13 : 15)}
                </text>
              </g>
            );
          })}
        </svg>

        {total > MAX_HOP1 && (
          <p className="mt-1 px-1 text-[11px] text-[color:var(--color-subtle-foreground)]">
            Showing {Math.min(total, MAX_HOP1)} of {total} direct relations — open the full
            graph for everything.
          </p>
        )}
      </div>
    </section>
  );
}
