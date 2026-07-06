import { getNodeById } from "@/data/taxonomy";
import { NODE_TRIPLES, PREDICATE_LABEL, TRIPLES } from "./triples";
import type { Predicate, Triple } from "./triples";

export interface Neighbor {
  id: string;
  predicate: Predicate;
  /** "out" = focus node is the subject, "in" = focus node is the object. */
  direction: "out" | "in";
  triple: Triple;
}

export interface PathStep {
  from: string;
  to: string;
  predicate: Predicate;
  /** True when the triple is stored to -> from and is traversed backwards. */
  reversed: boolean;
}

interface Adjacency {
  out: Map<string, Triple[]>;
  in: Map<string, Triple[]>;
}

function buildAdjacency(): Adjacency {
  const out = new Map<string, Triple[]>();
  const inMap = new Map<string, Triple[]>();
  for (const t of NODE_TRIPLES) {
    if (!out.has(t.subject)) out.set(t.subject, []);
    out.get(t.subject)!.push(t);
    if (!inMap.has(t.object)) inMap.set(t.object, []);
    inMap.get(t.object)!.push(t);
  }
  return { out, in: inMap };
}

const ADJACENCY = buildAdjacency();

/** Typed neighbors of a node, optionally restricted to one predicate. */
export function neighbors(id: string, predicate?: Predicate): Neighbor[] {
  const result: Neighbor[] = [];
  for (const t of ADJACENCY.out.get(id) ?? []) {
    if (predicate && t.predicate !== predicate) continue;
    result.push({ id: t.object, predicate: t.predicate, direction: "out", triple: t });
  }
  for (const t of ADJACENCY.in.get(id) ?? []) {
    if (predicate && t.predicate !== predicate) continue;
    result.push({ id: t.subject, predicate: t.predicate, direction: "in", triple: t });
  }
  return result;
}

function bfs(
  fromId: string,
  toId: string,
  allowMined: boolean,
): PathStep[] | null {
  const visited = new Set<string>([fromId]);
  const queue: string[] = [fromId];
  const cameFrom = new Map<string, PathStep>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const n of neighbors(current)) {
      if (!allowMined && n.predicate === "related_to") continue;
      if (visited.has(n.id)) continue;
      visited.add(n.id);
      cameFrom.set(n.id, {
        from: current,
        to: n.id,
        predicate: n.predicate,
        reversed: n.direction === "in",
      });
      if (n.id === toId) {
        const steps: PathStep[] = [];
        let cursor = toId;
        while (cursor !== fromId) {
          const step = cameFrom.get(cursor)!;
          steps.unshift(step);
          cursor = step.from;
        }
        return steps;
      }
      queue.push(n.id);
    }
  }
  return null;
}

/**
 * Shortest undirected path between two nodes (BFS over typed edges).
 * Curated edges (hierarchy, links, differs) are preferred; text-mined
 * related_to edges only win when they cut the path by 2+ hops or no
 * curated route exists.
 */
export function pathBetween(fromId: string, toId: string): PathStep[] | null {
  if (fromId === toId) return [];
  if (!getNodeById(fromId) || !getNodeById(toId)) return null;
  const curated = bfs(fromId, toId, false);
  const any = bfs(fromId, toId, true);
  if (!curated) return any;
  if (any && any.length + 1 < curated.length) return any;
  return curated;
}

export interface Subgraph {
  nodeIds: Set<string>;
  triples: Triple[];
  /** Hop distance from the root for each node id. */
  depthById: Map<string, number>;
}

/** All nodes within `depth` hops of `id`, plus the triples among them. */
export function subgraph(id: string, depth: number): Subgraph {
  const depthById = new Map<string, number>([[id, 0]]);
  let frontier = [id];

  for (let d = 1; d <= depth; d++) {
    const next: string[] = [];
    for (const nodeId of frontier) {
      for (const n of neighbors(nodeId)) {
        if (depthById.has(n.id)) continue;
        depthById.set(n.id, d);
        next.push(n.id);
      }
    }
    frontier = next;
  }

  const nodeIds = new Set(depthById.keys());
  const triples = NODE_TRIPLES.filter(
    (t) => nodeIds.has(t.subject) && nodeIds.has(t.object),
  );
  return { nodeIds, triples, depthById };
}

export interface HubEntry {
  id: string;
  degree: number;
}

/** Most-connected nodes by total degree (in + out). */
export function mostConnectedHubs(limit = 10): HubEntry[] {
  const degree = new Map<string, number>();
  for (const t of NODE_TRIPLES) {
    degree.set(t.subject, (degree.get(t.subject) ?? 0) + 1);
    degree.set(t.object, (degree.get(t.object) ?? 0) + 1);
  }
  return Array.from(degree.entries())
    .map(([id, d]) => ({ id, degree: d }))
    .sort((a, b) => b.degree - a.degree)
    .slice(0, limit);
}

/** All triples with a given predicate (includes literal-endpoint triples). */
export function findByRelation(predicate: Predicate): Triple[] {
  return TRIPLES.filter((t) => t.predicate === predicate);
}

/** Total degree of a node across all node-to-node triples. */
export function nodeDegree(id: string): number {
  return (ADJACENCY.out.get(id)?.length ?? 0) + (ADJACENCY.in.get(id)?.length ?? 0);
}

/** Degree over curated edges only (excludes text-mined related_to). */
export function curatedDegree(id: string): number {
  const count = (list: Triple[] | undefined) =>
    (list ?? []).filter((t) => t.predicate !== "related_to").length;
  return count(ADJACENCY.out.get(id)) + count(ADJACENCY.in.get(id));
}

/** Phrasing when a triple is traversed object -> subject. */
const INVERSE_LABEL: Record<Predicate, string> = {
  is_a: "includes",
  part_of: "contains",
  connects_to: "connects to",
  uses: "is used by",
  used_by: "uses",
  feeds: "is fed by",
  alternative_to: "alternative to",
  implements: "is implemented by",
  trained_with: "helps train",
  differs_from: "differs from",
  related_to: "related to",
  example_of: "has example",
  mentioned_in: "mentions",
};

export function stepLabel(step: PathStep): string {
  return step.reversed ? INVERSE_LABEL[step.predicate] : PREDICATE_LABEL[step.predicate];
}

/** Render a path as a readable relationship chain, e.g. "LoRA is a Fine-tuning, which connects to RAG". */
export function pathSentence(steps: PathStep[]): string {
  if (steps.length === 0) return "";
  const name = (id: string) => getNodeById(id)?.node.name ?? id;
  const parts = [name(steps[0].from)];
  for (const step of steps) {
    parts.push(`${stepLabel(step)} ${name(step.to)}`);
  }
  return parts.join(" → ");
}
