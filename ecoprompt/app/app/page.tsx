"use client";

import { useState } from "react";
import ChatPanel from "@/components/ChatPanel";
import DashboardPanel from "@/components/DashboardPanel";
import type { Message } from "@/lib/types";

export default function AppPage() {
  const [messages, setMessages] = useState<Message[]>([]);

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-page-bg">
      {/* Chat Panel — left ~55% */}
      <div className="lg:w-[55%] w-full h-1/2 lg:h-full border-b lg:border-b-0 lg:border-r border-border-subtle">
        <ChatPanel messages={messages} setMessages={setMessages} />
      </div>

      {/* Dashboard Panel — right ~45% */}
      <div className="lg:w-[45%] w-full h-1/2 lg:h-full bg-surface/30">
        <DashboardPanel />
      </div>
    </div>
  );
}
