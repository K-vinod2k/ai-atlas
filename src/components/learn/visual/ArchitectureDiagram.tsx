"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AlertCircle, Loader2, Network } from "lucide-react";

interface ArchitectureDiagramProps {
  source: string;
  title?: string;
}

interface HoverTip {
  x: number;
  y: number;
  label: string;
}

export function ArchitectureDiagram({
  source,
  title = "Architecture diagram",
}: ArchitectureDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const uniqueId = useId().replace(/:/g, "");
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [tip, setTip] = useState<HoverTip | null>(null);

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
            primaryColor: "#0B2A38",
            primaryTextColor: "#F1F8F7",
            primaryBorderColor: "#7AE2CF",
            secondaryColor: "#082633",
            tertiaryColor: "#0F3444",
            lineColor: "#7AE2CF",
            textColor: "#F1F8F7",
            mainBkg: "#0B2A38",
            nodeBorder: "#7AE2CF",
            clusterBkg: "rgba(11,42,56,0.5)",
            clusterBorder: "rgba(122,226,207,0.35)",
            edgeLabelBackground: "#082633",
            fontFamily: "Source Sans 3, system-ui, sans-serif",
          },
          securityLevel: "strict",
        });

        const { svg } = await mermaid.render(`mmd-${uniqueId}`, source.trim());
        if (cancelled || !containerRef.current) return;
        containerRef.current.innerHTML = svg;

        const svgEl = containerRef.current.querySelector("svg");
        if (svgEl) {
          svgEl.setAttribute("style", "max-width: 100%; height: auto;");
        }

        const nodes = containerRef.current.querySelectorAll<SVGGElement>(
          "svg .node",
        );
        nodes.forEach((node) => {
          node.style.cursor = "help";
          node.style.transition = "filter 0.2s ease";
          node.addEventListener("mouseenter", (e) => {
            node.style.filter =
              "drop-shadow(0 0 8px rgba(122,226,207,0.55))";
            const label =
              node.querySelector("text")?.textContent?.trim() ??
              node.getAttribute("id") ??
              "";
            const rect = (
              e.currentTarget as SVGGElement
            ).getBoundingClientRect();
            const parentRect = containerRef.current?.getBoundingClientRect();
            if (!parentRect || !label) return;
            setTip({
              x: rect.left + rect.width / 2 - parentRect.left,
              y: rect.top - parentRect.top - 6,
              label,
            });
          });
          node.addEventListener("mouseleave", () => {
            node.style.filter = "none";
            setTip(null);
          });
        });

        setStatus("ready");
      } catch (e) {
        if (cancelled) return;
        setStatus("error");
        setErrorMsg(e instanceof Error ? e.message : "Failed to render diagram");
      }
    }

    void render();
    return () => {
      cancelled = true;
    };
  }, [source, uniqueId]);

  return (
    <section
      className="glass-panel rounded-2xl overflow-hidden fade-in"
      aria-label={title}
    >
      <div
        className="px-4 py-3 border-b flex items-center gap-2"
        style={{ borderColor: "rgba(122,226,207,0.18)" }}
      >
        <Network className="w-4 h-4 text-[#7AE2CF]" aria-hidden="true" />
        <p className="section-label">{title}</p>
        <span className="ml-auto text-[10px] uppercase tracking-widest text-[color:var(--color-subtle-foreground)]">
          Hover parts
        </span>
      </div>

      <div className="relative min-h-[220px] p-4 flex items-center justify-center">
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

        {tip && (
          <div
            role="tooltip"
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md px-2 py-1 text-xs font-medium whitespace-nowrap"
            style={{
              left: tip.x,
              top: tip.y,
              background: "rgba(6,32,43,0.95)",
              color: "#FDEB9E",
              border: "1px solid rgba(253,235,158,0.45)",
              boxShadow: "0 6px 16px rgba(4,16,22,0.55)",
            }}
          >
            {tip.label}
          </div>
        )}
      </div>
    </section>
  );
}
