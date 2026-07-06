"use client";

import dynamic from "next/dynamic";
import { AlertCircle, BookOpen, FlaskConical } from "lucide-react";
import { getNodeIdByName } from "@/data/taxonomy";
import { KIND_LABEL, NON_LAYER_KINDS, type TaxonomyNode } from "@/data/types";
import { MathBlock } from "@/components/explore/MathBlock";
import { Breadcrumbs } from "@/components/explore/Breadcrumbs";
import { NodeNews } from "@/components/feed/NodeNews";
import { AnalogyCard } from "./AnalogyCard";
import { DataFlowPanel } from "./DataFlowPanel";
import { WalkthroughSteps } from "./WalkthroughSteps";

const MermaidDiagram = dynamic(
  () => import("./MermaidDiagram").then((m) => m.MermaidDiagram),
  {
    ssr: false,
    loading: () => (
      <div
        className="rounded-xl min-h-[180px] flex items-center justify-center text-sm text-muted-foreground"
        style={{
          background: "var(--color-surface)",
          border: "1px solid color-mix(in srgb, var(--color-border) 40%, transparent)",
        }}
        role="status"
      >
        Loading diagram...
      </div>
    ),
  },
);

interface ConceptViewerProps {
  node: TaxonomyNode;
  path: TaxonomyNode[];
  onSelectNode: (id: string) => void;
}

export function ConceptViewer({ node, path, onSelectNode }: ConceptViewerProps) {
  const isNonLayer = NON_LAYER_KINDS.includes(node.kind);
  const rich = node.rich;

  return (
    <article className="space-y-6 lg:space-y-8">
      <Breadcrumbs path={path} onSelectNode={onSelectNode} />

      <header className="space-y-3 pb-2 border-b" style={{ borderColor: "color-mix(in srgb, var(--color-border) 30%, transparent)" }}>
        <div className="flex items-center gap-3 flex-wrap">
          <h1
            className="text-2xl lg:text-3xl font-semibold text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {node.name}
          </h1>
          <span className="badge badge-primary">{KIND_LABEL[node.kind]}</span>
        </div>
        <p className="text-foreground/80 leading-relaxed text-base lg:text-lg">{node.one}</p>
      </header>

      {isNonLayer && (
        <div
          className="rounded-xl p-4 text-sm flex gap-3"
          style={{
            background: "color-mix(in srgb, var(--color-accent) 10%, var(--color-surface))",
            border: "1px solid color-mix(in srgb, var(--color-accent) 30%, transparent)",
          }}
        >
          <AlertCircle className="w-5 h-5 shrink-0 text-accent" aria-hidden="true" />
          <div>
            <p className="font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
              Not a layer
            </p>
            <p className="mt-1 text-foreground/80">
              This is a {KIND_LABEL[node.kind].toLowerCase()} — an edge or action that spans
              layers, not a level in the hierarchy.
            </p>
          </div>
        </div>
      )}

      {rich?.analogy && <AnalogyCard analogy={rich.analogy} />}

      {rich?.diagram && <MermaidDiagram source={rich.diagram} title="Architecture diagram" />}

      {rich?.dataFlow && rich.dataFlow.length > 0 && (
        <DataFlowPanel edges={rich.dataFlow} />
      )}

      {rich?.walkthrough && rich.walkthrough.length > 0 && (
        <WalkthroughSteps steps={rich.walkthrough} />
      )}

      {node.math && <MathBlock math={node.math} />}

      {rich?.visualExample && (
        <section
          className="rounded-xl p-5 lg:p-6"
          style={{
            background: "var(--color-surface)",
            border: "1px solid color-mix(in srgb, var(--color-border) 40%, transparent)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <FlaskConical className="w-4 h-4 text-accent" aria-hidden="true" />
            <h2 className="section-label">Real-world example</h2>
          </div>
          <p className="text-sm text-foreground/85 leading-relaxed">{rich.visualExample}</p>
        </section>
      )}

      {node.differs && (
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-primary" aria-hidden="true" />
            <p className="section-label">How it differs</p>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed">{node.differs}</p>
        </div>
      )}

      {node.ex && node.ex.length > 0 && (
        <section>
          <h2 className="section-label mb-3">Examples</h2>
          <div className="flex flex-wrap gap-2">
            {node.ex.map((e) => (
              <span key={e} className="badge">
                {e}
              </span>
            ))}
          </div>
        </section>
      )}

      {node.links && node.links.length > 0 && (
        <section>
          <h2 className="section-label mb-3">Connects to</h2>
          <div className="flex flex-wrap gap-2">
            {node.links.map((linkName) => {
              const targetId = getNodeIdByName(linkName);
              return targetId ? (
                <button
                  key={linkName}
                  type="button"
                  onClick={() => onSelectNode(targetId)}
                  className="link-pill"
                >
                  {linkName}
                </button>
              ) : (
                <span key={linkName} className="badge opacity-50">
                  {linkName}
                </span>
              );
            })}
          </div>
        </section>
      )}

      {node.children && node.children.length > 0 && (
        <section>
          <h2 className="section-label mb-3">Breaks down into</h2>
          <div className="flex flex-wrap gap-2">
            {node.children.map((child) => (
              <button
                key={child.id}
                type="button"
                onClick={() => onSelectNode(child.id)}
                className="link-pill"
              >
                {child.name}
              </button>
            ))}
          </div>
        </section>
      )}

      <NodeNews nodeId={node.id} />
    </article>
  );
}
