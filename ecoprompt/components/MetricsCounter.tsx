type MetricsCounterProps = {
  label: string;
  value: string;
  subtitle: string;
  unit?: string;
};

export default function MetricsCounter({
  label,
  value,
  subtitle,
  unit,
}: MetricsCounterProps) {
  return (
    <div className="bg-surface rounded-lg border border-border-standard p-4 flex flex-col gap-1">
      <span className="text-xs font-mono tracking-wider text-text-muted uppercase">
        {label}
      </span>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-semibold text-text-primary tracking-tight">
          {value}
        </span>
        {unit && (
          <span className="text-sm text-text-secondary">{unit}</span>
        )}
      </div>
      <span className="text-xs text-green flex items-center gap-1">
        <span className="text-green">↑</span> {subtitle}
      </span>
    </div>
  );
}
