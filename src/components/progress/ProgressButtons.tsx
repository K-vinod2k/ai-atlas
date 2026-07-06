"use client";

import { BookMarked, CheckCircle2, Eye, RotateCcw } from "lucide-react";
import type { ProgressStatus } from "@/data/types";
import { PROGRESS_COLOR, PROGRESS_LABEL } from "@/data/types";
import { useProgress } from "./ProgressProvider";

const STEPS: Array<{
  status: ProgressStatus;
  icon: typeof Eye;
}> = [
  { status: "reading", icon: Eye },
  { status: "understood", icon: BookMarked },
  { status: "mastered", icon: CheckCircle2 },
];

interface ProgressButtonsProps {
  nodeId: string;
}

export function ProgressButtons({ nodeId }: ProgressButtonsProps) {
  const { loading, statusOf, setStatus } = useProgress();
  const current = statusOf(nodeId);

  return (
    <div
      className="flex items-center gap-2 flex-wrap"
      role="group"
      aria-label="Learning progress"
    >
      <span className="eyebrow mr-1">Progress</span>
      {STEPS.map(({ status, icon: Icon }) => {
        const isActive = current === status;
        const color = PROGRESS_COLOR[status];
        return (
          <button
            key={status}
            type="button"
            disabled={loading}
            onClick={() => setStatus(nodeId, isActive ? "not_started" : status)}
            aria-pressed={isActive}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={
              isActive
                ? {
                    background: "rgba(57,75,90,0.5)",
                    border: `1px solid ${color}`,
                    color,
                  }
                : {
                    background: "rgba(44,42,43,0.55)",
                    border: "1px solid rgba(138,122,109,0.32)",
                    color: "rgba(242,239,236,0.64)",
                  }
            }
          >
            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
            {PROGRESS_LABEL[status]}
          </button>
        );
      })}
      {current !== "not_started" && (
        <button
          type="button"
          onClick={() => setStatus(nodeId, "not_started")}
          className="btn-ghost p-1.5"
          aria-label="Reset progress"
          title="Reset progress"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
