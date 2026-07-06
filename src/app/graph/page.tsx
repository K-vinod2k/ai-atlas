import type { Metadata } from "next";
import { Suspense } from "react";
import { LearnShell } from "@/components/layout/LearnShell";
import { GraphExplorer } from "@/components/graph/GraphExplorer";
import { getNodeById } from "@/data/taxonomy";

export const metadata: Metadata = {
  title: "Knowledge Graph | AI Atlas",
  description:
    "Interactive knowledge graph of the AI landscape: every concept as a node, every relationship as a typed edge.",
};

interface GraphPageProps {
  searchParams: Promise<{ node?: string }>;
}

export default async function GraphPage({ searchParams }: GraphPageProps) {
  const { node } = await searchParams;
  const initialNodeId = node && getNodeById(node) ? node : undefined;

  return (
    <Suspense>
      <LearnShell>
        <GraphExplorer initialNodeId={initialNodeId} />
      </LearnShell>
    </Suspense>
  );
}
