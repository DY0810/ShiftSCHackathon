import MetricsCounter from "./MetricsCounter";
import ModelDistribution from "./ModelDistribution";
import QueryLog from "./QueryLog";

export default function DashboardPanel() {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border-subtle">
        <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase">
          Sustainability Dashboard
        </h2>
      </div>

      <div className="px-5 py-4 flex flex-col gap-5">
        {/* Stat cards grid */}
        <div className="grid grid-cols-2 gap-3">
          <MetricsCounter
            label="Total Queries"
            value="4"
            subtitle="live"
          />
          <MetricsCounter
            label="Cache Hit Rate"
            value="50"
            unit="%"
            subtitle="2 of 4 served"
          />
          <MetricsCounter
            label="Energy Saved"
            value="0.01"
            unit="kWh"
            subtitle="2 LLM calls avoided"
          />
          <MetricsCounter
            label="CO₂ Avoided"
            value="0.004"
            unit="kg"
            subtitle="EPA grid factors"
          />
        </div>

        {/* Model Distribution */}
        <div className="bg-surface rounded-lg border border-border-standard p-4">
          <ModelDistribution />
        </div>

        {/* Headline stat */}
        <div className="bg-surface rounded-lg border border-border-standard p-4">
          <p className="text-sm text-green leading-relaxed">
            2 LLM calls avoided — saving ~0.01 kWh and 0.004 kg CO₂.
          </p>
          <p className="text-xs text-text-secondary mt-2 leading-relaxed">
            At 1M queries/day with this hit rate: 500,000 server calls never
            happen.
          </p>
        </div>

        {/* Query Log */}
        <div className="bg-surface rounded-lg border border-border-standard p-4">
          <QueryLog />
        </div>
      </div>
    </div>
  );
}
