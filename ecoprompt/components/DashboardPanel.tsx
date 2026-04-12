import MetricsCounter from "./MetricsCounter";
import ModelDistribution from "./ModelDistribution";
import QueryLog from "./QueryLog";
import type { DashboardMetrics } from "@/lib/types";

type DashboardPanelProps = {
  metrics: DashboardMetrics | null;
};

export default function DashboardPanel({ metrics }: DashboardPanelProps) {
  const m = metrics;
  const totalQueries = m?.total_queries ?? 0;
  const cacheHits = m?.cache_hits ?? 0;
  const cacheHitRate = m?.cache_hit_rate ?? 0;
  const energySaved = m?.energy_saved_kwh ?? 0;
  const co2Saved = m?.co2_saved_kg ?? 0;
  const projectedAvoided = totalQueries > 0
    ? Math.round((cacheHitRate / 100) * 1_000_000)
    : 0;

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
            value={String(totalQueries)}
            subtitle="live"
          />
          <MetricsCounter
            label="Cache Hit Rate"
            value={cacheHitRate.toFixed(0)}
            unit="%"
            subtitle={`${cacheHits} of ${totalQueries} served`}
          />
          <MetricsCounter
            label="Energy Saved"
            value={energySaved.toFixed(4)}
            unit="kWh"
            subtitle={`${cacheHits} LLM calls avoided`}
          />
          <MetricsCounter
            label="CO₂ Avoided"
            value={co2Saved.toFixed(4)}
            unit="kg"
            subtitle="EPA grid factors"
          />
        </div>

        {/* Model Distribution */}
        <div className="bg-surface rounded-lg border border-border-standard p-4">
          <ModelDistribution
            cacheHits={m?.distribution.cache_hits ?? 0}
            smallModel={m?.distribution.small_model ?? 0}
            largeModel={m?.distribution.large_model ?? 0}
            total={totalQueries}
          />
        </div>

        {/* Headline stat */}
        <div className="bg-surface rounded-lg border border-border-standard p-4">
          <p className="text-sm text-green leading-relaxed">
            {cacheHits} LLM call{cacheHits !== 1 ? "s" : ""} avoided — saving ~{energySaved.toFixed(4)} kWh and {co2Saved.toFixed(4)} kg CO₂.
          </p>
          <p className="text-xs text-text-secondary mt-2 leading-relaxed">
            At 1M queries/day with this hit rate: {projectedAvoided.toLocaleString()} server calls never happen.
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
