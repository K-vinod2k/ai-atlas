export type NodeKind =
  | "domain"
  | "paradigm"
  | "concept"
  | "family"
  | "component"
  | "model"
  | "tool"
  | "process"
  | "connector"
  | "unit";

export interface MathSymbol {
  symbol: string;
  meaning: string;
}

export interface NodeMath {
  title: string;
  formula: string;
  summary: string;
  symbols: MathSymbol[];
}

export interface DataFlowEdge {
  from: string;
  to: string;
  label: string;
}

export interface WalkthroughStep {
  step: number;
  title: string;
  body: string;
  formula?: string;
}

export interface RichContent {
  /** 1-4 paragraphs of markdown shown between the hero and the analogy card. */
  explanation?: string;
  analogy?: string;
  diagram?: string;
  architectureSvg?: string;
  dataFlow?: DataFlowEdge[];
  walkthrough?: WalkthroughStep[];
  visualExample?: string;
}

export interface TaxonomyNode {
  id: string;
  name: string;
  kind: NodeKind;
  one: string;
  differs?: string;
  ex?: string[];
  links?: string[];
  children?: TaxonomyNode[];
  math?: NodeMath;
  rich?: RichContent;
}

export interface IndexedNode {
  node: TaxonomyNode;
  depth: number;
  branchId: string;
  pathIds: string[];
}

export const KIND_LABEL: Record<NodeKind, string> = {
  domain: "Field",
  paradigm: "Paradigm",
  concept: "Concept",
  family: "Architecture",
  component: "Component",
  model: "Model",
  tool: "Tool",
  process: "Process",
  connector: "Connector",
  unit: "Unit",
};

export const NON_LAYER_KINDS: NodeKind[] = ["connector", "process"];

/* ---------- Skillup content ---------- */

export type SkillupKind = "phase" | "note" | "snippet";

export interface SkillupItem {
  slug: string;
  title: string;
  kind: SkillupKind;
  topic: string;
  summary: string;
  /** e.g. "Weeks 1-2" for roadmap phases */
  weeks?: string;
  order: number;
  /** Markdown body */
  body: string;
  /** Taxonomy node ids this item relates to */
  relatedNodeIds?: string[];
}

export const SKILLUP_KIND_LABEL: Record<SkillupKind, string> = {
  phase: "Roadmap phase",
  note: "Note",
  snippet: "Code snippet",
};

/* ---------- Learning progress ---------- */

export type ProgressStatus =
  | "not_started"
  | "reading"
  | "understood"
  | "mastered";

export const PROGRESS_STATUSES: ProgressStatus[] = [
  "not_started",
  "reading",
  "understood",
  "mastered",
];

export const PROGRESS_LABEL: Record<ProgressStatus, string> = {
  not_started: "Not started",
  reading: "Reading",
  understood: "Understood",
  mastered: "Mastered",
};

/** Dot / bar colors per status (new palette: gray, warm tan, lifted slate, cream) */
export const PROGRESS_COLOR: Record<ProgressStatus, string> = {
  not_started: "rgba(242, 239, 236, 0.28)",
  reading: "#C8A88E",
  understood: "#7FA3C0",
  mastered: "#E8D5C4",
};

export function isProgressStatus(value: string): value is ProgressStatus {
  return (PROGRESS_STATUSES as string[]).includes(value);
}
