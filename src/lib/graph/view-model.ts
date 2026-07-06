import { taxonomyIndex } from "@/data/taxonomy";
import type { NodeKind } from "@/data/types";
import { ASSOCIATION_PREDICATES, NODE_TRIPLES } from "./triples";
import type { Predicate } from "./triples";
import { curatedDegree, subgraph } from "./query";

/** Edge style groups shown in the legend and filter controls. */
export type EdgeGroup = "hierarchy" | "association" | "differs" | "related";

export const EDGE_GROUP_LABEL: Record<EdgeGroup, string> = {
  hierarchy: "is a / part of",
  association: "connects / uses / feeds",
  differs: "differs from",
  related: "related to (mined)",
};

export function edgeGroupOf(predicate: Predicate): EdgeGroup {
  if (predicate === "is_a" || predicate === "part_of") return "hierarchy";
  if (predicate === "differs_from") return "differs";
  if (predicate === "related_to") return "related";
  return "association";
}

export const ASSOCIATION_SET = new Set<Predicate>(ASSOCIATION_PREDICATES);

/** Top-level branch colors, derived from the app palette (no new hues). */
export const BRANCH_COLORS: Record<string, string> = {
  ai: "#F2EFEC",
  paradigms: "#7FA3C0",
  arch: "#E8D5C4",
  stack: "#C8A88E",
  apps: "#A7C4DB",
  knowledge: "#94B4A4",
  modalities: "#C4A3A3",
  governance: "#D9938A",
};

export const BRANCH_LABEL: Record<string, string> = {
  ai: "Root",
  paradigms: "Paradigms",
  arch: "Architectures",
  stack: "Build & Run Stack",
  apps: "Apps & Agents",
  knowledge: "Knowledge & Symbolic",
  modalities: "Modalities",
  governance: "Safety & Governance",
};

export interface ViewNode {
  id: string;
  name: string;
  kind: NodeKind;
  branchId: string;
  color: string;
  degree: number;
  /** Render radius in world units, scaled by connectivity. */
  radius: number;
}

export interface ViewEdge {
  source: string;
  target: string;
  predicate: Predicate;
  group: EdgeGroup;
}

export interface GraphView {
  nodes: ViewNode[];
  edges: ViewEdge[];
}

export interface GraphViewFilter {
  edgeGroups: Set<EdgeGroup>;
  kind: NodeKind | "all";
  /** When set, restrict to the N-hop neighborhood of this node. */
  focusId?: string;
  focusDepth?: number;
}

export function nodeRadius(degree: number): number {
  return 5 + Math.min(Math.sqrt(degree) * 2.6, 14);
}

export function buildGraphView(filter: GraphViewFilter): GraphView {
  const { edgeGroups, kind, focusId, focusDepth } = filter;

  let allowedIds: Set<string> | null = null;
  if (focusId && focusDepth !== undefined) {
    allowedIds = subgraph(focusId, focusDepth).nodeIds;
  }

  const nodes: ViewNode[] = [];
  const included = new Set<string>();
  for (const [id, indexed] of taxonomyIndex.byId) {
    if (allowedIds && !allowedIds.has(id)) continue;
    if (kind !== "all" && indexed.node.kind !== kind && id !== focusId) continue;
    const degree = curatedDegree(id);
    nodes.push({
      id,
      name: indexed.node.name,
      kind: indexed.node.kind,
      branchId: indexed.branchId,
      color: BRANCH_COLORS[indexed.branchId] ?? "#7FA3C0",
      degree,
      radius: nodeRadius(degree),
    });
    included.add(id);
  }

  const edges: ViewEdge[] = [];
  for (const t of NODE_TRIPLES) {
    const group = edgeGroupOf(t.predicate);
    if (!edgeGroups.has(group)) continue;
    if (!included.has(t.subject) || !included.has(t.object)) continue;
    edges.push({ source: t.subject, target: t.object, predicate: t.predicate, group });
  }

  return { nodes, edges };
}
