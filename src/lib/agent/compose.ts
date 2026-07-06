import { getNodeById, getPath, searchNodes, taxonomyIndex } from "@/data/taxonomy";
import { KIND_LABEL } from "@/data/types";
import { GRAPH, graphStats, neighbors, path as kgPath, PREDICATE_LABEL } from "@/lib/kg";
import {
  neighbors as typedNeighbors,
  pathBetween as typedPath,
  stepLabel,
} from "@/lib/graph/query";
import { PREDICATE_LABEL as TYPED_PREDICATE_LABEL } from "@/lib/graph/triples";
import type { ParsedQuery } from "./entities";
import { graphFacts, nodeName, nodeNames } from "./graph-facts";
import type { AgentResponse } from "./types";

function graphContextLine(nodeId: string): string {
  const facts = graphFacts(nodeId);
  const name = nodeName(nodeId);
  const parts: string[] = [];
  if (facts.parentId) parts.push(`sits under **${nodeName(facts.parentId)}**`);
  if (facts.childIds.length > 0) {
    parts.push(`breaks down into ${nodeNames(facts.childIds, 5).join(", ")}`);
  }
  if (facts.connectIds.length > 0) {
    parts.push(`connects to ${nodeNames(facts.connectIds, 5).join(", ")}`);
  }
  if (facts.differIds.length > 0) {
    parts.push(`differs from ${nodeNames(facts.differIds, 3).join(", ")}`);
  }
  if (facts.relatedIds.length > 0) {
    parts.push(`is related to ${nodeNames(facts.relatedIds, 4).join(", ")}`);
  }
  if (parts.length === 0) return "";
  return `**In the graph:** ${name} ${parts.join("; ")}.`;
}

export function explainNode(nodeId: string): AgentResponse {
  const indexed = getNodeById(nodeId);
  if (!indexed) return { content: "Node not found." };
  const { node } = indexed;

  const lines = [`**${node.name}** (${KIND_LABEL[node.kind]})`, "", node.one];
  const graphLine = graphContextLine(nodeId);
  if (graphLine) lines.push("", graphLine);
  if (node.differs) lines.push("", `**How it differs:** ${node.differs}`);
  if (node.ex?.length) lines.push("", `**Examples:** ${node.ex.join(", ")}`);
  if (node.math) {
    lines.push("", `**Math:** ${node.math.title}`, node.math.summary);
    lines.push("", `Open /learn?node=${node.id} for the full formula and interactive content.`);
  }
  return { content: lines.join("\n"), navigateTo: node.id };
}

function notFound(terms: string[]): AgentResponse {
  return {
    content: `Could not find: ${terms.join(", ")}. Check spelling or search in Explore.`,
  };
}

function compareNodes(parsed: ParsedQuery): AgentResponse {
  const [a, b] = parsed.entities;
  const missing = parsed.entities.filter((e) => !e.nodeId).map((e) => e.term);
  if (missing.length > 0 || !a.nodeId || !b.nodeId) return notFound(missing);

  const an = getNodeById(a.nodeId)?.node;
  const bn = getNodeById(b.nodeId)?.node;
  if (!an || !bn) return notFound([a.term, b.term]);

  const lines = [
    `**${an.name}** vs **${bn.name}**`,
    "",
    `**${an.name}** (${KIND_LABEL[an.kind]}): ${an.one}`,
    an.differs ? `Differs: ${an.differs}` : "",
    "",
    `**${bn.name}** (${KIND_LABEL[bn.kind]}): ${bn.one}`,
    bn.differs ? `Differs: ${bn.differs}` : "",
  ];

  const route = kgPath(a.nodeId, b.nodeId);
  if (route.length > 1) {
    lines.push("", `**Graph path:** ${route.map(nodeName).join(" \u2192 ")}`);
  }
  return { content: lines.filter(Boolean).join("\n") };
}

function describeHop(from: string, to: string): string {
  const triple = neighbors(from).find(
    (t) =>
      (t.subject === from && t.object === to) ||
      (t.subject === to && t.object === from),
  );
  if (!triple) return `**${nodeName(from)}** \u2192 **${nodeName(to)}**`;
  const forward = triple.subject === from;
  const label = PREDICATE_LABEL[triple.predicate];
  return forward
    ? `**${nodeName(from)}** ${label} **${nodeName(to)}**`
    : `**${nodeName(to)}** ${label} **${nodeName(from)}**`;
}

function pathBetween(parsed: ParsedQuery): AgentResponse {
  const [a, b] = parsed.entities;
  const missing = parsed.entities.filter((e) => !e.nodeId).map((e) => e.term);
  if (missing.length > 0 || !a.nodeId || !b.nodeId) return notFound(missing);

  // Typed path (is_a / part_of / uses / ...) preferring curated edges.
  const steps = typedPath(a.nodeId, b.nodeId);
  if (steps && steps.length > 0) {
    const hops = steps.map(
      (s, i) => `${i + 1}. **${nodeName(s.from)}** ${stepLabel(s)} **${nodeName(s.to)}**`,
    );
    return {
      content: [
        `**${nodeName(a.nodeId)}** connects to **${nodeName(b.nodeId)}** in ${steps.length} hop${steps.length > 1 ? "s" : ""}:`,
        "",
        ...hops,
        "",
        `Trace it visually: /graph?node=${a.nodeId}`,
      ].join("\n"),
    };
  }
  if (steps !== null) {
    return { content: `Those both resolve to **${nodeName(a.nodeId)}** — same node in the graph.` };
  }

  // Fallback: untyped BFS over the raw store (covers mined-only connections).
  const route = kgPath(a.nodeId, b.nodeId);
  if (route.length === 0) {
    return {
      content: `No path found between **${nodeName(a.nodeId)}** and **${nodeName(b.nodeId)}** in the knowledge graph.`,
    };
  }
  const hops = route.slice(0, -1).map((id, i) => `${i + 1}. ${describeHop(id, route[i + 1])}`);
  return {
    content: [
      `**${nodeName(a.nodeId)}** connects to **${nodeName(b.nodeId)}** in ${route.length - 1} hop${route.length > 2 ? "s" : ""}:`,
      "",
      ...hops,
    ].join("\n"),
  };
}

const MAX_MINED_CONNECTIONS = 6;

/** Typed neighbor list for "what connects to X". */
function connectionsOf(parsed: ParsedQuery): AgentResponse {
  const entity = parsed.entities[0];
  if (!entity?.nodeId) return notFound([entity?.term ?? parsed.raw]);
  const nodeId = entity.nodeId;
  const name = nodeName(nodeId);

  const all = typedNeighbors(nodeId);
  const curated = all.filter((n) => n.predicate !== "related_to");
  const mined = all
    .filter((n) => n.predicate === "related_to")
    .sort((a, b) => (b.triple.weight ?? 0) - (a.triple.weight ?? 0))
    .slice(0, MAX_MINED_CONNECTIONS);
  const shown = [...curated, ...mined];
  if (shown.length === 0) {
    return { content: `**${name}** has no typed relations in the knowledge graph yet.` };
  }

  const lines = shown.map((n) => {
    const label = TYPED_PREDICATE_LABEL[n.predicate];
    return n.direction === "out"
      ? `- ${name} *${label}* \u2192 **${nodeName(n.id)}**`
      : `- **${nodeName(n.id)}** *${label}* \u2192 ${name}`;
  });

  const hiddenMined = all.length - shown.length;
  return {
    content: [
      `**${name}** has ${all.length} typed relation${all.length === 1 ? "" : "s"}:`,
      "",
      ...lines,
      ...(hiddenMined > 0 ? ["", `(+${hiddenMined} more mined mentions)`] : []),
      "",
      `See them visually: /graph?node=${nodeId}`,
    ].join("\n"),
    navigateTo: nodeId,
  };
}

function routeNode(parsed: ParsedQuery): AgentResponse {
  const entity = parsed.entities[0];
  if (!entity?.nodeId) {
    return {
      content: `I could not place "${entity?.term ?? parsed.raw}" in the map. Try a more specific term (e.g. "attention", "LoRA", "RAG") or search in Explore.`,
    };
  }
  const indexed = getNodeById(entity.nodeId);
  if (!indexed) return notFound([entity.term]);

  const breadcrumb = getPath(entity.nodeId).map((n) => n.name).join(" \u2192 ");
  const lines = [
    `**${indexed.node.name}** is a ${KIND_LABEL[indexed.node.kind]} in the map.`,
    "",
    `**Where it sits:** ${breadcrumb}`,
  ];
  const graphLine = graphContextLine(entity.nodeId);
  if (graphLine) lines.push("", graphLine);
  lines.push("", `Open /learn?node=${entity.nodeId} to explore it.`);
  return { content: lines.join("\n"), navigateTo: entity.nodeId };
}

function searchTaxonomy(parsed: ParsedQuery): AgentResponse {
  const term = parsed.entities[0]?.term ?? parsed.raw;
  const results = searchNodes({ query: term, limit: 5 });
  if (results.length === 0) {
    return {
      content: `No nodes matching "${term}". Try a different term or ask "where does ${term} fit".`,
    };
  }
  if (results.length === 1) return explainNode(results[0].node.id);
  const list = results
    .map((r) => `- **${r.node.name}** (${KIND_LABEL[r.node.kind]}) \u2014 /learn?node=${r.node.id}`)
    .join("\n");
  return { content: `Found ${results.length} matches for "${term}":\n\n${list}` };
}

function help(): AgentResponse {
  const stats = graphStats();
  return {
    content: [
      "I answer from a knowledge graph built over the AI Landscape Map:",
      "",
      "- **explain [node]** \u2014 definition, graph context, examples, math",
      "- **compare X vs Y** \u2014 side-by-side differences with the graph path",
      "- **how is X related to Y** \u2014 shortest path through the graph",
      "- **what connects to X** \u2014 typed neighbor list from the graph",
      "- **find / search [term]** \u2014 lookup nodes",
      "- **where does [term] fit** \u2014 its place in the hierarchy",
      "- **navigate [node]** \u2014 open a node page",
      "",
      `The graph has ${stats.nodes} concepts and ${stats.triples} typed relationships across ${(taxonomyIndex.byId.get("ai")?.node.children ?? []).length} top branches. See it at /graph.`,
    ].join("\n"),
  };
}

function fallbackLookup(parsed: ParsedQuery): AgentResponse {
  const entity = parsed.entities[0];
  if (entity?.nodeId && GRAPH.byNode.has(entity.nodeId)) {
    return explainNode(entity.nodeId);
  }
  const results = searchNodes({ query: parsed.raw, limit: 3 });
  if (results.length === 1) return explainNode(results[0].node.id);
  if (results.length > 1) return searchTaxonomy(parsed);
  return {
    content: `I'm not sure how to answer that. Try:\n- "explain attention"\n- "compare RAG vs fine-tuning"\n- "how is attention related to knowledge graph"\n- "help" for more commands.`,
  };
}

/** Template-based response composition from the parsed query + graph content. No LLM required. */
export function composeResponse(parsed: ParsedQuery): AgentResponse {
  switch (parsed.intent) {
    case "help":
      return help();
    case "compare":
      return compareNodes(parsed);
    case "path":
      return pathBetween(parsed);
    case "connections":
      return connectionsOf(parsed);
    case "route":
      return routeNode(parsed);
    case "search":
      return searchTaxonomy(parsed);
    case "explain":
    case "navigate": {
      const entity = parsed.entities[0];
      if (entity?.nodeId) return explainNode(entity.nodeId);
      return searchTaxonomy(parsed);
    }
    case "lookup":
      return fallbackLookup(parsed);
  }
}
