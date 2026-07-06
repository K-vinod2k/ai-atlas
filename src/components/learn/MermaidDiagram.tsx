"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

interface MermaidDiagramProps {
  source: string;
  title?: string;
}

export function MermaidDiagram({ source, title = "Architecture diagram" }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const uniqueId = useId().replace(/:/g, "");
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
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
          theme: "neutral",
          themeVariables: {
            primaryColor: "#607456",
            primaryTextColor: "#7b2525",
            primaryBorderColor: "#ba6a4c",
            lineColor: "#607456",
            secondaryColor: "#eee0cc",
            tertiaryColor: "#fffbf6",
            fontFamily: "Source Sans 3, system-ui, sans-serif",
          },
          securityLevel: "strict",
        });

        const { svg } = await mermaid.render(`mmd-${uniqueId}`, source.trim());
        if (cancelled || !containerRef.current) return;
        containerRef.current.innerHTML = svg;
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
      className="rounded-xl overflow-hidden"
      style={{
        background: "var(--color-surface)",
        border: "1px solid color-mix(in srgb, var(--color-border) 40%, transparent)",
      }}
      aria-label={title}
    >
      <div className="px-5 py-3 border-b" style={{ borderColor: "color-mix(in srgb, var(--color-border) 40%, transparent)" }}>
        <p className="section-label">{title}</p>
      </div>

      <div className="relative min-h-[180px] p-4 flex items-center justify-center">
        {status === "loading" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            <span>Rendering diagram...</span>
          </div>
        )}

        {status === "error" && (
          <div
            className="flex items-start gap-3 text-sm p-4 rounded-lg w-full"
            style={{
              background: "color-mix(in srgb, var(--color-destructive) 8%, var(--color-surface))",
              border: "1px solid color-mix(in srgb, var(--color-destructive) 20%, transparent)",
            }}
            role="alert"
          >
            <AlertCircle className="w-5 h-5 shrink-0 text-destructive" aria-hidden="true" />
            <div>
              <p className="font-semibold text-foreground">Diagram could not be rendered</p>
              <p className="mt-1 text-muted-foreground">{errorMsg}</p>
            </div>
          </div>
        )}

        <div
          ref={containerRef}
          className={`w-full overflow-x-auto ${status !== "ready" ? "sr-only" : ""}`}
          aria-hidden={status !== "ready"}
        />
      </div>
    </section>
  );
}
