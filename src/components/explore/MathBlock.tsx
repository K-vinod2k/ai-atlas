"use client";

import "katex/dist/katex.min.css";
import { BlockMath } from "react-katex";
import { Sigma } from "lucide-react";
import type { NodeMath } from "@/data/types";

interface MathBlockProps {
  math: NodeMath;
}

export function MathBlock({ math }: MathBlockProps) {
  return (
    <section
      className="rounded-xl p-5 lg:p-6"
      style={{
        background: "color-mix(in srgb, var(--color-muted) 60%, var(--color-surface))",
        border: "1px solid color-mix(in srgb, var(--color-border) 40%, transparent)",
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Sigma className="w-4 h-4 text-primary" aria-hidden="true" />
        <h3
          className="text-sm font-semibold text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {math.title}
        </h3>
      </div>
      <div className="overflow-x-auto mb-4 p-3 rounded-lg bg-surface">
        <BlockMath math={math.formula} />
      </div>
      <p className="text-sm text-foreground/80 mb-5">{math.summary}</p>
      <div className="space-y-2">
        <p className="section-label">Symbols</p>
        <dl className="grid gap-2 mt-2">
          {math.symbols.map((s) => (
            <div key={s.symbol} className="flex gap-3 text-sm">
              <dt
                className="font-mono text-primary font-medium min-w-[3rem]"
              >
                {s.symbol}
              </dt>
              <dd className="text-foreground/80">{s.meaning}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
