"use client";

import { AlertTriangle, BookOpen, GitCompare, Sparkles } from "lucide-react";
import { getNodeIdByName } from "@/data/taxonomy";
import {
  KIND_LABEL,
  NON_LAYER_KINDS,
  type TaxonomyNode,
} from "@/data/types";
import { MathBlock } from "@/components/explore/MathBlock";
import { Breadcrumbs } from "@/components/explore/Breadcrumbs";
import { AnalogyCard } from "./AnalogyCard";
import { WalkthroughSteps } from "./WalkthroughSteps";

interface ConceptViewerProps {
  node: TaxonomyNode;
  path: TaxonomyNode[];
  onSelectNode: (id: string) => void;
}

export function ConceptViewer({ node, path, onSelectNode }: ConceptViewerProps) {
  const isNonLayer = NON_LAYER_KINDS.includes(node.kind);
  const rich = node.rich;

  return (
    <article className="space-y-6 lg:space-y-7 fade-in">
      <Breadcrumbs path={path} onSelectNode={onSelectNode} />

      <header className="space-y-4 pb-5 border-b border-[rgba(122,226,207,0.16)]">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="badge badge-primary">
            <Sparkles className="w-3 h-3 mr-1" aria-hidden="true" />
            {KIND_LABEL[node.kind]}
          </span>
          {rich?.analogy && (
            <span className="badge badge-highlight">Analogy inside</span>
          )}
        </div>
        <h1
          className="heading-display text-3xl lg:text-4xl font-semibold text-foreground leading-tight"
        >
          {node.name}
        </h1>
        <p className="text-[color:var(--color-foreground)]/85 leading-relaxed text-base lg:text-lg max-w-2xl">
          {node.one}
        </p>
      </header>

      {isNonLayer && (
        <div
          className="rounded-xl p-4 flex gap-3"
          style={{
            background: "rgba(253,235,158,0.08)",
            border: "1px solid rgba(253,235,158,0.35)",
          }}
        >
          <AlertTriangle
            className="w-5 h-5 shrink-0 text-[#FDEB9E]"
            aria-hidden="true"
          />
          <div>
            <p className="font-semibold text-[#FDEB9E]">Not a layer</p>
            <p className="mt-1 text-sm text-[color:var(--color-foreground)]/80">
              This is a {KIND_LABEL[node.kind].toLowerCase()} — an edge or action
              that spans layers, not a level in the hierarchy.
            </p>
          </div>
        </div>
      )}

      {rich?.analogy && <AnalogyCard analogy={rich.analogy} />}

      {rich?.walkthrough && rich.walkthrough.length > 0 && (
        <WalkthroughSteps steps={rich.walkthrough} />
      )}

      {node.math && <MathBlock math={node.math} />}

      {rich?.visualExample && (
        <section className="card">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-[#7AE2CF]" aria-hidden="true" />
            <h2 className="section-label">Real-world example</h2>
          </div>
          <p className="text-sm text-[color:var(--color-foreground)]/85 leading-relaxed">
            {rich.visualExample}
          </p>
        </section>
      )}

      {node.differs && (
        <section className="card">
          <div className="flex items-center gap-2 mb-3">
            <GitCompare className="w-4 h-4 text-[#FDEB9E]" aria-hidden="true" />
            <h2 className="section-label">How it differs</h2>
          </div>
          <p className="text-sm text-[color:var(--color-foreground)]/85 leading-relaxed">
            {node.differs}
          </p>
        </section>
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
                <span key={linkName} className="badge opacity-60">
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
    </article>
  );
}
