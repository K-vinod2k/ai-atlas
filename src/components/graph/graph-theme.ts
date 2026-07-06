import type { Predicate } from "@/lib/kg";

/** Branch colors on the dark palette (root + 7 top branches). */
export const BRANCH_COLOR: Record<string, string> = {
  ai: "#F2EFEC",
  paradigms: "#7FA3C0",
  arch: "#C8A88E",
  stack: "#8FBC9F",
  apps: "#E8D5C4",
  knowledge: "#6FB5AC",
  modalities: "#D9A66A",
  governance: "#F49A8A",
};

export const BRANCH_LABEL: Record<string, string> = {
  ai: "Root",
  paradigms: "Paradigms",
  arch: "Architectures",
  stack: "Build & Run Stack",
  apps: "Application & Agents",
  knowledge: "Knowledge & Symbolic",
  modalities: "Modalities & Domains",
  governance: "Alignment & Governance",
};

export function branchColor(branchId: string): string {
  return BRANCH_COLOR[branchId] ?? "#7FA3C0";
}

/** Predicates the user can toggle in the /graph view. */
export const FILTERABLE_PREDICATES: Predicate[] = [
  "parent_of",
  "connects_to",
  "differs_from",
  "related_to",
];

export const PREDICATE_FILTER_LABEL: Record<string, string> = {
  parent_of: "Hierarchy",
  connects_to: "Connects to",
  differs_from: "Differs from",
  related_to: "Related to",
};

export const EDGE_STYLE: Record<string, { stroke: string; opacity: number; dash?: string }> = {
  parent_of: { stroke: "#7FA3C0", opacity: 0.3 },
  connects_to: { stroke: "#E8D5C4", opacity: 0.55 },
  differs_from: { stroke: "#F49A8A", opacity: 0.55, dash: "4 3" },
  related_to: { stroke: "#8FBC9F", opacity: 0.16 },
};
