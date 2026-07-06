import { Suspense } from "react";
import { LearnShell } from "@/components/layout/LearnShell";
import { LearnWorkspace } from "@/components/learn/LearnWorkspace";

function LearnFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px] card rounded-xl" role="status">
      <div className="skeleton w-8 h-8 rounded-full" aria-hidden="true" />
      <span className="ml-3 text-sm text-muted-foreground">Loading workspace...</span>
    </div>
  );
}

export default function LearnPage() {
  return (
    <LearnShell>
      <Suspense fallback={<LearnFallback />}>
        <LearnWorkspace initialNodeId="ai" />
      </Suspense>
    </LearnShell>
  );
}
