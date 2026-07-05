"use client";

import "katex/dist/katex.min.css";
import { BlockMath } from "react-katex";
import type { NodeMath } from "@/data/types";

interface MathBlockProps {
  math: NodeMath;
}

export function MathBlock({ math }: MathBlockProps) {
  return (
    <section className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
      <h3 className="text-sm font-semibold text-neutral-700 mb-2">{math.title}</h3>
      <div className="overflow-x-auto mb-3">
        <BlockMath math={math.formula} />
      </div>
      <p className="text-sm text-neutral-600 mb-4">{math.summary}</p>
      <div className="space-y-2">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
          Symbols
        </p>
        <dl className="grid gap-2">
          {math.symbols.map((s) => (
            <div key={s.symbol} className="flex gap-3 text-sm">
              <dt className="font-mono text-neutral-800 min-w-[3rem]">{s.symbol}</dt>
              <dd className="text-neutral-600">{s.meaning}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
