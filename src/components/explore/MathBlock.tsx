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
    <section className="card">
      <div className="flex items-center gap-2 mb-3">
        <Sigma className="w-4 h-4 text-[#7AE2CF]" aria-hidden="true" />
        <h3 className="section-label">{math.title}</h3>
      </div>
      <div
        className="overflow-x-auto mb-4 p-4 rounded-xl"
        style={{
          background: "rgba(6,32,43,0.75)",
          border: "1px solid rgba(122,226,207,0.22)",
        }}
      >
        <BlockMath math={math.formula} />
      </div>
      <p className="text-sm text-[color:var(--color-foreground)]/85 leading-relaxed mb-5">
        {math.summary}
      </p>
      <div className="space-y-2">
        <p className="section-label">Symbols</p>
        <dl className="grid gap-2 mt-2">
          {math.symbols.map((s) => (
            <div key={s.symbol} className="flex gap-3 text-sm">
              <dt
                className="font-mono font-semibold min-w-[3rem]"
                style={{ color: "#FDEB9E" }}
              >
                {s.symbol}
              </dt>
              <dd className="text-[color:var(--color-foreground)]/85">
                {s.meaning}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
