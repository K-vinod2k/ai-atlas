"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
  Waves,
} from "lucide-react";
import type { DataFlowEdge } from "@/data/types";

interface DataFlowSimulatorProps {
  edges: DataFlowEdge[];
}

const STEP_MS = 1400;

export function DataFlowSimulator({ edges }: DataFlowSimulatorProps) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const uniqueNodeCount = useMemo(() => {
    const seen = new Set<string>();
    for (const edge of edges) {
      seen.add(edge.from);
      seen.add(edge.to);
    }
    return seen.size;
  }, [edges]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    stopTimer();
    if (!playing) return;
    timerRef.current = setTimeout(() => {
      setStep((s) => {
        if (s >= edges.length - 1) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, STEP_MS);
    return stopTimer;
  }, [playing, step, edges.length, stopTimer]);

  const next = useCallback(() => {
    setPlaying(false);
    setStep((s) => Math.min(s + 1, edges.length - 1));
  }, [edges.length]);

  const prev = useCallback(() => {
    setPlaying(false);
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const reset = useCallback(() => {
    setPlaying(false);
    setStep(0);
  }, []);

  if (edges.length === 0) return null;

  return (
    <section
      className="glass-panel rounded-2xl overflow-hidden fade-in"
      aria-label="Data flow simulator"
    >
      <header
        className="flex items-center gap-2 px-4 py-3 border-b"
        style={{ borderColor: "rgba(122,226,207,0.18)" }}
      >
        <Waves className="w-4 h-4 text-[#7AE2CF]" aria-hidden="true" />
        <p className="section-label">Data flow simulator</p>
        <span className="ml-auto text-[11px] font-mono tabular-nums text-[color:var(--color-muted-foreground)]">
          Step {step + 1} / {edges.length}
        </span>
      </header>

      <div className="p-4">
        <ol className="flex flex-col gap-1.5">
          {edges.map((edge, i) => {
            const isActive = i === step;
            const isDone = i < step;
            return (
              <li
                key={`${edge.from}-${edge.to}-${i}`}
                className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 rounded-lg px-2 py-1.5 transition-all duration-300"
                style={{
                  background: isActive
                    ? "rgba(122,226,207,0.08)"
                    : "transparent",
                  border: isActive
                    ? "1px solid rgba(122,226,207,0.4)"
                    : "1px solid transparent",
                  boxShadow: isActive
                    ? "0 0 0 3px rgba(122,226,207,0.08)"
                    : "none",
                  opacity: isDone && !isActive ? 0.75 : 1,
                }}
              >
                <span
                  className="text-sm px-2.5 py-1.5 rounded-md truncate font-medium"
                  style={{
                    background: "rgba(11,42,56,0.7)",
                    color: isActive ? "#FDEB9E" : "var(--color-foreground)",
                    border: `1px solid ${
                      isActive
                        ? "rgba(253,235,158,0.5)"
                        : "rgba(122,226,207,0.2)"
                    }`,
                  }}
                >
                  {edge.from}
                </span>

                <span className="flex flex-col items-center gap-0.5">
                  <span
                    className="text-[10px] italic font-medium tracking-wide truncate max-w-[9rem] text-center"
                    style={{
                      color: isActive
                        ? "#FDEB9E"
                        : "var(--color-muted-foreground)",
                    }}
                  >
                    {edge.label}
                  </span>
                  <ArrowRight
                    className="w-4 h-4 transition-all duration-300"
                    style={{
                      color: isActive ? "#7AE2CF" : "rgba(122,226,207,0.35)",
                      filter: isActive
                        ? "drop-shadow(0 0 6px rgba(122,226,207,0.9))"
                        : "none",
                    }}
                    aria-hidden="true"
                  />
                </span>

                <span
                  className="text-sm px-2.5 py-1.5 rounded-md truncate font-medium"
                  style={{
                    background: isActive
                      ? "rgba(7,122,125,0.35)"
                      : "rgba(11,42,56,0.7)",
                    color: isActive ? "#FDEB9E" : "var(--color-foreground)",
                    border: `1px solid ${
                      isActive
                        ? "rgba(253,235,158,0.5)"
                        : "rgba(122,226,207,0.2)"
                    }`,
                  }}
                >
                  {edge.to}
                </span>
              </li>
            );
          })}
        </ol>

        <div
          className="mt-4 pt-3 border-t flex items-center gap-2"
          style={{ borderColor: "rgba(122,226,207,0.18)" }}
        >
          <button
            type="button"
            onClick={reset}
            className="btn-ghost"
            aria-label="Restart from step 1"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={prev}
            disabled={step === 0}
            className="btn-ghost"
            aria-label="Previous step"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => {
              if (step >= edges.length - 1) {
                setStep(0);
                setPlaying(true);
              } else {
                setPlaying((p) => !p);
              }
            }}
            className="btn-primary py-1.5 px-3 text-xs"
            aria-label={playing ? "Pause" : "Play walkthrough"}
          >
            {playing ? (
              <Pause className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <Play className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            {playing ? "Pause" : step >= edges.length - 1 ? "Replay" : "Play"}
          </button>

          <button
            type="button"
            onClick={next}
            disabled={step >= edges.length - 1}
            className="btn-ghost"
            aria-label="Next step"
          >
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>

          <div className="ml-auto text-[11px] text-[color:var(--color-muted-foreground)] hidden sm:block">
            {uniqueNodeCount} nodes · {edges.length} edges
          </div>
        </div>
      </div>
    </section>
  );
}
