"use client";

import "katex/dist/katex.min.css";
import { ListOrdered } from "lucide-react";
import { BlockMath } from "react-katex";
import type { WalkthroughStep } from "@/data/types";

interface WalkthroughStepsProps {
  steps: WalkthroughStep[];
}

export function WalkthroughSteps({ steps }: WalkthroughStepsProps) {
  const sorted = [...steps].sort((a, b) => a.step - b.step);

  return (
    <section
      className="rounded-xl p-5 lg:p-6"
      style={{
        background: "var(--color-surface)",
        border: "1px solid color-mix(in srgb, var(--color-border) 40%, transparent)",
      }}
      aria-label="Step-by-step walkthrough"
    >
      <div className="flex items-center gap-2 mb-5">
        <ListOrdered className="w-4 h-4 text-primary" aria-hidden="true" />
        <h3
          className="text-sm font-semibold text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Step-by-step walkthrough
        </h3>
      </div>

      <ol className="space-y-5">
        {sorted.map((step) => (
          <li key={step.step} className="flex gap-4">
            <span
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
              style={{
                background: "color-mix(in srgb, var(--color-primary) 15%, var(--color-surface))",
                color: "var(--color-primary)",
                border: "1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)",
              }}
              aria-hidden="true"
            >
              {step.step}
            </span>
            <div className="flex-1 min-w-0 pt-0.5">
              <h4
                className="text-base font-semibold text-foreground mb-1"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {step.title}
              </h4>
              <p className="text-sm text-foreground/80 leading-relaxed">{step.body}</p>
              {step.formula && (
                <div className="mt-3 overflow-x-auto p-3 rounded-lg bg-muted/40">
                  <BlockMath math={step.formula} />
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
