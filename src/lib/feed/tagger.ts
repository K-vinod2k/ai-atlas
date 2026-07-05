import { taxonomyIndex } from "@/data/taxonomy";

export interface RawFeedItem {
  id: string;
  title: string;
  url: string;
  source: string;
  summary?: string;
  publishedAt: string;
}

/** Keyword patterns mapped to taxonomy node ids for auto-tagging. */
const TAG_PATTERNS: Array<{ pattern: RegExp; nodeId: string }> = [];

function buildTagPatterns() {
  for (const [id, indexed] of taxonomyIndex.byId) {
    const { node } = indexed;
    const keywords = [
      node.name,
      node.id.replace(/-/g, " "),
      ...(node.ex ?? []),
    ];
    for (const kw of keywords) {
      if (kw.length < 3) continue;
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      TAG_PATTERNS.push({
        pattern: new RegExp(`\\b${escaped}\\b`, "i"),
        nodeId: id,
      });
    }
  }
  // Extra high-value aliases
  const aliases: Array<[RegExp, string]> = [
    [/\bLLM\b/i, "llms"],
    [/\bGPT\b/i, "gpt"],
    [/\bClaude\b/i, "claude"],
    [/\bRAG\b/i, "rag"],
    [/\bLoRA\b/i, "peft"],
    [/\bRLHF\b/i, "rlhf"],
    [/\btransformer\b/i, "transformer"],
    [/\bdiffusion\b/i, "diffusion"],
    [/\bMamba\b/i, "ssm"],
    [/\bMoE\b/i, "moe"],
    [/\bembedding/i, "embeddings"],
    [/\bvector\s*database/i, "vectordb"],
    [/\bfine-?tun/i, "finetune"],
    [/\bquantiz/i, "quant"],
    [/\bagent/i, "agents"],
    [/\bMCP\b/i, "mcp"],
  ];
  for (const [pattern, nodeId] of aliases) {
    TAG_PATTERNS.push({ pattern, nodeId });
  }
}

buildTagPatterns();

export function tagFeedItem(item: RawFeedItem): string[] {
  const text = `${item.title} ${item.summary ?? ""}`;
  const matched = new Set<string>();
  for (const { pattern, nodeId } of TAG_PATTERNS) {
    if (pattern.test(text)) matched.add(nodeId);
  }
  return Array.from(matched).slice(0, 8);
}
