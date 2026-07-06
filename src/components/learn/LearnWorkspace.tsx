"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BookOpen,
  Layers,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  X,
} from "lucide-react";
import { TreeSidebar } from "@/components/explore/TreeSidebar";
import { ConceptViewer } from "./ConceptViewer";
import { VisualPlayground } from "./visual/VisualPlayground";
import { getNodeById, getPath, taxonomyIndex } from "@/data/taxonomy";
import type { IndexedNode } from "@/data/types";

interface LearnWorkspaceProps {
  initialNodeId: string;
}

type MobileTab = "read" | "visualize";

export function LearnWorkspace({ initialNodeId }: LearnWorkspaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [treeCollapsed, setTreeCollapsed] = useState(false);
  const [mobileTreeOpen, setMobileTreeOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("read");

  const nodeId = searchParams.get("node") ?? initialNodeId;

  const allNodes = useMemo(
    () => Array.from(taxonomyIndex.byId.values()),
    [],
  );

  const roots = useMemo(
    () =>
      (taxonomyIndex.byId.get("ai")?.node.children ?? [])
        .map((c) => taxonomyIndex.byId.get(c.id))
        .filter((x): x is IndexedNode => x !== undefined),
    [],
  );

  const indexed = getNodeById(nodeId);
  const path = getPath(nodeId);

  const selectNode = useCallback(
    (id: string) => {
      setMobileTreeOpen(false);
      router.replace(`/learn?node=${id}`, { scroll: false });
    },
    [router],
  );

  if (!indexed) {
    return (
      <div className="mx-auto max-w-xl mt-16 card text-center" role="alert">
        <p className="heading-display text-lg font-semibold text-foreground">
          Concept not found
        </p>
        <p className="mt-2 text-sm text-[color:var(--color-muted-foreground)]">
          No node with id &quot;{nodeId}&quot; exists in the taxonomy.
        </p>
        <button
          type="button"
          onClick={() => selectNode("ai")}
          className="btn-primary mt-5"
        >
          Go to AI root
        </button>
      </div>
    );
  }

  const treeColumnWidth = treeCollapsed ? "3rem" : "17rem";

  return (
    <div className="relative w-full">
      <div
        className="hidden lg:grid w-full min-h-[calc(100vh-64px)]"
        style={{
          gridTemplateColumns: `${treeColumnWidth} minmax(0,1fr) minmax(0, 50vw)`,
        }}
      >
        <aside
          className="sticky top-16 self-start h-[calc(100vh-64px)] border-r border-[rgba(122,226,207,0.14)] flex flex-col bg-[rgba(6,32,43,0.55)] backdrop-blur-md"
          aria-label="Taxonomy tree"
        >
          {treeCollapsed ? (
            <div className="flex flex-col items-center gap-2 py-3">
              <button
                type="button"
                onClick={() => setTreeCollapsed(false)}
                className="btn-ghost"
                aria-label="Expand taxonomy"
              >
                <PanelLeftOpen className="w-4 h-4" aria-hidden="true" />
              </button>
              <span
                className="text-[10px] uppercase tracking-widest text-[color:var(--color-subtle-foreground)] rotate-180"
                style={{ writingMode: "vertical-rl" }}
              >
                Taxonomy
              </span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[rgba(122,226,207,0.14)]">
                <Layers
                  className="w-4 h-4 text-[#7AE2CF]"
                  aria-hidden="true"
                />
                <span className="section-label">Taxonomy</span>
                <button
                  type="button"
                  onClick={() => setTreeCollapsed(true)}
                  className="btn-ghost ml-auto p-1.5"
                  aria-label="Collapse taxonomy"
                >
                  <PanelLeftClose className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                <TreeSidebar
                  roots={roots}
                  allNodes={allNodes}
                  selectedId={nodeId}
                  onSelectNode={selectNode}
                />
              </div>
            </>
          )}
        </aside>

        <section
          className="min-w-0 border-r border-[rgba(122,226,207,0.14)] px-6 xl:px-10 py-8 overflow-visible"
          aria-label="Concept explanation"
        >
          <div className="max-w-[62ch] mx-auto">
            <ConceptViewer
              node={indexed.node}
              path={path}
              onSelectNode={selectNode}
            />
          </div>
        </section>

        <section
          className="min-w-0 px-5 xl:px-7 py-8"
          aria-label="Visual playground"
        >
          <div className="mb-4 flex items-center gap-2">
            <Sparkles
              className="w-4 h-4 text-[#FDEB9E]"
              aria-hidden="true"
            />
            <p className="eyebrow">Visual playground</p>
            <span className="ml-auto text-[11px] text-[color:var(--color-muted-foreground)]">
              See it. Play with it.
            </span>
          </div>
          <VisualPlayground
            node={indexed.node}
            path={path}
            onSelectNode={selectNode}
          />
        </section>
      </div>

      <div className="lg:hidden">
        <div
          className="sticky top-[57px] z-20 bg-[rgba(6,32,43,0.9)] backdrop-blur-md border-b border-[rgba(122,226,207,0.18)] px-4 py-2 flex items-center gap-2"
        >
          <button
            type="button"
            onClick={() => setMobileTreeOpen(true)}
            className="btn-ghost"
            aria-label="Open taxonomy"
          >
            <Menu className="w-4 h-4" aria-hidden="true" />
            <span>Browse</span>
          </button>
          <div
            className="ml-auto inline-flex rounded-lg p-0.5"
            style={{
              background: "rgba(11,42,56,0.7)",
              border: "1px solid rgba(122,226,207,0.22)",
            }}
            role="tablist"
            aria-label="Content view"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mobileTab === "read"}
              onClick={() => setMobileTab("read")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors duration-200 flex items-center gap-1.5 cursor-pointer ${
                mobileTab === "read"
                  ? "bg-[#077A7D] text-[#FDEB9E]"
                  : "text-[color:var(--color-muted-foreground)]"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
              Explain
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mobileTab === "visualize"}
              onClick={() => setMobileTab("visualize")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors duration-200 flex items-center gap-1.5 cursor-pointer ${
                mobileTab === "visualize"
                  ? "bg-[#077A7D] text-[#FDEB9E]"
                  : "text-[color:var(--color-muted-foreground)]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              Visualize
            </button>
          </div>
        </div>

        <div className="px-4 py-6">
          {mobileTab === "read" ? (
            <ConceptViewer
              node={indexed.node}
              path={path}
              onSelectNode={selectNode}
            />
          ) : (
            <VisualPlayground
              node={indexed.node}
              path={path}
              onSelectNode={selectNode}
            />
          )}
        </div>
      </div>

      {mobileTreeOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
          aria-label="Taxonomy browser"
        >
          <button
            type="button"
            className="absolute inset-0 bg-[#020F15]/70 backdrop-blur-sm cursor-pointer"
            onClick={() => setMobileTreeOpen(false)}
            aria-label="Close taxonomy browser"
          />
          <div className="relative w-[min(320px,85vw)] h-full glass-panel-strong flex flex-col rounded-none">
            <div className="px-4 py-3 border-b border-[rgba(122,226,207,0.22)] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#7AE2CF]" aria-hidden="true" />
              <span className="section-label">Taxonomy</span>
              <button
                type="button"
                onClick={() => setMobileTreeOpen(false)}
                className="btn-ghost ml-auto p-1.5"
                aria-label="Close"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              <TreeSidebar
                roots={roots}
                allNodes={allNodes}
                selectedId={nodeId}
                onSelectNode={selectNode}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
