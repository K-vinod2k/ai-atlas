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
        <Layers className="w-4 h-4 text-[#7AE2CF]" aria-hidden="true" />
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
              "linear-gradient(90deg, transparent, rgba(122,226,207,0.55), transparent)",
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
                    ? "#FDEB9E"
                    : "rgba(11,42,56,0.9)",
                  border: `2px solid ${
                    isCurrent
                      ? "#FDEB9E"
                      : "rgba(122,226,207,0.55)"
                  }`,
                  boxShadow: isCurrent
                    ? "0 0 0 4px rgba(253,235,158,0.18), 0 0 12px rgba(253,235,158,0.35)"
                    : "none",
                }}
                aria-label={`Jump to ${node.name}`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: isCurrent ? "#06202B" : "#7AE2CF",
                  }}
                  aria-hidden="true"
                />
              </button>
              <span
                className="text-[11px] font-medium text-center leading-tight max-w-[8rem] truncate"
                style={{
                  color: isCurrent
                    ? "#FDEB9E"
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
