import { ScanCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, ensureTable } from "./dynamodb";
import type { DashboardMetrics } from "./types";

const TABLE_NAME = "ecoprompt-query-metrics";

let tableReady: Promise<void> | null = null;

function ensureMetricsTable() {
  if (!tableReady) {
    tableReady = ensureTable(TABLE_NAME, [
      { AttributeName: "id", KeyType: "HASH" },
    ]);
  }
  return tableReady;
}

export const ENERGY = {
  large_model_kwh: 0.007,
  small_model_kwh: 0.0007,
  cache_hit_kwh: 0.0001,
  grid_emission_factor: 0.386, // kg CO2 per kWh, EPA eGRID 2023
} as const;

export function estimateEnergy(
  cache_hit: boolean,
  model_used: string
): { energy_kwh: number; co2_kg: number } {
  let energy_kwh: number;
  if (cache_hit) {
    energy_kwh = ENERGY.cache_hit_kwh;
  } else if (model_used === "haiku") {
    energy_kwh = ENERGY.small_model_kwh;
  } else {
    energy_kwh = ENERGY.large_model_kwh;
  }
  return {
    energy_kwh,
    co2_kg: energy_kwh * ENERGY.grid_emission_factor,
  };
}

export type MetricEntry = {
  prompt_preview: string;
  cache_hit: boolean;
  model_used: string;
  energy_kwh: number;
  co2_kg: number;
  response_time_ms: number;
};

export async function logMetric(data: MetricEntry): Promise<void> {
  await ensureMetricsTable();
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        id: crypto.randomUUID(),
        ...data,
        created_at: new Date().toISOString(),
      },
    })
  );
}

export async function getAggregatedMetrics(): Promise<DashboardMetrics> {
  await ensureMetricsTable();
  const result = await docClient.send(
    new ScanCommand({ TableName: TABLE_NAME })
  );

  const items = result.Items || [];

  let cache_hits = 0;
  let small_model_count = 0;
  let large_model_count = 0;
  let total_energy_kwh = 0;
  let total_co2_kg = 0;
  let energy_saved_kwh = 0;

  const sorted = [...items].sort((a, b) =>
    (a.created_at as string).localeCompare(b.created_at as string)
  );

  const timeline: DashboardMetrics["timeline"] = [];
  let cumulative_energy_saved = 0;

  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i];
    const energy = item.energy_kwh as number;
    const co2 = item.co2_kg as number;
    const isCacheHit = item.cache_hit as boolean;
    const model = item.model_used as string;

    total_energy_kwh += energy;
    total_co2_kg += co2;

    if (isCacheHit) {
      cache_hits++;
    } else if (model === "haiku") {
      small_model_count++;
    } else {
      large_model_count++;
    }

    // Energy saved = large model cost minus actual cost
    const saved = ENERGY.large_model_kwh - energy;
    energy_saved_kwh += saved;
    cumulative_energy_saved += saved;

    timeline.push({
      query_number: i + 1,
      cumulative_energy_saved,
    });
  }

  const total_queries = items.length;
  const cache_hit_rate =
    total_queries > 0 ? (cache_hits / total_queries) * 100 : 0;
  const co2_saved_kg = energy_saved_kwh * ENERGY.grid_emission_factor;

  return {
    total_queries,
    cache_hits,
    cache_hit_rate,
    small_model_count,
    large_model_count,
    total_energy_kwh,
    total_co2_kg,
    energy_saved_kwh,
    co2_saved_kg,
    timeline,
    distribution: {
      cache_hits,
      small_model: small_model_count,
      large_model: large_model_count,
    },
  };
}
