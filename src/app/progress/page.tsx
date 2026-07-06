import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import { LearnShell } from "@/components/layout/LearnShell";
import { ProgressDashboard } from "@/components/progress/ProgressDashboard";

export const metadata: Metadata = {
  title: "Progress — AI Atlas",
  description: "Learning progress across the AI Atlas taxonomy",
};

export default function ProgressPage() {
  return (
    <LearnShell>
      <div className="mx-auto max-w-5xl px-5 lg:px-8 py-10 space-y-8">
        <header className="space-y-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#7FA3C0]" aria-hidden="true" />
            <p className="eyebrow">Learning tracker</p>
          </div>
          <h1 className="heading-display text-3xl lg:text-4xl font-semibold">
            Your progress
          </h1>
          <p className="text-[color:var(--color-muted-foreground)] max-w-2xl leading-relaxed">
            Every concept you mark as reading, understood, or mastered is saved
            locally. Streak counts consecutive days with at least one update.
          </p>
        </header>
        <ProgressDashboard />
      </div>
    </LearnShell>
  );
}
