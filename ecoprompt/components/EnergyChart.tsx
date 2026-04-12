"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type EnergyChartProps = {
  timeline: { query_number: number; cumulative_energy_saved: number }[];
};

export default function EnergyChart({ timeline }: EnergyChartProps) {
  if (timeline.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-text-muted text-xs font-mono">
        Energy savings chart appears after first query
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-mono tracking-wider text-text-muted uppercase">
        Cumulative Energy Saved
      </h3>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={timeline} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
            <XAxis
              dataKey="query_number"
              tick={{ fill: "#898989", fontSize: 11 }}
              axisLine={{ stroke: "#2e2e2e" }}
              tickLine={false}
              label={{ value: "Query #", position: "insideBottomRight", offset: -4, fill: "#898989", fontSize: 10 }}
            />
            <YAxis
              tick={{ fill: "#898989", fontSize: 11 }}
              axisLine={{ stroke: "#2e2e2e" }}
              tickLine={false}
              tickFormatter={(v: number) => v.toFixed(3)}
              width={48}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e1e1e",
                border: "1px solid #2e2e2e",
                borderRadius: "6px",
                color: "#fafafa",
                fontSize: 12,
              }}
              formatter={(value) => [
                `${Number(value).toFixed(4)} kWh`,
                "Energy Saved",
              ]}
              labelFormatter={(label) => `Query #${label}`}
            />
            <Line
              type="monotone"
              dataKey="cumulative_energy_saved"
              stroke="#3ecf8e"
              strokeWidth={2}
              dot={{ fill: "#3ecf8e", strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: "#3ecf8e" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
