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
    <section className="card" aria-label="Step-by-step walkthrough">
      <div className="flex items-center gap-2 mb-5">
        <ListOrdered
          className="w-4 h-4 text-[#7FA3C0]"
          aria-hidden="true"
        />
        <h3 className="section-label">Step-by-step walkthrough</h3>
      </div>

      <ol className="space-y-6 relative">
        <span
          className="absolute left-4 top-2 bottom-2 w-px"
          style={{
            background:
              "linear-gradient(180deg, rgba(127,163,192,0.5), rgba(127,163,192,0.05))",
          }}
          aria-hidden="true"
        />

        {sorted.map((step) => (
          <li key={step.step} className="relative flex gap-4">
            <span
              className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
              style={{
                background: "rgba(57,75,90,0.4)",
                color: "#E8D5C4",
                border: "1px solid rgba(232,213,196,0.5)",
                boxShadow: "0 0 0 3px rgba(10,14,19,1)",
              }}
              aria-hidden="true"
            >
              {step.step}
            </span>
            <div className="flex-1 min-w-0 pt-0.5">
              <h4 className="heading-display text-base font-semibold text-foreground mb-1.5">
                {step.title}
              </h4>
              <p className="text-sm text-[color:var(--color-foreground)]/85 leading-relaxed">
                {step.body}
              </p>
              {step.formula && (
                <div
                  className="mt-3 overflow-x-auto p-3 rounded-lg"
                  style={{
                    background: "rgba(10,14,19,0.6)",
                    border: "1px solid rgba(127,163,192,0.2)",
                  }}
                >
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
