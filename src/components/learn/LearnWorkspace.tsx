"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { TreeSidebar } from "@/components/explore/TreeSidebar";
import { ChatPanel } from "@/components/agent/ChatPanel";
import { ConceptViewer } from "./ConceptViewer";
import { ConnectionMap } from "./ConnectionMap";
import { getNodeById, getPath, taxonomyIndex } from "@/data/taxonomy";
import type { IndexedNode } from "@/data/types";

interface LearnWorkspaceProps {
  initialNodeId: string;
}

export function LearnWorkspace({ initialNodeId }: LearnWorkspaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileTreeOpen, setMobileTreeOpen] = useState(false);

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
      <div
        className="rounded-xl p-8 text-center card"
        role="alert"
      >
        <p className="text-lg font-semibold text-foreground">Concept not found</p>
        <p className="mt-2 text-sm text-muted-foreground">
          No node with id &quot;{nodeId}&quot; exists in the taxonomy.
        </p>
        <button type="button" onClick={() => selectNode("ai")} className="btn-primary mt-4">
          Go to AI root
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col rounded-xl bg-surface overflow-hidden shadow-md border min-h-[calc(100vh-8rem)]"
      style={{ borderColor: "color-mix(in srgb, var(--color-border) 40%, transparent)" }}
    >
      <div
        className={`grid flex-1 min-h-0 ${
          sidebarCollapsed
            ? "grid-cols-1 lg:grid-cols-[1fr_320px]"
            : "grid-cols-1 lg:grid-cols-[280px_1fr_320px]"
        }`}
      >
        {!sidebarCollapsed && (
          <div
            className="hidden lg:flex flex-col border-r min-h-0 max-h-[calc(100vh-8rem)]"
            style={{ borderColor: "color-mix(in srgb, var(--color-border) 40%, transparent)" }}
          >
            <div
              className="px-3 py-2 border-b flex items-center justify-between"
              style={{ borderColor: "color-mix(in srgb, var(--color-border) 40%, transparent)" }}
            >
              <span className="section-label">Taxonomy</span>
              <button
                type="button"
                onClick={() => setSidebarCollapsed(true)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 cursor-pointer transition-colors"
                aria-label="Collapse taxonomy panel"
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
          </div>
        )}

        <div className="flex flex-col min-h-0 min-w-0">
          {sidebarCollapsed && (
            <div className="hidden lg:flex px-4 py-2 border-b items-center gap-2">
              <button
                type="button"
                onClick={() => setSidebarCollapsed(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 cursor-pointer transition-colors"
                aria-label="Expand taxonomy panel"
              >
                <PanelLeftOpen className="w-4 h-4" aria-hidden="true" />
              </button>
              <span className="text-sm text-muted-foreground">Taxonomy hidden</span>
            </div>
          )}

          <div className="lg:hidden px-4 py-2 border-b flex items-center justify-between">
            <button
              type="button"
              onClick={() => setMobileTreeOpen(true)}
              className="nav-link"
              aria-label="Open taxonomy browser"
            >
              <Menu className="w-4 h-4" aria-hidden="true" />
              Browse taxonomy
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 lg:p-8 pb-28 lg:pb-8">
            <ConceptViewer
              node={indexed.node}
              path={path}
              onSelectNode={selectNode}
            />
          </div>

          <div
            className="border-t px-4 py-3 hidden lg:block shrink-0"
            style={{ borderColor: "color-mix(in srgb, var(--color-border) 40%, transparent)" }}
          >
            <ConnectionMap node={indexed.node} onSelectNode={selectNode} />
          </div>
        </div>

        <div
          className="hidden lg:flex flex-col border-l min-h-0 max-h-[calc(100vh-8rem)]"
          style={{ borderColor: "color-mix(in srgb, var(--color-border) 40%, transparent)" }}
        >
          <div className="flex-1 min-h-0 p-3 overflow-hidden">
            <ChatPanel onNavigate={selectNode} />
          </div>
        </div>
      </div>

      <div
        className="lg:hidden border-t p-3 space-y-3 shrink-0"
        style={{ borderColor: "color-mix(in srgb, var(--color-border) 40%, transparent)" }}
      >
        <ConnectionMap node={indexed.node} onSelectNode={selectNode} />
      </div>

      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-surface border-t z-40"
        style={{ borderColor: "color-mix(in srgb, var(--color-border) 40%, transparent)" }}
      >
        <ChatPanel compact onNavigate={selectNode} />
      </div>

      {mobileTreeOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="Taxonomy browser">
          <button
            type="button"
            className="absolute inset-0 bg-foreground/20 cursor-pointer"
            onClick={() => setMobileTreeOpen(false)}
            aria-label="Close taxonomy browser"
          />
          <div
            className="relative w-[min(320px,85vw)] h-full bg-surface shadow-xl flex flex-col"
            style={{ borderRight: "1px solid color-mix(in srgb, var(--color-border) 40%, transparent)" }}
          >
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <span className="section-label">Taxonomy</span>
              <button
                type="button"
                onClick={() => setMobileTreeOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-primary cursor-pointer"
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
