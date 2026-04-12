type ModelDistributionProps = {
  cacheHits: number;
  smallModel: number;
  largeModel: number;
  total: number;
};

export default function ModelDistribution({ cacheHits, smallModel, largeModel, total }: ModelDistributionProps) {
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);
  const items = [
    { label: "Cache hit", percentage: pct(cacheHits), color: "bg-amber-400" },
    { label: "Small", percentage: pct(smallModel), color: "bg-green" },
    { label: "Large", percentage: pct(largeModel), color: "bg-blue-400" },
  ];
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
