"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Share2 } from "lucide-react";
import { getNodeById } from "@/data/taxonomy";
import { neighbors, PREDICATE_LABEL, type Predicate, type Triple } from "@/lib/kg";

interface NodeTriplesProps {
  nodeId: string;
  onSelectNode: (id: string) => void;
}

const PREDICATE_ORDER: Predicate[] = [
  "child_of",
  "parent_of",
  "connects_to",
  "differs_from",
  "related_to",
  "example_of",
];

const MAX_TRIPLES = 12;

function displayName(entity: string, type: "node" | "literal"): string {
  if (type === "literal") return entity;
  return getNodeById(entity)?.node.name ?? entity;
}

function selectTriples(nodeId: string): Triple[] {
  const rank = (t: Triple) => PREDICATE_ORDER.indexOf(t.predicate);
  return neighbors(nodeId)
    // Hierarchy edges are stored in both directions; keep the outgoing view only.
    .filter(
      (t) =>
        !(
          (t.predicate === "parent_of" || t.predicate === "child_of") &&
          t.subject !== nodeId
        ),
    )
    .sort((a, b) => rank(a) - rank(b) || (b.weight ?? 0) - (a.weight ?? 0));
}

function EntityChip({
  entity,
  type,
  currentId,
  onSelectNode,
}: {
  entity: string;
  type: "node" | "literal";
  currentId: string;
  onSelectNode: (id: string) => void;
}) {
  const name = displayName(entity, type);
  if (type === "literal") {
    return <span className="badge opacity-80">{name}</span>;
  }
  if (entity === currentId) {
    return <span className="badge badge-primary">{name}</span>;
  }
  return (
    <button type="button" onClick={() => onSelectNode(entity)} className="link-pill">
      {name}
    </button>
  );
}

/** "In the knowledge graph": subject-predicate-object chips for the current node. */
export function NodeTriples({ nodeId, onSelectNode }: NodeTriplesProps) {
  const all = useMemo(() => selectTriples(nodeId), [nodeId]);
  const triples = all.slice(0, MAX_TRIPLES);
  const total = all.length;
  if (triples.length === 0) return null;

  return (
    <section className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Share2 className="w-4 h-4 text-[#8FBC9F]" aria-hidden="true" />
          <h2 className="section-label">In the knowledge graph</h2>
        </div>
        <Link href="/graph" className="text-xs text-[#7FA3C0] hover:underline">
          Open full graph
        </Link>
      </div>
      <ul className="space-y-2">
        {triples.map((t, i) => (
          <li key={i} className="flex items-center flex-wrap gap-2 text-sm">
            <EntityChip
              entity={t.subject}
              type={t.subjectType}
              currentId={nodeId}
              onSelectNode={onSelectNode}
            />
            <span className="text-xs text-[color:var(--color-muted-foreground)] italic">
              {PREDICATE_LABEL[t.predicate]}
            </span>
            <EntityChip
              entity={t.object}
              type={t.objectType}
              currentId={nodeId}
              onSelectNode={onSelectNode}
            />
          </li>
        ))}
      </ul>
      {total > triples.length && (
        <p className="mt-3 text-xs text-[color:var(--color-muted-foreground)]">
          Showing {triples.length} of {total} relationships.
        </p>
      )}
    </section>
  );
}
