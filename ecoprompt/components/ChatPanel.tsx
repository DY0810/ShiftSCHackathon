"use client";

import { useState, useRef, useEffect } from "react";
import type { Message } from "@/lib/types";
import ChatMessage from "./ChatMessage";

type ChatPanelProps = {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
};

export default function ChatPanel({ messages, setMessages }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const prompt = input.trim();
    if (!prompt || loading) return;

    const userMessage: Message = { role: "user", content: prompt };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Request failed");

      const assistantMessage: Message = {
        role: "assistant",
        content: data.answer,
        model_used: data.model_used,
        cache_hit: data.cache_hit,
        energy_kwh: data.energy_kwh,
        response_time_ms: data.response_time_ms,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border-subtle">
        <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase">
          Chat
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5">
        {messages.length === 0 && !loading && (
          <div className="flex items-center justify-center h-full">
            <p className="text-text-secondary text-sm">
              Ask something to get started...
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <ChatMessage key={i} message={msg} />
        ))}
        {loading && (
          <div className="flex flex-col gap-1.5 py-4 border-b border-border-subtle">
            <span className="text-xs font-mono tracking-wider text-green">
              ECOPROMPT
            </span>
            <p className="text-text-secondary text-sm animate-pulse">
              Thinking...
            </p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSubmit}
        className="px-5 py-4 border-t border-border-subtle"
      >
        <div className="flex items-center gap-2 bg-surface rounded-lg border border-border-standard px-4 py-2.5">
          <input
            type="text"
            placeholder="Ask something..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex items-center justify-center px-4 py-1.5 bg-text-primary text-page-bg text-sm font-medium rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Send <span className="ml-1">&uarr;</span>
          </button>
        </div>
      </form>
    </div>
  );
}
