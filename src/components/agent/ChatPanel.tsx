"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Bot, Loader2, Send } from "lucide-react";
import type { AgentMessage } from "@/lib/agent/types";

interface ChatMessage extends AgentMessage {
  navigateTo?: string;
}

interface ChatPanelProps {
  compact?: boolean;
  onNavigate?: (nodeId: string) => void;
}

export function ChatPanel({ compact = false, onNavigate }: ChatPanelProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        'I am the AI Atlas guide. Ask me to explain nodes, compare terms, or route concepts. Try "explain attention" or "compare RAG vs fine-tuning". Type "help" for commands.',
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(({ role, content }) => ({ role, content })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Agent request failed");

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.content,
        navigateTo: data.navigateTo,
      };
      setMessages((prev) => [...prev, assistantMsg]);

      if (data.navigateTo) {
        if (onNavigate) {
          onNavigate(data.navigateTo);
        } else {
          router.push(`/learn?node=${data.navigateTo}`);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`flex flex-col h-full glass-panel rounded-2xl overflow-hidden ${
        compact ? "max-h-48" : "min-h-[320px]"
      }`}
    >
      <div
        className="px-4 py-3 border-b flex items-center gap-2"
        style={{ borderColor: "rgba(127,163,192,0.18)" }}
      >
        <Bot className="w-4 h-4 text-[#7FA3C0]" aria-hidden="true" />
        <div>
          <h2 className="heading-display text-sm font-semibold text-foreground">
            Guide
          </h2>
          <p className="text-[11px] text-[color:var(--color-muted-foreground)]">
            Offline local guide (no API key)
          </p>
        </div>
      </div>

      <div
        className={`flex-1 overflow-y-auto p-4 space-y-4 ${
          compact ? "min-h-0 max-h-24" : "min-h-0 flex-1"
        }`}
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.map((msg, i) => (
          <div key={i} className="text-sm">
            <span
              className="eyebrow block mb-1"
              style={{
                color:
                  msg.role === "user" ? "#7FA3C0" : "#E8D5C4",
              }}
            >
              {msg.role === "user" ? "You" : "Guide"}
            </span>
            <div
              className="whitespace-pre-wrap leading-relaxed text-[color:var(--color-foreground)]/90"
            >
              {renderMarkdownLite(msg.content)}
            </div>
          </div>
        ))}
        {loading && (
          <div
            className="flex items-center gap-2 text-sm text-[color:var(--color-muted-foreground)]"
            role="status"
          >
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            <span>Thinking...</span>
          </div>
        )}
      </div>

      {error && (
        <div
          className="px-4 py-2 text-sm border-t"
          style={{
            borderColor: "rgba(244,154,138,0.28)",
            background: "rgba(244,154,138,0.08)",
            color: "var(--color-destructive)",
          }}
          role="alert"
        >
          {error}
        </div>
      )}

      <div
        className="p-3 border-t flex gap-2"
        style={{ borderColor: "rgba(127,163,192,0.18)" }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask about a term..."
          disabled={loading}
          aria-label="Chat message"
          className="input-field flex-1 py-2"
        />
        <button
          type="button"
          onClick={send}
          disabled={loading || !input.trim()}
          className="btn-primary px-3 py-2"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" aria-hidden="true" />
          {!compact && <span>Send</span>}
        </button>
      </div>
    </div>
  );
}

function renderMarkdownLite(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-[#E8D5C4]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}
