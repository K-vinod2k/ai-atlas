"use client";

import Link from "next/link";
import { Flame } from "lucide-react";
import { taxonomyIndex } from "@/data/taxonomy";
import { useProgress } from "./ProgressProvider";

export function HeaderProgressStat() {
  const { loading, statuses, streak } = useProgress();

  if (loading) {
    return (
      <span className="skeleton hidden md:inline-block w-24 h-6" aria-hidden="true" />
    );
  }

  const done = Object.values(statuses).filter(
    (s) => s === "understood" || s === "mastered",
  ).length;
  const percent = Math.round((done / taxonomyIndex.count) * 100);

  return (
    <Link
      href="/progress"
      className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-200"
      style={{
        background: "rgba(44,42,43,0.55)",
        border: "1px solid rgba(138,122,109,0.32)",
        color: "rgba(242,239,236,0.8)",
      }}
      title="Open progress dashboard"
    >
      <Flame
        className="w-3.5 h-3.5"
        style={{ color: streak > 0 ? "#C8A88E" : "rgba(242,239,236,0.4)" }}
        aria-hidden="true"
      />
      <span>
        {streak} day{streak === 1 ? "" : "s"}
      </span>
      <span aria-hidden="true" style={{ color: "rgba(242,239,236,0.35)" }}>
        |
      </span>
      <span style={{ color: "#7FA3C0" }}>{percent}% learned</span>
    </Link>
  );
}
