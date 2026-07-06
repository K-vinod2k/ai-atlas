"use client";

import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  AlertTriangle,
  BookOpen,
  GitCompare,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { getNodeIdByName } from "@/data/taxonomy";
import { getSkillupForNode } from "@/data/skillup";
import {
  KIND_LABEL,
  NON_LAYER_KINDS,
  type TaxonomyNode,
} from "@/data/types";
import { MathBlock } from "@/components/explore/MathBlock";
import { Breadcrumbs } from "@/components/explore/Breadcrumbs";
import { ProgressButtons } from "@/components/progress/ProgressButtons";
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
  const skillupItems = getSkillupForNode(node.id);

  return (
    <article className="space-y-6 lg:space-y-7 fade-in">
      <Breadcrumbs path={path} onSelectNode={onSelectNode} />

      <header className="space-y-4 pb-5 border-b border-[rgba(127,163,192,0.16)]">
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
        <ProgressButtons nodeId={node.id} />
      </header>

      {isNonLayer && (
        <div
          className="rounded-xl p-4 flex gap-3"
          style={{
            background: "rgba(232,213,196,0.08)",
            border: "1px solid rgba(232,213,196,0.35)",
          }}
        >
          <AlertTriangle
            className="w-5 h-5 shrink-0 text-[#E8D5C4]"
            aria-hidden="true"
          />
          <div>
            <p className="font-semibold text-[#E8D5C4]">Not a layer</p>
            <p className="mt-1 text-sm text-[color:var(--color-foreground)]/80">
              This is a {KIND_LABEL[node.kind].toLowerCase()} — an edge or action
              that spans layers, not a level in the hierarchy.
            </p>
          </div>
        </div>
      )}

      {rich?.explanation && (
        <section className="prose-skillup">
          <Markdown remarkPlugins={[remarkGfm]}>{rich.explanation}</Markdown>
        </section>
      )}

      {rich?.analogy && <AnalogyCard analogy={rich.analogy} />}

      {rich?.walkthrough && rich.walkthrough.length > 0 && (
        <WalkthroughSteps steps={rich.walkthrough} />
      )}

      {node.math && <MathBlock math={node.math} />}

      {rich?.visualExample && (
        <section className="card">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-[#7FA3C0]" aria-hidden="true" />
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
            <GitCompare className="w-4 h-4 text-[#E8D5C4]" aria-hidden="true" />
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

      {skillupItems.length > 0 && (
        <section className="card">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap
              className="w-4 h-4 text-[#E8D5C4]"
              aria-hidden="true"
            />
            <h2 className="section-label">Skillup practice</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {skillupItems.map((item) => (
              <Link
                key={item.slug}
                href={`/skillup/${item.slug}`}
                className="link-pill"
              >
                {item.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      {node.children && node.children.length > 0 && (
        <section>
          <h2 className="section-label mb-3">Breaks down into</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {node.children.map((child) => (
              <button
                key={child.id}
                type="button"
                onClick={() => onSelectNode(child.id)}
                className="card card-interactive text-left !p-4"
              >
                <p className="text-sm font-semibold text-foreground">
                  {child.name}
                </p>
                <p className="mt-1 text-xs text-[color:var(--color-foreground)]/70 leading-relaxed">
                  {child.one}
                </p>
              </button>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
