import Link from "next/link";
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

      <header className="space-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-semibold text-neutral-900">{node.name}</h1>
          <span className="text-xs px-2 py-1 rounded border border-neutral-200 text-neutral-600 bg-white">
            {KIND_LABEL[node.kind]}
          </span>
        </div>
        <p className="text-neutral-700 leading-relaxed">{node.one}</p>
      </header>

      {isNonLayer && (
        <div className="border border-amber-200 bg-amber-50 rounded-lg p-4 text-sm text-amber-900">
          <p className="font-medium">Not a layer</p>
          <p className="mt-1">
            This is a {KIND_LABEL[node.kind].toLowerCase()} — an edge or action that spans
            layers, not a level in the hierarchy.
          </p>
        </div>
      )}

      {node.differs && (
        <div className="border border-neutral-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-neutral-700 mb-1">How it differs</p>
          <p className="text-sm text-neutral-600">{node.differs}</p>
        </div>
      )}

      {node.math && <MathBlock math={node.math} />}

      {node.ex && node.ex.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
            Examples
          </h2>
          <div className="flex flex-wrap gap-2">
            {node.ex.map((e) => (
              <span
                key={e}
                className="text-sm px-3 py-1 rounded-full border border-neutral-200 text-neutral-700 bg-white"
              >
                {e}
              </span>
            ))}
          </div>
        </section>
      )}

      {node.links && node.links.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
            Connects to
          </h2>
          <div className="flex flex-wrap gap-2">
            {node.links.map((linkName) => {
              const targetId = getNodeIdByName(linkName);
              return targetId ? (
                <Link
                  key={linkName}
                  href={`/node/${targetId}`}
                  className="text-sm px-3 py-1 rounded-full border border-neutral-300 text-neutral-800 bg-white hover:bg-neutral-50"
                >
                  {linkName}
                </Link>
              ) : (
                <span
                  key={linkName}
                  className="text-sm px-3 py-1 rounded-full border border-neutral-200 text-neutral-400"
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
          <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
            Breaks down into
          </h2>
          <div className="flex flex-wrap gap-2">
            {node.children.map((child) => (
              <Link
                key={child.id}
                href={`/node/${child.id}`}
                className="text-sm px-3 py-1 rounded-full border border-neutral-200 text-neutral-700 bg-white hover:bg-neutral-50"
              >
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
