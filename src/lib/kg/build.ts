import { TREE, taxonomyIndex } from "@/data/taxonomy";
import type { TaxonomyNode } from "@/data/types";
import type {
  EntityType,
  KnowledgeGraph,
  Predicate,
  Triple,
} from "./types";

/** Primary aliases: full name plus parenthetical variants. */
function primaryAliases(node: TaxonomyNode): string[] {
  const out = new Set<string>();
  const name = node.name.trim();
  out.add(name);

  const noParen = name.replace(/\s*\([^)]*\)/g, "").trim();
  if (noParen && noParen !== name) out.add(noParen);

  const inParen = name.match(/\(([^)]+)\)/)?.[1]?.trim();
  if (inParen && !/^e\.g\./i.test(inParen)) out.add(inParen);

  return Array.from(out);
}

/** Secondary aliases: parts of compound names like "PEFT / LoRA / QLoRA". */
function splitAliases(node: TaxonomyNode): string[] {
  const out = new Set<string>();
  for (const source of primaryAliases(node)) {
    if (!/[/&,]/.test(source)) continue;
    for (const part of source.split(/[/&,]/)) {
      const p = part.replace(/\s*\([^)]*\)/g, "").trim();
      if (p.length >= 2) out.add(p);
    }
  }
  return Array.from(out);
}

export function aliasesFor(node: TaxonomyNode): string[] {
  return Array.from(new Set([...primaryAliases(node), ...splitAliases(node)]));
}

function buildAliasIndex(): Map<string, string> {
  const index = new Map<string, string>();
  const claim = (alias: string, id: string) => {
    const key = alias.toLowerCase();
    if (!index.has(key)) index.set(key, id);
  };

  // Priority tiers; within a tier, shallower nodes win conflicts because
  // taxonomyIndex iterates in tree order.
  for (const { node } of taxonomyIndex.byId.values()) {
    for (const alias of primaryAliases(node)) claim(alias, node.id);
  }
  for (const { node } of taxonomyIndex.byId.values()) {
    for (const alias of splitAliases(node)) claim(alias, node.id);
  }
  // Example literals last, so "XGBoost" resolves to the gbm node.
  for (const { node } of taxonomyIndex.byId.values()) {
    for (const ex of node.ex ?? []) claim(ex.trim(), node.id);
  }
  return index;
}

/**
 * Parse the target of a `differs` sentence like
 * "vs Machine Learning: rules are hand-written..." into a node id when possible.
 */
function parseDiffersTarget(
  differs: string,
  aliasIndex: Map<string, string>,
): { id?: string; literal: string } | undefined {
  const m = differs.match(/^vs\.?\s+([^:]+):/i);
  if (!m) return undefined;
  const literal = m[1].trim();
  const direct = aliasIndex.get(literal.toLowerCase());
  if (direct) return { id: direct, literal };

  // Partial resolution: "Supervised" -> "Supervised Learning".
  const lower = literal.toLowerCase();
  for (const [alias, id] of aliasIndex) {
    if (alias.startsWith(lower) || lower.startsWith(alias)) {
      return { id, literal };
    }
  }
  return { literal };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

interface MentionPattern {
  nodeId: string;
  regex: RegExp;
}

/** Whole-word patterns for cross-reference mining. Short names (acronyms) match case-sensitively. */
function buildMentionPatterns(): MentionPattern[] {
  const patterns: MentionPattern[] = [];
  for (const { node } of taxonomyIndex.byId.values()) {
    for (const alias of aliasesFor(node)) {
      if (alias.length < 3) continue;
      const flags = alias.length <= 4 ? "g" : "gi";
      patterns.push({
        nodeId: node.id,
        regex: new RegExp(`\\b${escapeRegExp(alias)}\\b`, flags),
      });
    }
  }
  return patterns;
}

function richTextOf(node: TaxonomyNode): string {
  const rich = node.rich;
  if (!rich) return "";
  return [rich.explanation ?? "", rich.analogy ?? "", rich.visualExample ?? ""]
    .join("\n")
    .trim();
}

export function buildGraph(): KnowledgeGraph {
  const aliasIndex = buildAliasIndex();
  const triples: Triple[] = [];
  const seen = new Set<string>();

  const add = (
    subject: string,
    predicate: Predicate,
    object: string,
    subjectType: EntityType,
    objectType: EntityType,
    weight?: number,
  ) => {
    const key = `${subject}|${predicate}|${object}`;
    if (seen.has(key)) return;
    seen.add(key);
    triples.push({
      subject,
      predicate,
      object,
      subjectType,
      objectType,
      ...(weight !== undefined ? { weight } : {}),
    });
  };

  // Structural + field-derived edges from a single tree walk.
  const walk = (node: TaxonomyNode) => {
    for (const child of node.children ?? []) {
      add(node.id, "parent_of", child.id, "node", "node", 1);
      add(child.id, "child_of", node.id, "node", "node", 1);
      walk(child);
    }

    for (const linkName of node.links ?? []) {
      const targetId = aliasIndex.get(linkName.toLowerCase());
      if (targetId && targetId !== node.id) {
        add(node.id, "connects_to", targetId, "node", "node", 1);
      } else if (!targetId) {
        add(node.id, "connects_to", linkName, "node", "literal", 1);
      }
    }

    if (node.differs) {
      const target = parseDiffersTarget(node.differs, aliasIndex);
      if (target?.id && target.id !== node.id) {
        add(node.id, "differs_from", target.id, "node", "node", 1);
      } else if (target) {
        add(node.id, "differs_from", target.literal, "node", "literal", 1);
      }
    }

    for (const ex of node.ex ?? []) {
      add(ex, "example_of", node.id, "literal", "node", 1);
    }
  };
  walk(TREE);

  // related_to: cross-references mined from rich explanation text.
  const mentionPatterns = buildMentionPatterns();
  for (const indexed of taxonomyIndex.byId.values()) {
    const { node, pathIds } = indexed;
    const text = richTextOf(node);
    if (!text) continue;

    const counts = new Map<string, number>();
    for (const { nodeId, regex } of mentionPatterns) {
      if (nodeId === node.id) continue;
      if (pathIds.includes(nodeId)) continue; // skip ancestors (already parent_of chain)
      const matches = text.match(regex);
      if (matches) counts.set(nodeId, (counts.get(nodeId) ?? 0) + matches.length);
    }
    for (const [targetId, count] of counts) {
      const targetIndexed = taxonomyIndex.byId.get(targetId);
      if (targetIndexed?.pathIds.includes(node.id)) continue; // skip descendants
      add(node.id, "related_to", targetId, "node", "node", count);
    }
  }

  // Traversal indexes.
  const byNode = new Map<string, Triple[]>();
  const byPredicate = new Map<Predicate, Triple[]>();
  const attach = (key: string, t: Triple) => {
    const list = byNode.get(key);
    if (list) list.push(t);
    else byNode.set(key, [t]);
  };
  for (const t of triples) {
    if (t.subjectType === "node") attach(t.subject, t);
    if (t.objectType === "node" && t.object !== t.subject) attach(t.object, t);
    const list = byPredicate.get(t.predicate);
    if (list) list.push(t);
    else byPredicate.set(t.predicate, [t]);
  }

  return {
    triples,
    byNode,
    byPredicate,
    aliasIndex,
    nodeCount: taxonomyIndex.count,
  };
}
