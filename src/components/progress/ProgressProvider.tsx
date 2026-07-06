"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ProgressStatus } from "@/data/types";

export interface ProgressEvent {
  nodeId: string;
  status: ProgressStatus;
  updatedAt: string;
}

interface ProgressSnapshot {
  statuses: Record<string, ProgressStatus>;
  recent: ProgressEvent[];
  activeDays: string[];
}

interface ProgressContextValue {
  loading: boolean;
  error: string | null;
  statuses: Record<string, ProgressStatus>;
  recent: ProgressEvent[];
  activeDays: string[];
  streak: number;
  statusOf: (nodeId: string) => ProgressStatus;
  setStatus: (nodeId: string, status: ProgressStatus) => Promise<void>;
}

const EMPTY: ProgressContextValue = {
  loading: true,
  error: null,
  statuses: {},
  recent: [],
  activeDays: [],
  streak: 0,
  statusOf: () => "not_started",
  setStatus: async () => {},
};

const ProgressContext = createContext<ProgressContextValue>(EMPTY);

function localDateString(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().slice(0, 10);
}

/** Consecutive active days ending today or yesterday. */
function computeStreak(activeDays: string[]): number {
  const set = new Set(activeDays);
  let start = 0;
  if (!set.has(localDateString(0))) {
    if (!set.has(localDateString(1))) return 0;
    start = 1;
  }
  let streak = 0;
  while (set.has(localDateString(start + streak))) {
    streak += 1;
  }
  return streak;
}

export function ProgressProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [snapshot, setSnapshot] = useState<ProgressSnapshot>({
    statuses: {},
    recent: [],
    activeDays: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/progress")
      .then(async (res) => {
        if (!res.ok) throw new Error(`Progress request failed (${res.status})`);
        return (await res.json()) as ProgressSnapshot;
      })
      .then((data) => {
        if (!cancelled) {
          setSnapshot(data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load progress");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setStatus = useCallback(
    async (nodeId: string, status: ProgressStatus) => {
      // Optimistic update
      setSnapshot((prev) => {
        const statuses = { ...prev.statuses };
        if (status === "not_started") {
          delete statuses[nodeId];
        } else {
          statuses[nodeId] = status;
        }
        return { ...prev, statuses };
      });
      try {
        const res = await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nodeId, status }),
        });
        if (!res.ok) throw new Error(`Save failed (${res.status})`);
        const data = (await res.json()) as ProgressSnapshot;
        setSnapshot(data);
        setError(null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to save progress");
      }
    },
    [],
  );

  const value = useMemo<ProgressContextValue>(() => {
    const statusOf = (nodeId: string): ProgressStatus =>
      snapshot.statuses[nodeId] ?? "not_started";
    return {
      loading,
      error,
      statuses: snapshot.statuses,
      recent: snapshot.recent,
      activeDays: snapshot.activeDays,
      streak: computeStreak(snapshot.activeDays),
      statusOf,
      setStatus,
    };
  }, [snapshot, loading, error, setStatus]);

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress(): ProgressContextValue {
  return useContext(ProgressContext);
}
