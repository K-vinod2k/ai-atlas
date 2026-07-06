import {
  getNodeById,
  getNodeIdByName,
  searchNodes,
  taxonomyIndex,
} from "@/data/taxonomy";
import { KIND_LABEL } from "@/data/types";
import type { AgentMessage, AgentProvider, AgentResponse } from "./types";

const ROUTER_TABLE: Array<{ patterns: RegExp[]; layer: string; example: string }> = [
  { patterns: [/\b(agi|artificial intelligence|ai field)\b/i], layer: "Field", example: "Artificial Intelligence" },
  { patterns: [/\b(symbolic|machine learning|bayesian|paradigm)\b/i], layer: "Paradigm", example: "Machine Learning" },
  { patterns: [/\b(supervised|reinforcement|self-?supervised|unsupervised)\b/i], layer: "Concept (under ML)", example: "Reinforcement Learning" },
  { patterns: [/\b(transformer|cnn|diffusion|mamba|gnn|architecture)\b/i], layer: "Architecture", example: "Transformer" },
  { patterns: [/\b(gpt|claude|gemini|llama|llm|model)\b/i], layer: "Model", example: "GPT family" },
  { patterns: [/\b(attention|embedding|ffn|layer norm|component)\b/i], layer: "Component", example: "Attention" },
  { patterns: [/\b(layer|neuron|weight|tensor|bit|unit)\b/i], layer: "Unit", example: "Tensor" },
  { patterns: [/\b(knowledge graph|ontology|triple)\b/i], layer: "Concept (symbolic)", example: "Knowledge Graph" },
  { patterns: [/\b(rag|embeddings|mcp|connector)\b/i], layer: "Connector", example: "RAG" },
  { patterns: [/\b(training|fine-?tun|backprop|quantiz|process)\b/i], layer: "Process", example: "Fine-tuning" },
  { patterns: [/\b(pytorch|vllm|langgraph|pinecone|tool)\b/i], layer: "Tool", example: "PyTorch" },
];

function routeTerm(term: string): string {
  for (const row of ROUTER_TABLE) {
    for (const p of row.patterns) {
      if (p.test(term)) {
        return `**${term}** maps to layer: **${row.layer}** (e.g. ${row.example}).\n\nUse the Explore tree or search to find the exact node.`;
      }
    }
  }
  return `I could not route "${term}" to a specific layer. Try searching in Explore or name a more specific term (e.g. "attention", "LoRA", "RAG").`;
}

function explainNode(nodeId: string): AgentResponse {
  const indexed = getNodeById(nodeId);
  if (!indexed) return { content: "Node not found." };

  const { node } = indexed;
  const lines = [
    `**${node.name}** (${KIND_LABEL[node.kind]})`,
    "",
    node.one,
  ];
  if (node.differs) lines.push("", `**How it differs:** ${node.differs}`);
  if (node.ex?.length) lines.push("", `**Examples:** ${node.ex.join(", ")}`);
  if (node.math) {
    lines.push("", `**Math:** ${node.math.title}`, node.math.summary);
    lines.push("", `Open /learn?node=${node.id} to see the full formula and interactive content.`);
  }
  if (node.links?.length) {
    lines.push("", `**Connects to:** ${node.links.join(", ")}`);
  }

  return { content: lines.join("\n"), navigateTo: node.id };
}

function resolveNodeName(name: string): string | undefined {
  const exact = getNodeIdByName(name);
  if (exact) return exact;
  const results = searchNodes({ query: name, limit: 1 });
  return results[0]?.node.id;
}

function compareNodes(aName: string, bName: string): AgentResponse {
  const aId = resolveNodeName(aName);
  const bId = resolveNodeName(bName);
  if (!aId || !bId) {
    const missing = [!aId ? aName : null, !bId ? bName : null].filter(Boolean).join(", ");
    return { content: `Could not find: ${missing}. Check spelling or search in Explore.` };
  }

  const a = getNodeById(aId)!;
  const b = getNodeById(bId)!;
  const lines = [
    `**${a.node.name}** vs **${b.node.name}**`,
    "",
    `**${a.node.name}** (${KIND_LABEL[a.node.kind]}): ${a.node.one}`,
    a.node.differs ? `Differs: ${a.node.differs}` : "",
    "",
    `**${b.node.name}** (${KIND_LABEL[b.node.kind]}): ${b.node.one}`,
    b.node.differs ? `Differs: ${b.node.differs}` : "",
  ];
  return { content: lines.filter(Boolean).join("\n") };
}

function lookupNode(query: string): AgentResponse {
  const byName = getNodeIdByName(query);
  if (byName) return explainNode(byName);

  const results = searchNodes({ query, limit: 5 });
  if (results.length === 0) {
    return { content: `No nodes matching "${query}". Try a different term or use "route ${query}" to find its layer.` };
  }

  const list = results
    .map((r) => `- **${r.node.name}** (${KIND_LABEL[r.node.kind]}) — /learn?node=${r.node.id}`)
    .join("\n");
  return { content: `Found ${results.length} matches for "${query}":\n\n${list}` };
}

function parseCompare(input: string): [string, string] | null {
  const patterns = [
    /compare\s+(.+?)\s+(?:vs\.?|versus|and|with)\s+(.+)/i,
    /(.+?)\s+vs\.?\s+(.+)/i,
    /difference\s+between\s+(.+?)\s+and\s+(.+)/i,
  ];
  for (const p of patterns) {
    const m = input.match(p);
    if (m) return [m[1].trim(), m[2].trim().replace(/[?.!]$/, "")];
  }
  return null;
}

export class LocalGuideProvider implements AgentProvider {
  name = "local";

  async chat(messages: AgentMessage[]): Promise<AgentResponse> {
    const last = messages[messages.length - 1];
    if (!last || last.role !== "user") {
      return { content: "Send a message to get started." };
    }

    const input = last.content.trim();
    const lower = input.toLowerCase();

    if (/^(help|commands?)\s*$/i.test(lower)) {
      return {
        content: [
          "I can help you navigate the AI Landscape Map:",
          "",
          "- **explain [node]** — definition, examples, math",
          "- **compare X vs Y** — side-by-side differences",
          "- **find / search [term]** — lookup nodes",
          "- **route [term]** — which layer a term belongs to",
          "- **navigate [node]** — open a node page",
          "",
          `The map has ${taxonomyIndex.count} nodes across ${(taxonomyIndex.byId.get("ai")?.node.children ?? []).length} top branches.`,
        ].join("\n"),
      };
    }

    const compare = parseCompare(input);
    if (compare) return compareNodes(compare[0], compare[1]);

    const explainMatch = input.match(/^(?:explain|what is|tell me about)\s+(.+)/i);
    if (explainMatch) return lookupNode(explainMatch[1].trim());

    const findMatch = input.match(/^(?:find|search|lookup)\s+(.+)/i);
    if (findMatch) return lookupNode(findMatch[1].trim());

    const routeMatch = input.match(/^(?:route|where does|layer for)\s+(.+)/i);
    if (routeMatch) return { content: routeTerm(routeMatch[1].trim()) };

    const navMatch = input.match(/^(?:navigate|open|go to)\s+(.+)/i);
    if (navMatch) {
      const id = getNodeIdByName(navMatch[1].trim());
      if (id) return explainNode(id);
      const results = searchNodes({ query: navMatch[1].trim(), limit: 1 });
      if (results[0]) return explainNode(results[0].node.id);
      return { content: `Could not find "${navMatch[1].trim()}" to navigate to.` };
    }

    // Default: try as a node lookup
    const directId = getNodeIdByName(input);
    if (directId) return explainNode(directId);

    const results = searchNodes({ query: input, limit: 3 });
    if (results.length === 1) return explainNode(results[0].node.id);
    if (results.length > 1) return lookupNode(input);

    return {
      content: `I'm not sure how to answer that. Try:\n- "explain attention"\n- "compare RAG vs fine-tuning"\n- "route MCP"\n- "help" for more commands.`,
    };
  }
}
