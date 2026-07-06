"use client";

import { ArrowRight, GitBranch } from "lucide-react";
import type { DataFlowEdge } from "@/data/types";

interface DataFlowPanelProps {
  edges: DataFlowEdge[];
}

export function DataFlowPanel({ edges }: DataFlowPanelProps) {
  if (edges.length === 0) return null;

  return (
    <section
      className="rounded-xl p-5 lg:p-6"
      style={{
        background: "color-mix(in srgb, var(--color-primary) 6%, var(--color-surface))",
        border: "1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)",
      }}
      aria-label="Data flow"
    >
      <div className="flex items-center gap-2 mb-4">
        <GitBranch className="w-4 h-4 text-primary" aria-hidden="true" />
        <h3
          className="text-sm font-semibold text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Data flow
        </h3>
      </div>

      <div className="flex flex-col gap-3">
        {edges.map((edge, i) => (
          <div
            key={`${edge.from}-${edge.to}-${i}`}
            className="flow-step flex flex-wrap items-center gap-2 text-sm"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <span
              className="px-3 py-1.5 rounded-lg font-medium"
              style={{
                background: "var(--color-surface)",
                border: "1px solid color-mix(in srgb, var(--color-border) 50%, transparent)",
                color: "var(--color-foreground)",
              }}
            >
              {edge.from}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground px-1">
              <ArrowRight className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
              <span className="italic">{edge.label}</span>
            </span>
            <span
              className="px-3 py-1.5 rounded-lg font-medium"
              style={{
                background: "color-mix(in srgb, var(--color-primary) 12%, var(--color-surface))",
                border: "1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)",
                color: "var(--color-primary)",
              }}
            >
              {edge.to}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
