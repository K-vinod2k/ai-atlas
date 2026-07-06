"use client";

import { Lightbulb } from "lucide-react";

interface AnalogyCardProps {
  analogy: string;
}

export function AnalogyCard({ analogy }: AnalogyCardProps) {
  return (
    <section
      className="rounded-xl p-5 lg:p-6"
      style={{
        background: "color-mix(in srgb, var(--color-accent) 8%, var(--color-surface))",
        border: "1px solid color-mix(in srgb, var(--color-accent) 25%, transparent)",
      }}
      aria-label="Analogy"
    >
      <div className="flex items-start gap-3">
        <div
          className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
          style={{
            background: "color-mix(in srgb, var(--color-accent) 15%, var(--color-surface))",
          }}
        >
          <Lightbulb className="w-5 h-5 text-accent" aria-hidden="true" />
        </div>
        <div>
          <p className="section-label mb-2">Think of it like...</p>
          <p className="text-base text-foreground/90 leading-relaxed italic">{analogy}</p>
        </div>
      </div>
    </section>
  );
}
