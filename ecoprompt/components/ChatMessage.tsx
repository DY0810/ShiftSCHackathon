import type { Message } from "@/lib/types";

type ChatMessageProps = {
  message: Message;
};

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const label = isUser ? "USER" : "ECOPROMPT";

  const badgeText = message.cache_hit
    ? `Cache hit · 0 LLM calls`
    : message.model_used === "haiku"
      ? "Small model · Haiku"
      : message.model_used === "sonnet"
        ? "Large model · Sonnet"
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
      <p className="text-text-primary text-sm leading-relaxed">
        {message.content}
      </p>
      {badgeText && (
        <span className="inline-flex items-center gap-1.5 mt-1 w-fit px-3 py-1 rounded-full text-xs font-medium bg-green/10 text-green border border-green-border">
          <span className="w-1.5 h-1.5 rounded-full bg-green" />
          {badgeText}
        </span>
      )}
    </div>
  );
}
