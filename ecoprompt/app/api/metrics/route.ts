import { NextResponse } from "next/server";
import { getAggregatedMetrics } from "@/lib/metrics";

export async function GET() {
  const metrics = await getAggregatedMetrics();
  return NextResponse.json(metrics);
}
