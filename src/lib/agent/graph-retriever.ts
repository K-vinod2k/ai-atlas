import { BaseRetriever, type BaseRetrieverInput } from "@langchain/core/retrievers";
import { Document } from "@langchain/core/documents";
import { getNodeById, getPath, searchNodes } from "@/data/taxonomy";
import { KIND_LABEL } from "@/data/types";
import { findByName, subgraph } from "@/lib/kg";
import { graphFacts, nodeNames } from "./graph-facts";

export interface GraphRetrieverFields extends BaseRetrieverInput {
  /** How many hops to expand around the linked entity. */
  depth?: number;
  /** Max documents returned. */
  maxDocs?: number;
}

const EXPLANATION_EXCERPT_CHARS = 600;

/** Metadata attached to every retrieved document. */
export interface GraphDocMetadata {
  nodeId: string;
  name: string;
  kind: string;
  /** True for the entity the query linked to (vs neighborhood context). */
  central: boolean;
  pathNames: string[];
  [key: string]: unknown;
}

function nodeToDocument(nodeId: string, central: boolean): Document<GraphDocMetadata> | undefined {
  const indexed = getNodeById(nodeId);
  if (!indexed) return undefined;
  const { node } = indexed;
  const facts = graphFacts(nodeId);
  const pathNames = getPath(nodeId).map((n) => n.name);

  const lines = [
    `${node.name} (${KIND_LABEL[node.kind]}): ${node.one}`,
    `Location: ${pathNames.join(" > ")}`,
  ];
  if (facts.childIds.length > 0) {
    lines.push(`Breaks down into: ${nodeNames(facts.childIds).join(", ")}`);
  }
  if (facts.connectIds.length > 0) {
    lines.push(`Connects to: ${nodeNames(facts.connectIds).join(", ")}`);
  }
  if (node.differs) lines.push(`Differs: ${node.differs}`);
  if (facts.exampleLiterals.length > 0) {
    lines.push(`Examples: ${facts.exampleLiterals.join(", ")}`);
  }
  if (facts.relatedIds.length > 0) {
    lines.push(`Related to: ${nodeNames(facts.relatedIds, 6).join(", ")}`);
  }
  if (central && node.rich?.explanation) {
    lines.push("", node.rich.explanation.slice(0, EXPLANATION_EXCERPT_CHARS));
  }
  if (central && node.math) {
    lines.push("", `Math (${node.math.title}): ${node.math.summary}`);
  }

  return new Document<GraphDocMetadata>({
    id: nodeId,
    pageContent: lines.join("\n"),
    metadata: {
      nodeId,
      name: node.name,
      kind: KIND_LABEL[node.kind],
      central,
      pathNames,
    },
  });
}

/**
 * LangChain retriever over the AI Atlas knowledge graph:
 * entity linking (findByName) -> subgraph expansion -> rich content lookup.
 */
export class GraphRetriever extends BaseRetriever {
  static lc_name(): string {
    return "AiAtlasGraphRetriever";
  }

  lc_namespace = ["ai_atlas", "retrievers"];

  private readonly depth: number;
  private readonly maxDocs: number;

  constructor(fields: GraphRetrieverFields = {}) {
    super(fields);
    this.depth = fields.depth ?? 1;
    this.maxDocs = fields.maxDocs ?? 8;
  }

  async _getRelevantDocuments(query: string): Promise<Document<GraphDocMetadata>[]> {
    const centerId = findByName(query);

    if (!centerId) {
      // No entity link: fall back to full-text search over the taxonomy.
      return searchNodes({ query, limit: this.maxDocs })
        .map((r) => nodeToDocument(r.node.id, false))
        .filter((d): d is Document<GraphDocMetadata> => d !== undefined);
    }

    const { nodeIds } = subgraph(centerId, this.depth);
    const ordered = [centerId, ...nodeIds.filter((id) => id !== centerId)];
    return ordered
      .slice(0, this.maxDocs)
      .map((id) => nodeToDocument(id, id === centerId))
      .filter((d): d is Document<GraphDocMetadata> => d !== undefined);
  }
}
