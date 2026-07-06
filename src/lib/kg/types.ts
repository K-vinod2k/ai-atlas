/** Predicates (edge types) in the AI Atlas knowledge graph. */
export type Predicate =
  | "parent_of"
  | "child_of"
  | "connects_to"
  | "differs_from"
  | "example_of"
  | "related_to";

export const PREDICATES: Predicate[] = [
  "parent_of",
  "child_of",
  "connects_to",
  "differs_from",
  "example_of",
  "related_to",
];

export const PREDICATE_LABEL: Record<Predicate, string> = {
  parent_of: "parent of",
  child_of: "child of",
  connects_to: "connects to",
  differs_from: "differs from",
  example_of: "example of",
  related_to: "related to",
};

export type EntityType = "node" | "literal";

/** One typed edge: subject --predicate--> object. */
export interface Triple {
  subject: string;
  predicate: Predicate;
  object: string;
  subjectType: EntityType;
  objectType: EntityType;
  /** Relevance weight; higher = stronger relation (e.g. mention count for related_to). */
  weight?: number;
}

/** The in-memory knowledge graph with traversal indexes. */
export interface KnowledgeGraph {
  triples: Triple[];
  /** Triples touching a node id (as subject or object). */
  byNode: Map<string, Triple[]>;
  /** Triples grouped by predicate. */
  byPredicate: Map<Predicate, Triple[]>;
  /** Lowercased name/alias -> node id. */
  aliasIndex: Map<string, string>;
  nodeCount: number;
}

export interface GraphStats {
  nodes: number;
  triples: number;
  byPredicate: Record<Predicate, number>;
}

export interface SubgraphResult {
  /** Node ids in the subgraph, including the center. */
  nodeIds: string[];
  triples: Triple[];
}
