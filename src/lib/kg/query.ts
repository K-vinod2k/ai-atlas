import { taxonomyIndex } from "@/data/taxonomy";
import { buildGraph } from "./build";
import {
  PREDICATES,
  type GraphStats,
  type Predicate,
  type SubgraphResult,
  type Triple,
} from "./types";

/** The knowledge graph, built once at module load. Deterministic — no DB. */
export const GRAPH = buildGraph();

/** All triples touching a node, optionally filtered by predicate. */
export function neighbors(id: string, predicate?: Predicate): Triple[] {
  const touching = GRAPH.byNode.get(id) ?? [];
  if (!predicate) return touching;
  return touching.filter((t) => t.predicate === predicate);
}

/** Node ids adjacent to `id` across node-to-node edges (any predicate). */
function adjacentNodeIds(id: string): string[] {
  const out = new Set<string>();
  for (const t of GRAPH.byNode.get(id) ?? []) {
    if (t.subjectType !== "node" || t.objectType !== "node") continue;
    out.add(t.subject === id ? t.object : t.subject);
  }
  out.delete(id);
  return Array.from(out);
}

/** Shortest path between two nodes via BFS over node-to-node edges. Empty if unreachable. */
export function path(from: string, to: string): string[] {
  if (!GRAPH.byNode.has(from) || !GRAPH.byNode.has(to)) return [];
  if (from === to) return [from];

  const prev = new Map<string, string>();
  const queue = [from];
  const visited = new Set([from]);

  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined) break;
    for (const next of adjacentNodeIds(current)) {
      if (visited.has(next)) continue;
      visited.add(next);
      prev.set(next, current);
      if (next === to) {
        const result = [to];
        let cursor = to;
        while (cursor !== from) {
          const p = prev.get(cursor);
          if (p === undefined) return [];
          result.unshift(p);
          cursor = p;
        }
        return result;
      }
      queue.push(next);
    }
  }
  return [];
}

/** BFS expansion around a node up to `depth` hops; returns member ids and internal triples. */
export function subgraph(id: string, depth: number): SubgraphResult {
  if (!GRAPH.byNode.has(id)) return { nodeIds: [], triples: [] };

  const nodeIds = new Set([id]);
  let frontier = [id];
  for (let d = 0; d < depth; d += 1) {
    const next: string[] = [];
    for (const nid of frontier) {
      for (const adj of adjacentNodeIds(nid)) {
        if (!nodeIds.has(adj)) {
          nodeIds.add(adj);
          next.push(adj);
        }
      }
    }
    frontier = next;
    if (frontier.length === 0) break;
  }

  const triples: Triple[] = [];
  const seen = new Set<Triple>();
  for (const nid of nodeIds) {
    for (const t of GRAPH.byNode.get(nid) ?? []) {
      if (seen.has(t)) continue;
      const subjectIn = t.subjectType === "literal" || nodeIds.has(t.subject);
      const objectIn = t.objectType === "literal" || nodeIds.has(t.object);
      if (subjectIn && objectIn) {
        seen.add(t);
        triples.push(t);
      }
    }
  }
  return { nodeIds: Array.from(nodeIds), triples };
}

/**
 * Resolve a free-text term to a node id. Match priority:
 * 1. exact alias, 2. longest alias contained in the term as whole words,
 * 3. shortest alias starting with the term, 4. shortest alias containing it.
 */
export function findByName(term: string): string | undefined {
  const q = term.trim().toLowerCase();
  if (!q) return undefined;

  const exact = GRAPH.aliasIndex.get(q);
  if (exact) return exact;

  let inTerm: { id: string; len: number } | undefined;
  let prefixed: { id: string; len: number } | undefined;
  let contains: { id: string; len: number } | undefined;
  for (const [alias, id] of GRAPH.aliasIndex) {
    if (alias.length < 3) continue;
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`\\b${escaped}\\b`).test(q)) {
      if (!inTerm || alias.length > inTerm.len) inTerm = { id, len: alias.length };
    } else if (alias.startsWith(q)) {
      if (!prefixed || alias.length < prefixed.len) prefixed = { id, len: alias.length };
    } else if (alias.includes(q)) {
      if (!contains || alias.length < contains.len) contains = { id, len: alias.length };
    }
  }
  return inTerm?.id ?? prefixed?.id ?? contains?.id;
}

export function graphStats(): GraphStats {
  const byPredicate = {} as Record<Predicate, number>;
  for (const p of PREDICATES) {
    byPredicate[p] = GRAPH.byPredicate.get(p)?.length ?? 0;
  }
  return {
    nodes: taxonomyIndex.count,
    triples: GRAPH.triples.length,
    byPredicate,
  };
}
