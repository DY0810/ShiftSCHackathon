import { NextResponse } from "next/server";
import { invokeModel } from "@/lib/bedrock";
import { deduplicate } from "@/lib/dedup";
import { storeEntry } from "@/lib/vectorStore";

export async function POST(request: Request) {
  const { prompt } = await request.json();

  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }

  const start = Date.now();

  try {
    const dedup = await deduplicate(prompt);

    if (dedup.hit) {
      return NextResponse.json({
        answer: dedup.response,
        model_used: "cache",
        cache_hit: true,
        energy_kwh: 0,
        response_time_ms: Date.now() - start,
      });
    }

    const answer = await invokeModel(prompt);
    const response_time_ms = Date.now() - start;

    await storeEntry(prompt, dedup.embedding, answer, "haiku");

    return NextResponse.json({
      answer,
      model_used: "haiku",
      cache_hit: false,
      energy_kwh: 0.007,
      response_time_ms,
    });
  } catch (error: unknown) {
    console.error("Query error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to process query";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
