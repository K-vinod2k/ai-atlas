import { describe, it, expect, beforeAll } from "vitest";
import {
  taxonomyIndex,
  searchNodes,
  getNodeById,
  getNodeIdByName,
  getPath,
} from "@/data/taxonomy";
import { MATH_BY_NODE_ID } from "@/data/math-content";
import { GraphGuideProvider } from "@/lib/agent/chain";
import { findByName, graphStats, path, subgraph } from "@/lib/kg";
import { NODE_TRIPLES, TRIPLE_COUNT_BY_PREDICATE } from "@/lib/graph/triples";
import {
  neighbors as typedNeighbors,
  pathBetween,
  pathSentence,
} from "@/lib/graph/query";
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

  it("knowledge graph builds with expected edge types", () => {
    const stats = graphStats();
    expect(stats.nodes).toBeGreaterThan(200);
    expect(stats.byPredicate.parent_of).toBe(stats.nodes - 1);
    expect(stats.byPredicate.child_of).toBe(stats.nodes - 1);
    expect(stats.byPredicate.connects_to).toBeGreaterThan(0);
    expect(stats.byPredicate.differs_from).toBeGreaterThan(0);
    expect(stats.byPredicate.example_of).toBeGreaterThan(0);
    expect(stats.byPredicate.related_to).toBeGreaterThan(0);
  });

  it("kg entity linking resolves aliases and examples", () => {
    expect(findByName("attention")).toBe("attention");
    expect(findByName("XGBoost")).toBe("gbm");
    expect(findByName("LoRA")).toBe("peft");
  });

  it("kg finds paths and subgraphs", () => {
    const route = path("attention", "kg");
    expect(route[0]).toBe("attention");
    expect(route[route.length - 1]).toBe("kg");
    expect(subgraph("transformer", 1).nodeIds.length).toBeGreaterThan(3);
  });

  it("typed display layer refines hierarchy into is_a and part_of", () => {
    expect(TRIPLE_COUNT_BY_PREDICATE.is_a).toBeGreaterThan(100);
    expect(TRIPLE_COUNT_BY_PREDICATE.part_of).toBeGreaterThan(10);
    // Components/units attach with part_of: attention block is part of the transformer block.
    const attentionParent = NODE_TRIPLES.find(
      (t) => t.subject === "attention" && t.object === "block",
    );
    expect(attentionParent?.predicate).toBe("part_of");
  });

  it("typed path prefers curated edges and renders a sentence", () => {
    const steps = pathBetween("peft", "weight");
    expect(steps).not.toBeNull();
    const sentence = pathSentence(steps!);
    expect(sentence).toContain("PEFT");
    expect(sentence).toContain("Weight & Bias");
    expect(typedNeighbors("kg").length).toBeGreaterThan(5);
  });

  it("graph guide explains a node with graph context", async () => {
    const guide = new GraphGuideProvider();
    const res = await guide.chat([{ role: "user", content: "explain attention" }]);
    expect(res.content).toContain("Attention");
    expect(res.content).toContain("In the graph");
    expect(res.navigateTo).toBe("attention");
  });

  it("graph guide compares two terms", async () => {
    const guide = new GraphGuideProvider();
    const res = await guide.chat([
      { role: "user", content: "compare RAG vs Fine-tuning" },
    ]);
    expect(res.content).toContain("RAG");
    expect(res.content.toLowerCase()).toMatch(/fine/);
  });

  it("graph guide answers relatedness via graph path", async () => {
    const guide = new GraphGuideProvider();
    const res = await guide.chat([
      { role: "user", content: "how is attention related to knowledge graph" },
    ]);
    expect(res.content.toLowerCase()).toContain("hop");
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
