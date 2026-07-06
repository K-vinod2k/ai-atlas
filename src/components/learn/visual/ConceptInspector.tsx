"use client";

import { useState } from "react";
import { ChevronRight, KeyRound } from "lucide-react";
import { getNodeById, getNodeIdByName } from "@/data/taxonomy";
import type { MathSymbol, TaxonomyNode } from "@/data/types";

interface ConceptInspectorProps {
  node: TaxonomyNode;
  onSelectNode: (id: string) => void;
}

interface InspectorItem {
  key: string;
  label: string;
  hint: string;
  body: string;
  action?: { id: string; label: string };
  kind: "symbol" | "link" | "example";
}

function buildItems(node: TaxonomyNode): InspectorItem[] {
  const items: InspectorItem[] = [];

  const symbols: MathSymbol[] = node.math?.symbols ?? [];
  for (const s of symbols) {
    items.push({
      key: `sym-${s.symbol}`,
      label: s.symbol,
      hint: "Math symbol",
      body: s.meaning,
      kind: "symbol",
    });
  }

  const linkNames = node.links ?? [];
  for (const name of linkNames) {
    const id = getNodeIdByName(name);
    const target = id ? getNodeById(id)?.node : undefined;
    items.push({
      key: `link-${name}`,
      label: name,
      hint: target ? "Related concept" : "Referenced term",
      body:
        target?.one ??
        `${name} is referenced by this concept — no dedicated entry yet in the atlas.`,
      action: target ? { id: target.id, label: "Open concept" } : undefined,
      kind: "link",
    });
  }

  const examples = node.ex ?? [];
  for (const ex of examples.slice(0, 6)) {
    items.push({
      key: `ex-${ex}`,
      label: ex,
      hint: "Real-world example",
      body: `${ex} is a concrete instance of ${node.name}.`,
      kind: "example",
    });
  }

  return items;
}

export function ConceptInspector({ node, onSelectNode }: ConceptInspectorProps) {
  const items = buildItems(node);
  const [openKey, setOpenKey] = useState<string | null>(items[0]?.key ?? null);

  if (items.length === 0) return null;

  const toggle = (key: string) =>
    setOpenKey((current) => (current === key ? null : key));

  return (
    <section
      className="glass-panel rounded-2xl overflow-hidden fade-in"
      aria-label="Key concepts inspector"
    >
      <header
        className="flex items-center gap-2 px-4 py-3 border-b"
        style={{ borderColor: "rgba(122,226,207,0.18)" }}
      >
        <KeyRound className="w-4 h-4 text-[#7AE2CF]" aria-hidden="true" />
        <p className="section-label">Key concepts</p>
        <span className="ml-auto text-[11px] text-[color:var(--color-muted-foreground)]">
          {items.length} terms
        </span>
      </header>

      <ul className="divide-y" style={{ borderColor: "rgba(122,226,207,0.12)" }}>
        {items.map((item) => {
          const isOpen = openKey === item.key;
          return (
            <li key={item.key} className="border-t border-[rgba(122,226,207,0.10)] first:border-t-0">
              <button
                type="button"
                onClick={() => toggle(item.key)}
                aria-expanded={isOpen}
                className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer transition-colors duration-200 hover:bg-[rgba(122,226,207,0.06)]"
              >
                <ChevronRight
                  className="w-4 h-4 shrink-0 transition-transform duration-200"
                  style={{
                    color: isOpen ? "#FDEB9E" : "rgba(122,226,207,0.6)",
                    transform: isOpen ? "rotate(90deg)" : "none",
                  }}
                  aria-hidden="true"
                />
                <span
                  className="flex-1 min-w-0 truncate text-sm font-medium"
                  style={{
                    color: isOpen ? "#FDEB9E" : "var(--color-foreground)",
                    fontFamily:
                      item.kind === "symbol"
                        ? "ui-monospace, SFMono-Regular, monospace"
                        : undefined,
                  }}
                >
                  {item.label}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[color:var(--color-subtle-foreground)]">
                  {item.hint}
                </span>
              </button>
              {isOpen && (
                <div
                  className="px-11 pb-4 pt-1 space-y-3 fade-in"
                  role="region"
                >
                  <p className="text-sm text-[color:var(--color-foreground)]/85 leading-relaxed">
                    {item.body}
                  </p>
                  {item.action && (
                    <button
                      type="button"
                      onClick={() => onSelectNode(item.action!.id)}
                      className="btn-secondary py-1.5 px-3 text-xs"
                    >
                      {item.action.label}
                    </button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
