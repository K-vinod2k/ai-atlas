/**
 * Minimal force-directed layout for the knowledge graph.
 * Hand-rolled instead of d3-force to keep dependencies unchanged; 221 nodes
 * is well within O(n^2) repulsion budget at ~60 ticks/second.
 */

export interface SimNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Visual + collision radius. */
  r: number;
  /** Pinned by drag: skip force integration. */
  fixed?: boolean;
}

export interface SimLink {
  source: number;
  target: number;
  /** Rest length of the spring. */
  distance: number;
  strength: number;
}

export interface SimConfig {
  width: number;
  height: number;
  repulsion: number;
  centerPull: number;
  velocityDecay: number;
}

export const DEFAULT_SIM_CONFIG: SimConfig = {
  width: 1200,
  height: 800,
  repulsion: 1400,
  centerPull: 0.012,
  velocityDecay: 0.82,
};

/** One integration step. `alpha` in (0, 1] scales all forces; returns nothing, mutates nodes. */
export function simStep(
  nodes: SimNode[],
  links: SimLink[],
  alpha: number,
  config: SimConfig = DEFAULT_SIM_CONFIG,
): void {
  const { width, height, repulsion, centerPull, velocityDecay } = config;
  const cx = width / 2;
  const cy = height / 2;
  const n = nodes.length;

  // Pairwise repulsion (softened inverse-square).
  for (let i = 0; i < n; i++) {
    const a = nodes[i];
    for (let j = i + 1; j < n; j++) {
      const b = nodes[j];
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      let d2 = dx * dx + dy * dy;
      if (d2 === 0) {
        dx = (Math.random() - 0.5) * 0.1;
        dy = (Math.random() - 0.5) * 0.1;
        d2 = dx * dx + dy * dy;
      }
      const minD = a.r + b.r + 6;
      const clamped = Math.max(d2, 64);
      let force = (repulsion * alpha) / clamped;
      // Hard-ish collision boost when overlapping.
      if (d2 < minD * minD) force *= 2.5;
      const d = Math.sqrt(d2);
      const fx = (dx / d) * force;
      const fy = (dy / d) * force;
      a.vx -= fx;
      a.vy -= fy;
      b.vx += fx;
      b.vy += fy;
    }
  }

  // Link springs.
  for (const link of links) {
    const a = nodes[link.source];
    const b = nodes[link.target];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const d = Math.sqrt(dx * dx + dy * dy) || 1;
    const stretch = ((d - link.distance) / d) * link.strength * alpha;
    const fx = dx * stretch;
    const fy = dy * stretch;
    a.vx += fx;
    a.vy += fy;
    b.vx -= fx;
    b.vy -= fy;
  }

  // Centering + integration.
  for (const node of nodes) {
    if (node.fixed) {
      node.vx = 0;
      node.vy = 0;
      continue;
    }
    node.vx += (cx - node.x) * centerPull * alpha;
    node.vy += (cy - node.y) * centerPull * alpha;
    node.vx *= velocityDecay;
    node.vy *= velocityDecay;
    node.x += node.vx;
    node.y += node.vy;
  }
}

/** Deterministic-ish initial placement: spiral seeded by index. */
export function seedPositions(
  count: number,
  width: number,
  height: number,
): Array<{ x: number; y: number }> {
  const positions: Array<{ x: number; y: number }> = [];
  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.min(width, height) * 0.42;
  for (let i = 0; i < count; i++) {
    const t = i / Math.max(count - 1, 1);
    const angle = i * 2.399963; // golden angle
    const r = 30 + maxR * Math.sqrt(t);
    positions.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
  }
  return positions;
}
