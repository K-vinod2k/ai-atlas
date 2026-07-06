import { getNodeById } from "@/data/taxonomy";
import { GRAPH } from "@/lib/kg";

/**
 * Display-level predicates for the graph explorer and connection widgets.
 * Derived from the canonical store in src/lib/kg by refining its raw
 * predicates with taxonomy semantics (kinds, known link pairs).
 */
export type Predicate =
  | "is_a"
  | "part_of"
  | "connects_to"
  | "uses"
  | "used_by"
  | "feeds"
  | "alternative_to"
  | "implements"
  | "trained_with"
  | "differs_from"
  | "related_to"
  | "example_of"
  | "mentioned_in";

export interface Triple {
  subject: string;
  predicate: Predicate;
  object: string;
  /** Subject is a literal string (e.g. an example name), not a node id. */
  literalSubject?: boolean;
  /** Object is a literal string (e.g. a news item id), not a node id. */
  literalObject?: boolean;
  weight?: number;
}

export const PREDICATE_LABEL: Record<Predicate, string> = {
  is_a: "is a",
  part_of: "part of",
  connects_to: "connects to",
  uses: "uses",
  used_by: "used by",
  feeds: "feeds",
  alternative_to: "alternative to",
  implements: "implements",
  trained_with: "trained with",
  differs_from: "differs from",
  related_to: "related to",
  example_of: "example of",
  mentioned_in: "mentioned in",
};

/** Cross-link predicates that all render in the "association" style. */
export const ASSOCIATION_PREDICATES: Predicate[] = [
  "connects_to",
  "uses",
  "used_by",
  "feeds",
  "alternative_to",
  "implements",
  "trained_with",
];

/**
 * Refinements for cross-links where the semantics are obvious.
 * Key: `${subjectId}|${objectId}`. Anything not listed stays `connects_to`.
 */
const LINK_REFINEMENTS: Record<string, Predicate> = {
  "symbolic|kg": "uses",
  "rl|rlhf": "used_by",
  "rl|robotics": "used_by",
  "embedding|embeddings": "implements",
  "weight|finetune": "used_by",
  "weight|quant": "used_by",
  "gnn|kg": "uses",
  "embed-models|embeddings": "implements",
  "finetune|rl": "trained_with",
  "finetune|rag": "alternative_to",
  "rlhf|alignment": "implements",
  "embeddings|rag": "feeds",
  "embeddings|vectordb": "feeds",
  "rag|vectordb": "uses",
  "rag|kg": "uses",
  "rag|embeddings": "uses",
  "graphrag|kg": "uses",
  "mcp|tooluse": "implements",
  "kg|gnn": "feeds",
  "kg|rag": "feeds",
  "kg|graphrag": "feeds",
  "kg-embed|embeddings": "implements",
  "robotics|rl": "uses",
  "alignment|rlhf": "uses",
};

/** Structural kinds attach to their parent with part_of; the rest specialize with is_a. */
function hierarchyPredicate(childId: string): Predicate {
  const kind = getNodeById(childId)?.node.kind;
  return kind === "component" || kind === "unit" ? "part_of" : "is_a";
}

function buildTriples(): Triple[] {
  const triples: Triple[] = [];
  const seen = new Set<string>();

  const add = (t: Triple) => {
    const key = `${t.subject}|${t.predicate}|${t.object}`;
    if (seen.has(key) || t.subject === t.object) return;
    seen.add(key);
    triples.push(t);
  };

  for (const t of GRAPH.triples) {
    switch (t.predicate) {
      case "parent_of":
        // Stored parent -> child; display as child -> parent, typed by the child's kind.
        add({
          subject: t.object,
          predicate: hierarchyPredicate(t.object),
          object: t.subject,
          weight: 2,
        });
        break;
      case "child_of":
        break; // mirror of parent_of
      case "connects_to": {
        if (t.objectType === "literal") break; // unresolved link name
        const predicate = LINK_REFINEMENTS[`${t.subject}|${t.object}`] ?? "connects_to";
        add({ subject: t.subject, predicate, object: t.object, weight: 1 });
        break;
      }
      case "differs_from":
        if (t.objectType === "literal") break;
        add({ subject: t.subject, predicate: "differs_from", object: t.object, weight: 1 });
        break;
      case "related_to":
        // Mined from rich explanation text; weight = mention count.
        add({
          subject: t.subject,
          predicate: "related_to",
          object: t.object,
          weight: t.weight ?? 1,
        });
        break;
      case "example_of":
        add({
          subject: t.subject,
          predicate: "example_of",
          object: t.object,
          literalSubject: true,
          weight: 0.5,
        });
        break;
    }
  }

  return triples;
}

export const TRIPLES: Triple[] = buildTriples();

/** Node-to-node triples only (both endpoints are taxonomy nodes). */
export const NODE_TRIPLES: Triple[] = TRIPLES.filter(
  (t) => !t.literalSubject && !t.literalObject,
);

export const TRIPLE_COUNT_BY_PREDICATE: Partial<Record<Predicate, number>> = (() => {
  const counts: Partial<Record<Predicate, number>> = {};
  for (const t of TRIPLES) {
    counts[t.predicate] = (counts[t.predicate] ?? 0) + 1;
  }
  return counts;
})();

/**
 * News mentions are dynamic (SQLite feed tags), so they are built on demand
 * rather than at module load: node -> mentioned_in -> news item id.
 */
export function buildMentionTriples(
  tags: Array<{ nodeId: string; newsId: string }>,
): Triple[] {
  return tags.map((tag) => ({
    subject: tag.nodeId,
    predicate: "mentioned_in" as const,
    object: tag.newsId,
    literalObject: true,
    weight: 0.5,
  }));
}
