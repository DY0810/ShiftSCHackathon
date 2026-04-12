import type { Message } from "@/lib/types";
import ChatMessage from "./ChatMessage";

const sampleMessages: Message[] = [
  {
    role: "user",
    content: "What is photosynthesis?",
  },
  {
    role: "assistant",
    content:
      "Photosynthesis is the process by which plants convert sunlight, water, and CO\u2082 into glucose and oxygen using chlorophyll.",
    model_used: "haiku",
    cache_hit: false,
  },
  {
    role: "user",
    content: "Explain photosynthesis to me",
  },
  {
    role: "assistant",
    content:
      "Photosynthesis is the process by which plants convert sunlight, water, and CO\u2082 into glucose and oxygen using chlorophyll.",
    model_used: "cache",
    cache_hit: true,
  },
  {
    role: "user",
    content:
      "Write a Python function to parse a CSV and compute rolling averages",
  },
];

export default function ChatPanel() {
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
        {sampleMessages.map((msg, i) => (
          <ChatMessage key={i} message={msg} />
        ))}
      </div>

      {/* Input bar */}
      <div className="px-5 py-4 border-t border-border-subtle">
        <div className="flex items-center gap-2 bg-surface rounded-lg border border-border-standard px-4 py-2.5">
          <input
            type="text"
            placeholder="Ask something..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
            disabled
          />
          <button className="flex items-center justify-center px-4 py-1.5 bg-text-primary text-page-bg text-sm font-medium rounded-md hover:opacity-90 transition-opacity">
            Send <span className="ml-1">↑</span>
          </button>
        </div>
      </div>
    </div>
  );
}
