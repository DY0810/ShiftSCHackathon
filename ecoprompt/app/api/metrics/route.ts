import { NextResponse } from "next/server";
import { getAggregatedMetrics } from "@/lib/metrics";
import { isRateLimited, extractClientIp } from "@/lib/rateLimit";

export async function GET(request: Request) {
  const ip = extractClientIp(request);
  if (await isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429 }
    );
  }

  const metrics = await getAggregatedMetrics();
  return NextResponse.json(metrics);
}
