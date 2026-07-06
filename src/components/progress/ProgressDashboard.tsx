"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  BookMarked,
  CalendarDays,
  CheckCircle2,
  Eye,
  Flame,
  Layers,
} from "lucide-react";
import { getTopBranches, taxonomyIndex } from "@/data/taxonomy";
import {
  PROGRESS_COLOR,
  PROGRESS_LABEL,
  type ProgressStatus,
} from "@/data/types";
import { useProgress } from "./ProgressProvider";

const TRACKED: ProgressStatus[] = ["reading", "understood", "mastered"];

const STATUS_ICON: Record<ProgressStatus, typeof Eye> = {
  not_started: Eye,
  reading: Eye,
  understood: BookMarked,
  mastered: CheckCircle2,
};

function formatWhen(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ProgressDashboard() {
  const { loading, error, statuses, recent, activeDays, streak } =
    useProgress();

  const branches = useMemo(() => getTopBranches(), []);

  const branchStats = useMemo(() => {
    return branches.map((branch) => {
      let total = 0;
      const counts: Record<ProgressStatus, number> = {
        not_started: 0,
        reading: 0,
        understood: 0,
        mastered: 0,
      };
      for (const indexed of taxonomyIndex.byId.values()) {
        if (indexed.branchId !== branch.id) continue;
        total += 1;
        counts[statuses[indexed.node.id] ?? "not_started"] += 1;
      }
      return { branch, total, counts };
    });
  }, [branches, statuses]);

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-[300px] card"
        role="status"
      >
        <div className="skeleton w-8 h-8 rounded-full" aria-hidden="true" />
        <span className="ml-3 text-sm text-[color:var(--color-muted-foreground)]">
          Loading progress...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card flex gap-3" role="alert">
        <AlertTriangle
          className="w-5 h-5 shrink-0 text-[color:var(--color-destructive)]"
          aria-hidden="true"
        />
        <div>
          <p className="font-semibold">Could not load progress</p>
          <p className="mt-1 text-sm text-[color:var(--color-muted-foreground)]">
            {error}
          </p>
        </div>
      </div>
    );
  }

  const totalNodes = taxonomyIndex.count;
  const countsByStatus: Record<ProgressStatus, number> = {
    not_started: 0,
    reading: 0,
    understood: 0,
    mastered: 0,
  };
  for (const status of Object.values(statuses)) {
    countsByStatus[status] += 1;
  }
  const done = countsByStatus.understood + countsByStatus.mastered;
  const percent = Math.round((done / totalNodes) * 100);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-[#7FA3C0]" aria-hidden="true" />
            <p className="section-label">Concepts learned</p>
          </div>
          <p className="heading-display text-3xl font-semibold">
            {done}
            <span className="text-lg text-[color:var(--color-muted-foreground)]">
              {" "}
              / {totalNodes}
            </span>
          </p>
          <p className="mt-1 text-sm text-[color:var(--color-muted-foreground)]">
            {percent}% of the atlas understood or mastered
          </p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-[#C8A88E]" aria-hidden="true" />
            <p className="section-label">Streak</p>
          </div>
          <p className="heading-display text-3xl font-semibold">
            {streak} day{streak === 1 ? "" : "s"}
          </p>
          <p className="mt-1 text-sm text-[color:var(--color-muted-foreground)]">
            Consecutive days with progress updates
          </p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays className="w-4 h-4 text-[#7FA3C0]" aria-hidden="true" />
            <p className="section-label">Days active</p>
          </div>
          <p className="heading-display text-3xl font-semibold">
            {activeDays.length}
          </p>
          <p className="mt-1 text-sm text-[color:var(--color-muted-foreground)]">
            Total days you tracked learning
          </p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-[#E8D5C4]" aria-hidden="true" />
            <p className="section-label">By status</p>
          </div>
          <ul className="space-y-1.5 mt-1">
            {TRACKED.map((status) => (
              <li
                key={status}
                className="flex items-center gap-2 text-sm text-[color:var(--color-foreground)]/85"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: PROGRESS_COLOR[status] }}
                  aria-hidden="true"
                />
                {PROGRESS_LABEL[status]}
                <span className="ml-auto font-semibold">
                  {countsByStatus[status]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="card">
        <h2 className="section-label mb-5">Completion by branch</h2>
        <div className="space-y-4">
          {branchStats.map(({ branch, total, counts }) => {
            const branchDone = counts.understood + counts.mastered;
            const pct = total > 0 ? Math.round((branchDone / total) * 100) : 0;
            const readingPct =
              total > 0 ? Math.round((counts.reading / total) * 100) : 0;
            return (
              <div key={branch.id}>
                <div className="flex items-baseline justify-between gap-3 mb-1.5">
                  <Link
                    href={`/learn?node=${branch.id}`}
                    className="text-sm font-medium hover:text-[#7FA3C0] transition-colors duration-200"
                  >
                    {branch.name}
                  </Link>
                  <span className="text-xs text-[color:var(--color-muted-foreground)]">
                    {branchDone} / {total} ({pct}%)
                  </span>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden flex"
                  style={{ background: "rgba(138,122,109,0.16)" }}
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${branch.name} completion`}
                >
                  <span
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background:
                        "linear-gradient(90deg, #7FA3C0, #E8D5C4)",
                    }}
                  />
                  <span
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${readingPct}%`,
                      background: "#C8A88E",
                      opacity: 0.7,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card">
        <h2 className="section-label mb-4">Recent activity</h2>
        {recent.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-sm text-[color:var(--color-muted-foreground)]">
              No activity yet. Open a concept in the Learn workspace and mark
              it as reading, understood, or mastered.
            </p>
            <Link href="/learn" className="btn-primary mt-4">
              Open Learn workspace
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-[rgba(138,122,109,0.2)]">
            {recent.map((event, i) => {
              const node = taxonomyIndex.byId.get(event.nodeId)?.node;
              const Icon = STATUS_ICON[event.status];
              return (
                <li
                  key={`${event.nodeId}-${event.updatedAt}-${i}`}
                  className="flex items-center gap-3 py-2.5"
                >
                  <Icon
                    className="w-4 h-4 shrink-0"
                    style={{ color: PROGRESS_COLOR[event.status] }}
                    aria-hidden="true"
                  />
                  <Link
                    href={`/learn?node=${event.nodeId}`}
                    className="text-sm font-medium hover:text-[#7FA3C0] transition-colors duration-200 truncate"
                  >
                    {node?.name ?? event.nodeId}
                  </Link>
                  <span
                    className="text-xs shrink-0"
                    style={{ color: PROGRESS_COLOR[event.status] }}
                  >
                    {PROGRESS_LABEL[event.status]}
                  </span>
                  <span className="ml-auto text-xs text-[color:var(--color-subtle-foreground)] shrink-0">
                    {formatWhen(event.updatedAt)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
