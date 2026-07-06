import { getNodeById } from "@/data/taxonomy";
import { neighbors } from "@/lib/kg";

/** Structured one-hop view of a node in the knowledge graph. */
export interface GraphFacts {
  nodeId: string;
  parentId?: string;
  childIds: string[];
  connectIds: string[];
  differIds: string[];
  differLiterals: string[];
  /** Sorted by mention weight, strongest first. */
  relatedIds: string[];
  exampleLiterals: string[];
}

export function graphFacts(nodeId: string): GraphFacts {
  const facts: GraphFacts = {
    nodeId,
    childIds: [],
    connectIds: [],
    differIds: [],
    differLiterals: [],
    relatedIds: [],
    exampleLiterals: [],
  };

  const related: Array<{ id: string; weight: number }> = [];
  for (const t of neighbors(nodeId)) {
    switch (t.predicate) {
      case "child_of":
        if (t.subject === nodeId) facts.parentId = t.object;
        break;
      case "parent_of":
        if (t.subject === nodeId) facts.childIds.push(t.object);
        break;
      case "connects_to": {
        const other = t.subject === nodeId ? t.object : t.subject;
        if (t.objectType === "node" || t.subject !== nodeId) {
          if (!facts.connectIds.includes(other)) facts.connectIds.push(other);
        }
        break;
      }
      case "differs_from": {
        if (t.subject === nodeId && t.objectType === "literal") {
          facts.differLiterals.push(t.object);
          break;
        }
        const other = t.subject === nodeId ? t.object : t.subject;
        if (!facts.differIds.includes(other)) facts.differIds.push(other);
        break;
      }
      case "related_to": {
        const other = t.subject === nodeId ? t.object : t.subject;
        related.push({ id: other, weight: t.weight ?? 1 });
        break;
      }
      case "example_of":
        if (t.object === nodeId) facts.exampleLiterals.push(t.subject);
        break;
    }
  }

  const seen = new Set<string>();
  facts.relatedIds = related
    .sort((a, b) => b.weight - a.weight)
    .filter(({ id }) => {
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .map(({ id }) => id);

  return facts;
}

export function nodeName(id: string): string {
  return getNodeById(id)?.node.name ?? id;
}

export function nodeNames(ids: string[], limit?: number): string[] {
  const slice = limit !== undefined ? ids.slice(0, limit) : ids;
  return slice.map(nodeName);
}
