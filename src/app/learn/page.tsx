import { Suspense } from "react";
import { LearnShell } from "@/components/layout/LearnShell";
import { LearnWorkspace } from "@/components/learn/LearnWorkspace";
import { getNodeById } from "@/data/taxonomy";

function LearnFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px] card rounded-xl" role="status">
      <div className="skeleton w-8 h-8 rounded-full" aria-hidden="true" />
      <span className="ml-3 text-sm text-muted-foreground">Loading workspace...</span>
    </div>
  );
}

interface LearnPageProps {
  searchParams: Promise<{ node?: string }>;
}

export default async function LearnPage({ searchParams }: LearnPageProps) {
  const { node } = await searchParams;
  const initialNodeId = node && getNodeById(node) ? node : "ai";

  return (
    <Suspense
      fallback={
        <LearnShell>
          <LearnFallback />
        </LearnShell>
      }
    >
      <LearnShell>
        <LearnWorkspace initialNodeId={initialNodeId} />
      </LearnShell>
    </Suspense>
  );
}
