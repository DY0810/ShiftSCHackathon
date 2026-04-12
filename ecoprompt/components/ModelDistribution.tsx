type DistributionItem = {
  label: string;
  percentage: number;
  color: string;
};

const items: DistributionItem[] = [
  { label: "Cache hit", percentage: 50, color: "bg-green" },
  { label: "Small", percentage: 25, color: "bg-blue-500" },
  { label: "Large", percentage: 25, color: "bg-purple-500" },
];

export default function ModelDistribution() {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-mono tracking-wider text-text-muted uppercase">
        Model Distribution
      </h3>
      <div className="flex flex-col gap-2.5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <span className="text-xs text-text-secondary w-16 shrink-0">
              {item.label}
            </span>
            <div className="flex-1 h-3 bg-border-subtle rounded-full overflow-hidden">
              <div
                className={`h-full ${item.color} rounded-full transition-all`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
            <span className="text-xs text-text-secondary w-8 text-right">
              {item.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
