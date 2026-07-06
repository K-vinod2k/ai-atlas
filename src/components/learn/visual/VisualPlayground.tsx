"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import type { TaxonomyNode } from "@/data/types";
import { ConceptInspector } from "./ConceptInspector";
import { ConnectionMapDark } from "./ConnectionMapDark";
import { DataFlowSimulator } from "./DataFlowSimulator";
import { NodeNewsCard } from "./NodeNewsCard";
import { ZoomSpine } from "./ZoomSpine";

const ArchitectureDiagram = dynamic(
  () => import("./ArchitectureDiagram").then((m) => m.ArchitectureDiagram),
  {
    ssr: false,
    loading: () => (
      <div
        className="glass-panel rounded-2xl min-h-[220px] flex items-center justify-center gap-2 text-sm text-[color:var(--color-muted-foreground)]"
        role="status"
      >
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
        <span>Loading diagram...</span>
      </div>
    ),
  },
);

interface VisualPlaygroundProps {
  node: TaxonomyNode;
  path: TaxonomyNode[];
  onSelectNode: (id: string) => void;
}

export function VisualPlayground({
  node,
  path,
  onSelectNode,
}: VisualPlaygroundProps) {
  const diagramSource = node.rich?.diagram;
  const dataFlow = node.rich?.dataFlow ?? [];

  return (
    <div className="flex flex-col gap-4">
      <ZoomSpine path={path} onSelectNode={onSelectNode} />

      {diagramSource && (
        <ArchitectureDiagram source={diagramSource} title="Architecture diagram" />
      )}

      {dataFlow.length > 0 && <DataFlowSimulator edges={dataFlow} />}

      <ConnectionMapDark node={node} onSelectNode={onSelectNode} />

      <ConceptInspector node={node} onSelectNode={onSelectNode} />

      <NodeNewsCard nodeId={node.id} />
    </div>
  );
}
