type LogEntry = {
  time: string;
  type: "SMALL" | "HIT" | "LARGE";
  query: string;
};

const entries: LogEntry[] = [
  { time: "0:04", type: "SMALL", query: "What is photosynthesis?" },
  { time: "0:09", type: "HIT", query: "Explain photosynthesis to me" },
  {
    time: "0:17",
    type: "LARGE",
    query: "Write a Python function to parse a CSV and compute rolling averages",
  },
  { time: "0:24", type: "SMALL", query: "What causes ocean tides?" },
];

const typeColors: Record<LogEntry["type"], string> = {
  SMALL: "text-blue-400",
  HIT: "text-green",
  LARGE: "text-purple-400",
};

export default function QueryLog() {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-mono tracking-wider text-text-muted uppercase">
        Query Log
      </h3>
      <div className="flex flex-col gap-1">
        {entries.map((entry, i) => (
          <div
            key={i}
            className="flex items-start gap-3 text-xs font-mono py-0.5"
          >
            <span className="text-text-muted shrink-0">{entry.time}</span>
            <span className={`shrink-0 w-10 ${typeColors[entry.type]}`}>
              {entry.type}
            </span>
            <span className="text-text-secondary truncate">{entry.query}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
