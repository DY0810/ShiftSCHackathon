"use client";

import { useState, useCallback, useEffect } from "react";
import ChatPanel from "@/components/ChatPanel";
import DashboardPanel from "@/components/DashboardPanel";
import type { Message, DashboardMetrics } from "@/lib/types";

const MESSAGES_KEY = "ecoprompt-messages";

export default function AppPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Load saved messages from sessionStorage after mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(MESSAGES_KEY);
      if (saved) setMessages(JSON.parse(saved));
    } catch {}
    setHydrated(true);
  }, []);

  // Persist messages to sessionStorage (only after initial hydration)
  useEffect(() => {
    if (hydrated) {
      sessionStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
    }
  }, [messages, hydrated]);

  const refreshMetrics = useCallback(async () => {
    const res = await fetch("/api/metrics");
    if (res.ok) {
      setMetrics(await res.json());
    }
  }, []);

  const [resetting, setResetting] = useState(false);

  // Load metrics on mount (they're already in DynamoDB)
  useEffect(() => {
    refreshMetrics();
  }, [refreshMetrics]);

  async function handleReset() {
    if (resetting) return;
    setResetting(true);
    // Clear local state immediately
    setMessages([]);
    sessionStorage.removeItem(MESSAGES_KEY);
    setMetrics(null);
    try {
      await fetch("/api/reset", { method: "POST" });
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col lg:flex-row bg-page-bg">
      {/* Reset button */}
      <button
        onClick={handleReset}
        disabled={resetting}
        className="absolute top-4 right-4 z-50 px-3 py-1.5 text-xs font-mono rounded-md border border-border-standard text-text-muted hover:text-text-primary hover:border-border-prominent transition-colors disabled:opacity-50"
      >
        {resetting ? "Clearing..." : "Reset"}
      </button>

      {/* Chat Panel — left ~55% */}
      <div className="lg:w-[55%] w-full h-1/2 lg:h-full border-b lg:border-b-0 lg:border-r border-border-subtle">
        <ChatPanel
          messages={messages}
          setMessages={setMessages}
          onQueryComplete={refreshMetrics}
        />
      </div>

      {/* Dashboard Panel — right ~45% */}
      <div className="lg:w-[45%] w-full h-1/2 lg:h-full bg-surface/30">
        <DashboardPanel metrics={metrics} messages={messages} />
      </div>
    </div>
  );
}
