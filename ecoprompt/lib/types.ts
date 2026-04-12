export type Message = {
  role: 'user' | 'assistant';
  content: string;
  model_used?: 'haiku' | 'sonnet' | 'cache';
  cache_hit?: boolean;
  energy_kwh?: number;
  response_time_ms?: number;
};

export type DashboardMetrics = {
  total_queries: number;
  cache_hits: number;
  cache_hit_rate: number;
  small_model_count: number;
  large_model_count: number;
  total_energy_kwh: number;
  total_co2_kg: number;
  energy_saved_kwh: number;
  co2_saved_kg: number;
  timeline: { query_number: number; cumulative_energy_saved: number }[];
  distribution: { cache_hits: number; small_model: number; large_model: number };
};

export type QueryResponse = {
  answer: string;
  model_used: string;
  cache_hit: boolean;
  energy_kwh: number;
  co2_kg: number;
  response_time_ms: number;
};
