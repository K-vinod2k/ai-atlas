"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AlertCircle, Loader2, Network } from "lucide-react";

interface SkillupMermaidProps {
  source: string;
  title?: string;
}

/** Skillup-local mermaid renderer (same dynamic-import pattern as /learn,
 * duplicated here so the textbook does not depend on learn components). */
export function SkillupMermaid({
  source,
  title = "Diagram",
}: SkillupMermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const uniqueId = useId().replace(/:/g, "");
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      setStatus("loading");
      setErrorMsg(null);
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          themeVariables: {
            background: "transparent",
            primaryColor: "#2C2A2B",
            primaryTextColor: "#F1F8F7",
            primaryBorderColor: "#7FA3C0",
            secondaryColor: "#082633",
            tertiaryColor: "#0F3444",
            lineColor: "#7FA3C0",
            textColor: "#F1F8F7",
            mainBkg: "#2C2A2B",
            nodeBorder: "#7FA3C0",
            clusterBkg: "rgba(44,42,43,0.5)",
            clusterBorder: "rgba(127,163,192,0.35)",
            edgeLabelBackground: "#082633",
            fontFamily: "Source Sans 3, system-ui, sans-serif",
          },
          securityLevel: "strict",
        });

        const { svg } = await mermaid.render(
          `skillup-mmd-${uniqueId}`,
          source.trim(),
        );
        if (cancelled || !containerRef.current) return;
        containerRef.current.innerHTML = svg;
        const svgEl = containerRef.current.querySelector("svg");
        if (svgEl) {
          svgEl.setAttribute("style", "max-width: 100%; height: auto;");
        }
        setStatus("ready");
      } catch (e) {
        if (cancelled) return;
        setStatus("error");
        setErrorMsg(
          e instanceof Error ? e.message : "Failed to render diagram",
        );
      }
    }

    void render();
    return () => {
      cancelled = true;
    };
  }, [source, uniqueId]);

  return (
    <figure
      className="glass-panel rounded-2xl overflow-hidden my-6 not-prose"
      aria-label={title}
    >
      <div
        className="px-4 py-2.5 border-b flex items-center gap-2"
        style={{ borderColor: "rgba(127,163,192,0.18)" }}
      >
        <Network className="w-4 h-4 text-[#7FA3C0]" aria-hidden="true" />
        <figcaption className="section-label">{title}</figcaption>
      </div>

      <div className="relative min-h-[160px] p-4 flex items-center justify-center">
        {status === "loading" && (
          <div
            className="flex items-center gap-2 text-sm text-[color:var(--color-muted-foreground)]"
            role="status"
          >
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            <span>Rendering diagram...</span>
          </div>
        )}

        {status === "error" && (
          <div
            className="flex items-start gap-3 text-sm p-4 rounded-lg w-full"
            style={{
              background: "rgba(244,154,138,0.08)",
              border: "1px solid rgba(244,154,138,0.28)",
            }}
            role="alert"
          >
            <AlertCircle
              className="w-5 h-5 shrink-0 text-[color:var(--color-destructive)]"
              aria-hidden="true"
            />
            <div>
              <p className="font-semibold text-foreground">
                Diagram could not be rendered
              </p>
              <p className="mt-1 text-[color:var(--color-muted-foreground)]">
                {errorMsg}
              </p>
            </div>
          </div>
        )}

        <div
          ref={containerRef}
          className={`w-full overflow-x-auto ${status !== "ready" ? "sr-only" : ""}`}
          aria-hidden={status !== "ready"}
        />
      </div>
    </figure>
  );
}
