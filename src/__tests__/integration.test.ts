import { describe, it, expect, beforeAll } from "vitest";
import {
  taxonomyIndex,
  searchNodes,
  getNodeById,
  getNodeIdByName,
  getPath,
} from "@/data/taxonomy";
import { MATH_BY_NODE_ID } from "@/data/math-content";
import { LocalGuideProvider } from "@/lib/agent/local-guide";
import { tagFeedItem } from "@/lib/feed/tagger";
import { refreshFeed } from "@/lib/feed/refresh";

describe("AI Atlas integration", () => {
  it("taxonomy has ~220 nodes after lablab.ai enrichment", () => {
    expect(taxonomyIndex.count).toBeGreaterThan(200);
    expect(taxonomyIndex.count).toBeLessThan(260);
  });

  it("search finds attention node", () => {
    const results = searchNodes({ query: "attention", limit: 10 });
    const ids = results.map((r) => r.node.id);
    expect(ids).toContain("attention");
  });

  it("attention node has KaTeX math", () => {
    const indexed = getNodeById("attention");
    expect(indexed).toBeDefined();
    expect(indexed?.node.math).toBeDefined();
    expect(indexed?.node.math?.formula).toContain("softmax");
    expect(MATH_BY_NODE_ID["attention"]).toBeDefined();
  });

  it("path from root to attention is valid", () => {
    const path = getPath("attention");
    expect(path[0]?.id).toBe("ai");
    expect(path[path.length - 1]?.id).toBe("attention");
  });

  it("name lookup resolves cross-links", () => {
    expect(getNodeIdByName("RAG")).toBe("rag");
    expect(getNodeIdByName("Embeddings")).toBe("embeddings");
  });

  it("local guide explains a node", async () => {
    const guide = new LocalGuideProvider();
    const res = await guide.chat([{ role: "user", content: "explain attention" }]);
    expect(res.content).toContain("Attention");
    expect(res.navigateTo).toBe("attention");
  });

  it("local guide compares two terms", async () => {
    const guide = new LocalGuideProvider();
    const res = await guide.chat([
      { role: "user", content: "compare RAG vs Fine-tuning" },
    ]);
    expect(res.content).toContain("RAG");
    expect(res.content.toLowerCase()).toMatch(/fine/);
  });

  it("feed tagger maps keywords to nodes", () => {
    const tags = tagFeedItem({
      id: "test-1",
      title: "New LoRA fine-tuning method for transformer attention",
      url: "https://example.com",
      source: "test",
      publishedAt: new Date().toISOString(),
    });
    expect(tags.length).toBeGreaterThan(0);
    expect(tags).toContain("peft");
  });

  it("feed refresh stores items in SQLite", async () => {
    const result = await refreshFeed();
    expect(result.added).toBeGreaterThanOrEqual(0);
    // arXiv should usually succeed
    expect(result.sources["arXiv"]).toBeGreaterThan(0);
  }, 60000);
});
