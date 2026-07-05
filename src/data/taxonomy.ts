import { MATH_BY_NODE_ID } from "./math-content";
import { TREE as RAW_TREE } from "./tree-data";
import type { IndexedNode, NodeKind, TaxonomyNode } from "./types";

function attachMath(node: TaxonomyNode): TaxonomyNode {
  const math = MATH_BY_NODE_ID[node.id];
  const children = node.children?.map(attachMath);
  return math ? { ...node, math, children } : { ...node, children };
}

export const TREE: TaxonomyNode = attachMath(RAW_TREE);

export interface TaxonomyIndex {
  byId: Map<string, IndexedNode>;
  byName: Map<string, string>;
  count: number;
  countByKind: Partial<Record<NodeKind, number>>;
}

function buildIndex(): TaxonomyIndex {
  const byId = new Map<string, IndexedNode>();
  const byName = new Map<string, string>();
  let count = 0;
  const countByKind: Partial<Record<NodeKind, number>> = {};

  const walk = (
    node: TaxonomyNode,
    depth: number,
    branchId: string,
    pathIds: string[],
  ) => {
    const nextBranch = depth === 1 ? node.id : branchId;
    const nextPath = [...pathIds, node.id];
    byId.set(node.id, { node, depth, branchId: nextBranch, pathIds: nextPath });
    if (!byName.has(node.name.toLowerCase())) {
      byName.set(node.name.toLowerCase(), node.id);
    }
    count += 1;
    countByKind[node.kind] = (countByKind[node.kind] ?? 0) + 1;
    node.children?.forEach((c) => walk(c, depth + 1, nextBranch, nextPath));
  };

  walk(TREE, 0, TREE.id, []);
  return { byId, byName, count, countByKind };
}

const INDEX = buildIndex();

export const taxonomyIndex = INDEX;

export function getNodeById(id: string): IndexedNode | undefined {
  return INDEX.byId.get(id);
}

export function getNodeIdByName(name: string): string | undefined {
  return INDEX.byName.get(name.toLowerCase());
}

export function getPath(id: string): TaxonomyNode[] {
  const indexed = INDEX.byId.get(id);
  if (!indexed) return [];
  return indexed.pathIds
    .map((pid) => INDEX.byId.get(pid)?.node)
    .filter((n): n is TaxonomyNode => n !== undefined);
}

export function nodeSearchText(node: TaxonomyNode): string {
  return [node.name, node.one, node.differs ?? "", (node.ex ?? []).join(" ")]
    .join(" ")
    .toLowerCase();
}

export interface SearchOptions {
  query?: string;
  kind?: NodeKind | "all";
  limit?: number;
}

export function searchNodes(options: SearchOptions = {}): IndexedNode[] {
  const { query = "", kind = "all", limit = 50 } = options;
  const q = query.trim().toLowerCase();
  const results: IndexedNode[] = [];

  for (const indexed of INDEX.byId.values()) {
    const { node } = indexed;
    const qOk = q === "" || nodeSearchText(node).includes(q);
    const kOk = kind === "all" || node.kind === kind;
    if (qOk && kOk) results.push(indexed);
    if (results.length >= limit) break;
  }

  return results.sort((a, b) => {
    if (a.depth !== b.depth) return a.depth - b.depth;
    return a.node.name.localeCompare(b.node.name);
  });
}

export function getAllNodeIds(): string[] {
  return Array.from(INDEX.byId.keys());
}

export function getTopBranches(): TaxonomyNode[] {
  return TREE.children ?? [];
}
