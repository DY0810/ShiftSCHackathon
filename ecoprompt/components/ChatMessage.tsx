import type { Message } from "@/lib/types";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

type ChatMessageProps = {
  message: Message;
};

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const label = isUser ? "USER" : "ECOPROMPT";

  const isCacheHit = message.cache_hit;
  const isSonnet = message.model_used === "sonnet";
  const badgeText = isCacheHit
    ? `Cache Hit · 0 LLM calls`
    : message.model_used === "haiku"
      ? "Small Model (Haiku)"
      : isSonnet
        ? "Large Model (Sonnet)"
        : null;

  return (
    <div className="flex flex-col gap-1.5 py-4 border-b border-border-subtle">
      <span
        className={`text-xs font-mono tracking-wider ${
          isUser ? "text-text-muted" : "text-green"
        }`}
      >
        {label}
      </span>
      <div className="text-text-primary text-sm leading-relaxed prose prose-invert prose-sm max-w-none prose-pre:bg-[#1e1e1e] prose-pre:border prose-pre:border-border-standard prose-pre:rounded-md prose-code:text-green prose-headings:text-text-primary prose-headings:font-semibold prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-pre:my-2">
        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{message.content}</ReactMarkdown>
      </div>
      {(badgeText || message.response_time_ms) && (
        <div className="flex items-center gap-2 mt-1">
          {badgeText && (
            <span
              className={`inline-flex items-center gap-1.5 w-fit px-3 py-1 rounded-full text-xs font-medium ${
                isCacheHit
                  ? "bg-amber-400/10 text-amber-400 border border-amber-400/30"
                  : isSonnet
                    ? "bg-blue-400/10 text-blue-400 border border-blue-400/30"
                    : "bg-green/10 text-green border border-green-border"
              }`}
            >
              {isCacheHit ? (
                <span>&#9889;</span>
              ) : isSonnet ? (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-green" />
              )}
              {badgeText}
            </span>
          )}
          {message.response_time_ms && (
            <span className="text-xs text-text-secondary">
              {(message.response_time_ms / 1000).toFixed(1)}s
            </span>
          )}
        </div>
      )}
    </div>
  );
}
