import type { Message } from "@/lib/types";

type QueryLogProps = {
  messages: Message[];
};

const typeColors: Record<string, string> = {
  SMALL: "text-green",
  HIT: "text-yellow-400",
  LARGE: "text-blue-400",
};

function getType(msg: Message): string {
  if (msg.cache_hit) return "HIT";
  if (msg.model_used === "sonnet") return "LARGE";
  return "SMALL";
}

export default function QueryLog({ messages }: QueryLogProps) {
  const queries = messages.filter((m) => m.role === "user");

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-mono tracking-wider text-text-muted uppercase">
        Query Log
      </h3>
      <div className="flex flex-col gap-1">
        {queries.length === 0 && (
          <span className="text-xs text-text-muted">No queries yet</span>
        )}
        {queries.map((entry, i) => {
          const response = messages.find(
            (m, idx) =>
              m.role === "assistant" &&
              idx > messages.indexOf(entry) &&
              idx === messages.indexOf(entry) + 1
          );
          const type = response ? getType(response) : "SMALL";
          return (
            <div
              key={i}
              className="flex items-start gap-3 text-xs font-mono py-0.5"
            >
              <span className="text-text-muted shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className={`shrink-0 w-10 ${typeColors[type]}`}>
                {type}
              </span>
              <span className="text-text-secondary truncate">
                {entry.content}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
