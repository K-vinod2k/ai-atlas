"use client";

import { useEffect, useState } from "react";
import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceX,
  forceY,
  forceSimulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force";
import { taxonomyIndex } from "@/data/taxonomy";
import { GRAPH, type Predicate } from "@/lib/kg";
import type { NodeKind } from "@/data/types";

export interface GraphViewNode extends SimulationNodeDatum {
  id: string;
  name: string;
  one: string;
  kind: NodeKind;
  branchId: string;
  depth: number;
  radius: number;
}

export interface GraphViewLink extends SimulationLinkDatum<GraphViewNode> {
  predicate: Predicate;
  sourceId: string;
  targetId: string;
}

export interface GraphLayout {
  nodes: GraphViewNode[];
  links: GraphViewLink[];
}

export const VIEW_WIDTH = 1400;
export const VIEW_HEIGHT = 940;

/** Node-to-node edges drawn in the view (child_of mirrors parent_of, so it is skipped). */
const VIEW_PREDICATES: Predicate[] = [
  "parent_of",
  "connects_to",
  "differs_from",
  "related_to",
];

function radiusFor(depth: number): number {
  if (depth === 0) return 18;
  if (depth === 1) return 12;
  if (depth === 2) return 8;
  return 5.5;
}

function buildLayout(): GraphLayout {
  const nodes: GraphViewNode[] = [];
  for (const indexed of taxonomyIndex.byId.values()) {
    nodes.push({
      id: indexed.node.id,
      name: indexed.node.name,
      one: indexed.node.one,
      kind: indexed.node.kind,
      branchId: indexed.branchId,
      depth: indexed.depth,
      radius: radiusFor(indexed.depth),
    });
  }

  const links: GraphViewLink[] = [];
  for (const predicate of VIEW_PREDICATES) {
    for (const t of GRAPH.byPredicate.get(predicate) ?? []) {
      if (t.subjectType !== "node" || t.objectType !== "node") continue;
      links.push({
        predicate,
        sourceId: t.subject,
        targetId: t.object,
        source: t.subject,
        target: t.object,
      });
    }
  }

  // Layout is driven by the hierarchy plus explicit cross-links; related_to
  // edges are display-only so toggling filters never reshuffles positions.
  const layoutLinks = links.filter((l) => l.predicate !== "related_to");

  const simulation = forceSimulation<GraphViewNode>(nodes)
    .force(
      "link",
      forceLink<GraphViewNode, GraphViewLink>(layoutLinks)
        .id((n) => n.id)
        .distance((l) => (l.predicate === "parent_of" ? 34 : 90))
        .strength((l) => (l.predicate === "parent_of" ? 0.7 : 0.15)),
    )
    .force("charge", forceManyBody<GraphViewNode>().strength(-120))
    .force("collide", forceCollide<GraphViewNode>((n) => n.radius + 4))
    .force("x", forceX<GraphViewNode>(VIEW_WIDTH / 2).strength(0.045))
    .force("y", forceY<GraphViewNode>(VIEW_HEIGHT / 2).strength(0.06))
    .stop();

  for (let i = 0; i < 320; i += 1) simulation.tick();

  return { nodes, links };
}

interface LayoutState {
  layout: GraphLayout | null;
  error: string | null;
}

/** Computes the force layout once on the client; deterministic graph, no fetch. */
export function useGraphLayout(): LayoutState & { loading: boolean } {
  const [state, setState] = useState<LayoutState>({ layout: null, error: null });

  useEffect(() => {
    let cancelled = false;
    // Defer a frame so the loading skeleton paints before the sim runs.
    const id = window.setTimeout(() => {
      try {
        const layout = buildLayout();
        if (!cancelled) setState({ layout, error: null });
      } catch (e) {
        if (!cancelled) {
          setState({
            layout: null,
            error: e instanceof Error ? e.message : "Failed to build the graph layout.",
          });
        }
      }
    }, 30);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, []);

  return { ...state, loading: state.layout === null && state.error === null };
}
