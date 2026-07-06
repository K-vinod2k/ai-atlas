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
