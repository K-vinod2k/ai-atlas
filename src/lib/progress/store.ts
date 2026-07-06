import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { nodeProgress } from "@/db/schema";
import type { ProgressStatus } from "@/data/types";
import { isProgressStatus } from "@/data/types";

export interface ProgressEvent {
  nodeId: string;
  status: ProgressStatus;
  updatedAt: string;
}

export interface ProgressSnapshot {
  /** Current status per node (latest event wins) */
  statuses: Record<string, ProgressStatus>;
  /** Most recent events, newest first */
  recent: ProgressEvent[];
  /** Distinct local dates (YYYY-MM-DD) with at least one event */
  activeDays: string[];
}

const RECENT_LIMIT = 12;
const EVENT_SCAN_LIMIT = 2000;

export function getProgressSnapshot(): ProgressSnapshot {
  const db = getDb();
  const rows = db
    .select()
    .from(nodeProgress)
    .orderBy(desc(nodeProgress.id))
    .limit(EVENT_SCAN_LIMIT)
    .all();

  const statuses: Record<string, ProgressStatus> = {};
  const recent: ProgressEvent[] = [];
  const days = new Set<string>();

  for (const row of rows) {
    if (!isProgressStatus(row.status)) continue;
    // Rows come newest-first, so the first row seen per node is current.
    if (!(row.nodeId in statuses)) {
      statuses[row.nodeId] = row.status;
    }
    if (recent.length < RECENT_LIMIT) {
      recent.push({
        nodeId: row.nodeId,
        status: row.status,
        updatedAt: row.updatedAt,
      });
    }
    days.add(row.updatedAt.slice(0, 10));
  }

  // Drop nodes whose latest status is not_started (cleared)
  for (const [nodeId, status] of Object.entries(statuses)) {
    if (status === "not_started") delete statuses[nodeId];
  }

  return {
    statuses,
    recent,
    activeDays: Array.from(days).sort(),
  };
}

export function recordProgress(nodeId: string, status: ProgressStatus): void {
  const db = getDb();
  db.insert(nodeProgress)
    .values({ nodeId, status, updatedAt: new Date().toISOString() })
    .run();
}
