import { AppShell } from "@/components/layout/AppShell";
import { TreeSidebar } from "@/components/explore/TreeSidebar";
import { NodeDetail } from "@/components/explore/NodeDetail";
import { taxonomyIndex, getNodeById, getPath } from "@/data/taxonomy";

export default function ExplorePage() {
  const allNodes = Array.from(taxonomyIndex.byId.values());
  const roots = (taxonomyIndex.byId.get("ai")?.node.children ?? [])
    .map((c) => taxonomyIndex.byId.get(c.id))
    .filter((x) => x !== undefined);

  const defaultNode = getNodeById("ai")!;
  const path = getPath("ai");

  return (
    <AppShell>
      <div
        className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-0 rounded-xl bg-surface overflow-hidden min-h-[600px] shadow-md border"
        style={{ borderColor: "color-mix(in srgb, var(--color-border) 40%, transparent)" }}
      >
        <div
          className="border-r md:max-h-[calc(100vh-10rem)] md:overflow-hidden"
          style={{ borderColor: "color-mix(in srgb, var(--color-border) 40%, transparent)" }}
        >
          <TreeSidebar
            roots={roots}
            allNodes={allNodes}
            selectedId="ai"
          />
        </div>
        <div className="p-6 lg:p-8 overflow-y-auto pb-24 lg:pb-8">
          <NodeDetail node={defaultNode.node} path={path} />
        </div>
      </div>
    </AppShell>
  );
}
