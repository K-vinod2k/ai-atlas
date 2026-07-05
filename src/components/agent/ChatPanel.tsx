"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import type { AgentMessage } from "@/lib/agent/types";

interface ChatMessage extends AgentMessage {
  navigateTo?: string;
}

export function ChatPanel() {
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
        router.push(`/node/${data.navigateTo}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full border border-neutral-200 rounded-lg bg-white">
      <div className="px-4 py-3 border-b border-neutral-200">
        <h2 className="text-sm font-semibold text-neutral-800">Guide</h2>
        <p className="text-xs text-neutral-500">Offline local guide (no API key)</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px] max-h-[400px]">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`text-sm ${
              msg.role === "user" ? "text-neutral-800" : "text-neutral-600"
            }`}
          >
            <span className="font-medium text-xs text-neutral-400 uppercase block mb-1">
              {msg.role}
            </span>
            <div className="whitespace-pre-wrap leading-relaxed">
              {renderMarkdownLite(msg.content)}
            </div>
          </div>
        ))}
        {loading && <p className="text-sm text-neutral-400">Thinking...</p>}
      </div>

      {error && (
        <div className="px-4 py-2 text-sm text-red-600 border-t border-red-100 bg-red-50">
          {error}
        </div>
      )}

      <div className="p-4 border-t border-neutral-200 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask about a term..."
          disabled={loading}
          className="flex-1 px-3 py-2 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-400 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={send}
          disabled={loading || !input.trim()}
          className="px-4 py-2 text-sm font-medium bg-neutral-800 text-white rounded-md hover:bg-neutral-700 disabled:opacity-50"
        >
          Send
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
        <strong key={i} className="font-semibold text-neutral-800">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}
