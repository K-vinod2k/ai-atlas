import type { Metadata } from "next";
import { Suspense } from "react";
import { LearnShell } from "@/components/layout/LearnShell";
import { GraphView } from "@/components/graph/GraphView";
import { graphStats } from "@/lib/kg";

export const metadata: Metadata = {
  title: "Knowledge Graph | AI Atlas",
  description: "Interactive knowledge graph of the AI landscape taxonomy.",
};

function GraphFallback() {
  return (
    <div className="flex items-center justify-center min-h-[480px] card rounded-xl" role="status">
      <div className="skeleton w-8 h-8 rounded-full" aria-hidden="true" />
      <span className="ml-3 text-sm text-[color:var(--color-muted-foreground)]">
        Loading graph...
      </span>
    </div>
  );
}

export default function GraphPage() {
  const stats = graphStats();

  return (
    <LearnShell>
      <div className="mx-auto w-full max-w-[1500px] px-5 lg:px-8 py-6 space-y-5">
        <header className="space-y-2">
          <h1 className="heading-display text-2xl lg:text-3xl font-semibold text-foreground">
            Knowledge Graph
          </h1>
          <p className="text-sm text-[color:var(--color-foreground)]/80 max-w-2xl">
            Every concept in the atlas as a node, every relationship as a typed edge:
            {" "}{stats.nodes} concepts, {stats.triples} relationships. The guide agent
            answers questions by traversing this graph.
          </p>
        </header>
        <Suspense fallback={<GraphFallback />}>
          <GraphView />
        </Suspense>
      </div>
    </LearnShell>
  );
}
