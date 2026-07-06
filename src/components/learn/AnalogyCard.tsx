"use client";

import { Lightbulb } from "lucide-react";

interface AnalogyCardProps {
  analogy: string;
}

export function AnalogyCard({ analogy }: AnalogyCardProps) {
  return (
    <section
      className="rounded-2xl p-5 lg:p-6 fade-in"
      style={{
        background:
          "linear-gradient(135deg, rgba(232,213,196,0.10), rgba(127,163,192,0.06))",
        border: "1px solid rgba(232,213,196,0.35)",
        boxShadow: "0 0 0 1px rgba(232,213,196,0.10) inset",
      }}
      aria-label="Analogy"
    >
      <div className="flex items-start gap-4">
        <div
          className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
          style={{
            background: "rgba(232,213,196,0.16)",
            border: "1px solid rgba(232,213,196,0.45)",
          }}
        >
          <Lightbulb className="w-5 h-5 text-[#E8D5C4]" aria-hidden="true" />
        </div>
        <div>
          <p className="eyebrow mb-2 text-[#E8D5C4]">Think of it like...</p>
          <p className="text-base lg:text-lg text-[color:var(--color-foreground)]/95 leading-relaxed italic">
            {analogy}
          </p>
        </div>
      </div>
    </section>
  );
}
