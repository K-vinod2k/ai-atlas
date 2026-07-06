"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { getNodeIdByName } from "@/data/taxonomy";
import { KIND_LABEL, NON_LAYER_KINDS, type TaxonomyNode } from "@/data/types";
import { MathBlock } from "./MathBlock";
import { Breadcrumbs } from "./Breadcrumbs";
import { NodeNews } from "@/components/feed/NodeNews";

interface NodeDetailProps {
  node: TaxonomyNode;
  path: TaxonomyNode[];
}

export function NodeDetail({ node, path }: NodeDetailProps) {
  const isNonLayer = NON_LAYER_KINDS.includes(node.kind);

  return (
    <article className="space-y-6">
      <Breadcrumbs path={path} />

      <header className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h1
            className="text-2xl lg:text-3xl font-semibold text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {node.name}
          </h1>
          <span className="badge badge-primary">{KIND_LABEL[node.kind]}</span>
        </div>
        <p className="text-foreground/80 leading-relaxed text-base">{node.one}</p>
      </header>

      {isNonLayer && (
        <div
          className="rounded-xl p-4 text-sm flex gap-3"
          style={{
            background: "color-mix(in srgb, var(--color-accent) 10%, var(--color-surface))",
            border: "1px solid color-mix(in srgb, var(--color-accent) 30%, transparent)",
            color: "var(--color-foreground)",
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

      {node.differs && (
        <div className="card">
          <p className="section-label mb-2">How it differs</p>
          <p className="text-sm text-foreground/80">{node.differs}</p>
        </div>
      )}

      {node.math && <MathBlock math={node.math} />}

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
                <Link key={linkName} href={`/node/${targetId}`} className="link-pill">
                  {linkName}
                </Link>
              ) : (
                <span
                  key={linkName}
                  className="badge opacity-50"
                >
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
              <Link key={child.id} href={`/node/${child.id}`} className="link-pill">
                {child.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <NodeNews nodeId={node.id} />
    </article>
  );
}
