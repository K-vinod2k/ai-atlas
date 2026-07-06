"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { ChatPanel } from "./ChatPanel";

interface ChatDrawerProps {
  open: boolean;
  onClose: () => void;
  onNavigate?: (nodeId: string) => void;
}

export function ChatDrawer({ open, onClose, onNavigate }: ChatDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 pointer-events-none transition-opacity duration-200 ${
        open ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close guide"
        onClick={onClose}
        className={`absolute inset-0 bg-[#020F15]/70 backdrop-blur-[2px] transition-opacity duration-200 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="AI Atlas guide"
        className={`absolute right-0 top-0 h-full w-full max-w-[440px] flex flex-col glass-panel-strong transition-transform duration-300 ease-out ${
          open ? "translate-x-0 pointer-events-auto" : "translate-x-full"
        }`}
        style={{
          borderLeft: "1px solid rgba(122, 226, 207, 0.35)",
          borderRadius: 0,
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "rgba(122, 226, 207, 0.22)" }}
        >
          <div>
            <p className="eyebrow">Guide</p>
            <h2 className="heading-display text-lg font-semibold text-foreground mt-0.5">
              Ask the atlas
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost"
            aria-label="Close guide"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 min-h-0 p-3">
          <ChatPanel onNavigate={onNavigate} />
        </div>
      </aside>
    </div>
  );
}
