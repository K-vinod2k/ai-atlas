"use client";

import { useCallback, useEffect, useRef } from "react";
import { DEFAULT_SIM_CONFIG, seedPositions, simStep } from "@/lib/graph/layout";
import type { SimLink, SimNode } from "@/lib/graph/layout";
import type { GraphView, ViewNode } from "@/lib/graph/view-model";

const WORLD_W = 1600;
const WORLD_H = 1100;

const EDGE_STYLE = {
  hierarchy: { dash: [] as number[], color: "rgba(127,163,192,0.30)", width: 1.1 },
  association: { dash: [6, 4], color: "rgba(200,168,142,0.42)", width: 1.1 },
  differs: { dash: [2, 4], color: "rgba(224,137,122,0.45)", width: 1.1 },
  related: { dash: [1, 5] as number[], color: "rgba(148,180,164,0.22)", width: 0.8 },
} as const;

const HIGHLIGHT_EDGE = "rgba(232,213,196,0.95)";

interface GraphCanvasProps {
  view: GraphView;
  selectedId: string | null;
  hoverLabels?: boolean;
  /** Node ids + "a|b" edge keys to highlight (shortest path). */
  pathNodeIds?: Set<string>;
  pathEdgeKeys?: Set<string>;
  onSelect: (id: string | null) => void;
}

interface Camera {
  x: number;
  y: number;
  scale: number;
}

export function GraphCanvas({
  view,
  selectedId,
  pathNodeIds,
  pathEdgeKeys,
  onSelect,
}: GraphCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const nodesRef = useRef<SimNode[]>([]);
  const viewNodesRef = useRef<ViewNode[]>([]);
  const linksRef = useRef<SimLink[]>([]);
  const indexByIdRef = useRef<Map<string, number>>(new Map());
  const positionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const alphaRef = useRef(1);
  const cameraRef = useRef<Camera>({ x: 0, y: 0, scale: 1 });
  const hoverRef = useRef<string | null>(null);
  const dragRef = useRef<{ nodeIndex: number } | { pan: { x: number; y: number } } | null>(null);
  const frameRef = useRef<number>(0);
  const selectedRef = useRef<string | null>(selectedId);
  const pathRef = useRef<{ nodes?: Set<string>; edges?: Set<string> }>({});

  selectedRef.current = selectedId;
  pathRef.current = { nodes: pathNodeIds, edges: pathEdgeKeys };

  // Rebuild sim state when the filtered view changes; keep prior positions.
  useEffect(() => {
    const seeds = seedPositions(view.nodes.length, WORLD_W, WORLD_H);
    const indexById = new Map<string, number>();
    const nodes: SimNode[] = view.nodes.map((n, i) => {
      const prev = positionsRef.current.get(n.id);
      indexById.set(n.id, i);
      return {
        id: n.id,
        x: prev?.x ?? seeds[i].x,
        y: prev?.y ?? seeds[i].y,
        vx: 0,
        vy: 0,
        r: n.radius,
      };
    });
    const links: SimLink[] = [];
    for (const e of view.edges) {
      const s = indexById.get(e.source);
      const t = indexById.get(e.target);
      if (s === undefined || t === undefined) continue;
      const hierarchy = e.group === "hierarchy";
      links.push({
        source: s,
        target: t,
        distance: hierarchy ? 58 : 120,
        strength: hierarchy ? 0.12 : 0.02,
      });
    }
    nodesRef.current = nodes;
    viewNodesRef.current = view.nodes;
    linksRef.current = links;
    indexByIdRef.current = indexById;
    alphaRef.current = 1;
  }, [view]);

  const toWorld = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const cam = cameraRef.current;
    return {
      x: (clientX - rect.left - rect.width / 2) / cam.scale + WORLD_W / 2 + cam.x,
      y: (clientY - rect.top - rect.height / 2) / cam.scale + WORLD_H / 2 + cam.y,
    };
  }, []);

  const hitTest = useCallback(
    (clientX: number, clientY: number): number => {
      const p = toWorld(clientX, clientY);
      const nodes = nodesRef.current;
      for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i];
        const dx = p.x - n.x;
        const dy = p.y - n.y;
        if (dx * dx + dy * dy <= (n.r + 4) * (n.r + 4)) return i;
      }
      return -1;
    },
    [toWorld],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const config = { ...DEFAULT_SIM_CONFIG, width: WORLD_W, height: WORLD_H };

    const draw = () => {
      const nodes = nodesRef.current;
      const viewNodes = viewNodesRef.current;
      const links = linksRef.current;

      if (alphaRef.current > 0.006) {
        // Two sim steps per frame converges the layout in a few seconds.
        simStep(nodes, links, alphaRef.current, config);
        simStep(nodes, links, alphaRef.current, config);
        alphaRef.current *= 0.978;
        for (const n of nodes) positionsRef.current.set(n.id, { x: n.x, y: n.y });
      }

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== Math.round(rect.width * dpr)) {
        canvas.width = Math.round(rect.width * dpr);
        canvas.height = Math.round(rect.height * dpr);
      }
      const cam = cameraRef.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.save();
      ctx.translate(rect.width / 2, rect.height / 2);
      ctx.scale(cam.scale, cam.scale);
      ctx.translate(-WORLD_W / 2 - cam.x, -WORLD_H / 2 - cam.y);

      const highlightNodes = pathRef.current.nodes;
      const highlightEdges = pathRef.current.edges;
      const selected = selectedRef.current;
      const hovered = hoverRef.current;

      // Edges
      for (let i = 0; i < view.edges.length; i++) {
        const e = view.edges[i];
        const s = nodes[indexByIdRef.current.get(e.source) ?? -1];
        const t = nodes[indexByIdRef.current.get(e.target) ?? -1];
        if (!s || !t) continue;
        const onPath =
          highlightEdges?.has(`${e.source}|${e.target}`) ||
          highlightEdges?.has(`${e.target}|${e.source}`);
        const touchesSelected = selected !== null && (e.source === selected || e.target === selected);
        const style = EDGE_STYLE[e.group];
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.setLineDash(style.dash);
        ctx.strokeStyle = onPath ? HIGHLIGHT_EDGE : touchesSelected ? "rgba(167,196,219,0.8)" : style.color;
        ctx.lineWidth = onPath ? 2.4 : touchesSelected ? 1.8 : style.width;
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const vn = viewNodes[i];
        const isSelected = vn.id === selected;
        const isHovered = vn.id === hovered;
        const onPath = highlightNodes?.has(vn.id) ?? false;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = vn.color + (isSelected || onPath ? "F0" : "99");
        ctx.fill();
        if (isSelected || onPath || isHovered) {
          ctx.strokeStyle = isSelected ? "#E8D5C4" : onPath ? HIGHLIGHT_EDGE : "#A7C4DB";
          ctx.lineWidth = isSelected ? 2.5 : 1.8;
          ctx.stroke();
        }
        const showLabel =
          isSelected || isHovered || onPath || vn.degree >= 6 || cam.scale > 1.7;
        if (showLabel) {
          ctx.font = `${isSelected ? 700 : 500} ${Math.max(11 / cam.scale, 7)}px "Source Sans 3", sans-serif`;
          ctx.fillStyle = isSelected || onPath ? "#F2E4D8" : "rgba(242,239,236,0.82)";
          ctx.textAlign = "center";
          ctx.fillText(vn.name, n.x, n.y - n.r - 5 / cam.scale);
        }
      }
      ctx.restore();

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [view]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      const hit = hitTest(e.clientX, e.clientY);
      if (hit >= 0) {
        dragRef.current = { nodeIndex: hit };
        nodesRef.current[hit].fixed = true;
      } else {
        dragRef.current = { pan: { x: e.clientX, y: e.clientY } };
      }
    },
    [hitTest],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const drag = dragRef.current;
      if (drag && "nodeIndex" in drag) {
        const p = toWorld(e.clientX, e.clientY);
        const node = nodesRef.current[drag.nodeIndex];
        node.x = p.x;
        node.y = p.y;
        alphaRef.current = Math.max(alphaRef.current, 0.25);
        return;
      }
      if (drag && "pan" in drag) {
        const cam = cameraRef.current;
        cam.x -= (e.clientX - drag.pan.x) / cam.scale;
        cam.y -= (e.clientY - drag.pan.y) / cam.scale;
        drag.pan = { x: e.clientX, y: e.clientY };
        return;
      }
      const hit = hitTest(e.clientX, e.clientY);
      hoverRef.current = hit >= 0 ? viewNodesRef.current[hit].id : null;
      e.currentTarget.style.cursor = hit >= 0 ? "pointer" : "grab";
    },
    [hitTest, toWorld],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const drag = dragRef.current;
      dragRef.current = null;
      if (drag && "nodeIndex" in drag) {
        const node = nodesRef.current[drag.nodeIndex];
        node.fixed = false;
        onSelect(viewNodesRef.current[drag.nodeIndex].id);
        return;
      }
      // Background click without pan = deselect.
      if (drag && "pan" in drag) {
        const hit = hitTest(e.clientX, e.clientY);
        if (hit < 0) onSelect(null);
      }
    },
    [hitTest, onSelect],
  );

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    const cam = cameraRef.current;
    const next = Math.min(Math.max(cam.scale * (e.deltaY < 0 ? 1.12 : 0.89), 0.35), 4);
    cam.scale = next;
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full touch-none"
      role="application"
      aria-label="Knowledge graph canvas. Click a node to inspect it."
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
    />
  );
}
