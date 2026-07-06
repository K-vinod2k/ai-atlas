import { findByName } from "@/lib/kg";

export type Intent =
  | "help"
  | "explain"
  | "compare"
  | "path"
  | "search"
  | "route"
  | "navigate"
  | "lookup";

export interface EntityRef {
  /** The raw term as typed by the user. */
  term: string;
  /** Resolved taxonomy node id, when deterministic entity linking succeeded. */
  nodeId?: string;
}

export interface ParsedQuery {
  raw: string;
  intent: Intent;
  entities: EntityRef[];
}

function cleanTerm(term: string): string {
  return term
    .trim()
    .replace(/[?.!,;:]+$/, "")
    .replace(/\s+(fit|sit|belong|go|live)s?$/i, "")
    .trim();
}

function ref(term: string): EntityRef {
  const cleaned = cleanTerm(term);
  const nodeId = findByName(cleaned);
  return nodeId ? { term: cleaned, nodeId } : { term: cleaned };
}

const COMPARE_PATTERNS = [
  /compare\s+(.+?)\s+(?:vs\.?|versus|and|with|to)\s+(.+)/i,
  /(.+?)\s+vs\.?\s+(.+)/i,
  /difference\s+between\s+(.+?)\s+and\s+(.+)/i,
];

const PATH_PATTERNS = [
  /how\s+(?:is|are|does)\s+(.+?)\s+(?:related|connected|linked)\s+to\s+(.+)/i,
  /path\s+(?:from|between)\s+(.+?)\s+(?:to|and)\s+(.+)/i,
];

/** Deterministic query parsing: intent classification + entity extraction against the KG alias index. */
export function parseQuery(raw: string): ParsedQuery {
  const input = raw.trim();

  if (/^(help|commands?)\s*$/i.test(input)) {
    return { raw: input, intent: "help", entities: [] };
  }

  for (const p of PATH_PATTERNS) {
    const m = input.match(p);
    if (m) {
      return { raw: input, intent: "path", entities: [ref(m[1]), ref(m[2])] };
    }
  }

  for (const p of COMPARE_PATTERNS) {
    const m = input.match(p);
    if (m) {
      return { raw: input, intent: "compare", entities: [ref(m[1]), ref(m[2])] };
    }
  }

  const explainMatch = input.match(/^(?:explain|what\s+is|what\s+are|tell\s+me\s+about|describe)\s+(.+)/i);
  if (explainMatch) {
    return { raw: input, intent: "explain", entities: [ref(explainMatch[1])] };
  }

  const findMatch = input.match(/^(?:find|search|lookup|look\s+up)\s+(?:for\s+)?(.+)/i);
  if (findMatch) {
    return { raw: input, intent: "search", entities: [ref(findMatch[1])] };
  }

  const routeMatch = input.match(/^(?:route|where\s+(?:does|do|is|are)|layer\s+for)\s+(.+)/i);
  if (routeMatch) {
    return { raw: input, intent: "route", entities: [ref(routeMatch[1])] };
  }

  const navMatch = input.match(/^(?:navigate\s+to|navigate|open|go\s+to|show\s+me)\s+(.+)/i);
  if (navMatch) {
    return { raw: input, intent: "navigate", entities: [ref(navMatch[1])] };
  }

  return { raw: input, intent: "lookup", entities: [ref(input)] };
}
