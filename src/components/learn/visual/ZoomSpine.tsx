"use client";

import { Layers } from "lucide-react";
import { KIND_LABEL, type TaxonomyNode } from "@/data/types";

interface ZoomSpineProps {
  path: TaxonomyNode[];
  onSelectNode: (id: string) => void;
}

export function ZoomSpine({ path, onSelectNode }: ZoomSpineProps) {
  if (path.length <= 1) return null;

  return (
    <section
      className="glass-panel rounded-2xl px-4 py-3 fade-in"
      aria-label="Concept zoom spine"
    >
      <div className="flex items-center gap-2 mb-3">
        <Layers className="w-4 h-4 text-[#7FA3C0]" aria-hidden="true" />
        <p className="section-label">Zoom spine</p>
        <span className="ml-auto text-[11px] text-[color:var(--color-muted-foreground)]">
          Depth {path.length - 1}
        </span>
      </div>

      <ol className="relative flex items-stretch gap-2 overflow-x-auto pb-1">
        <span
          className="absolute left-3 right-3 top-[13px] h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(127,163,192,0.55), transparent)",
          }}
          aria-hidden="true"
        />
        {path.map((node, i) => {
          const isCurrent = i === path.length - 1;
          return (
            <li
              key={node.id}
              className="relative flex-1 min-w-[7rem] flex flex-col items-center gap-1.5"
            >
              <button
                type="button"
                onClick={() => onSelectNode(node.id)}
                aria-current={isCurrent ? "page" : undefined}
                className="relative w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer"
                style={{
                  background: isCurrent
                    ? "#E8D5C4"
                    : "rgba(44,42,43,0.9)",
                  border: `2px solid ${
                    isCurrent
                      ? "#E8D5C4"
                      : "rgba(127,163,192,0.55)"
                  }`,
                  boxShadow: isCurrent
                    ? "0 0 0 4px rgba(232,213,196,0.18), 0 0 12px rgba(232,213,196,0.35)"
                    : "none",
                }}
                aria-label={`Jump to ${node.name}`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: isCurrent ? "#0A0E13" : "#7FA3C0",
                  }}
                  aria-hidden="true"
                />
              </button>
              <span
                className="text-[11px] font-medium text-center leading-tight max-w-[8rem] truncate"
                style={{
                  color: isCurrent
                    ? "#E8D5C4"
                    : "var(--color-muted-foreground)",
                }}
                title={node.name}
              >
                {node.name}
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[color:var(--color-subtle-foreground)]">
                {KIND_LABEL[node.kind]}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
