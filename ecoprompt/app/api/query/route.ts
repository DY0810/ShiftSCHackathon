import { NextResponse } from "next/server";
import { invokeModel } from "@/lib/bedrock";
import { classifyComplexity, MODEL_IDS } from "@/lib/classifier";
import { deduplicate } from "@/lib/dedup";
import { storeEntry } from "@/lib/vectorStore";
import { estimateEnergy, logMetric } from "@/lib/metrics";

export const maxDuration = 60;

export async function POST(request: Request) {
  const { prompt } = await request.json();

  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }

  const start = Date.now();

  try {
    const dedup = await deduplicate(prompt);

    if (dedup.hit) {
      const response_time_ms = Date.now() - start;
      const { energy_kwh, co2_kg } = estimateEnergy(true, "cache");

      await logMetric({
        prompt_preview: prompt.slice(0, 100),
        cache_hit: true,
        model_used: "cache",
        energy_kwh,
        co2_kg,
        response_time_ms,
      });

      return NextResponse.json({
        answer: dedup.response,
        model_used: "cache",
        cache_hit: true,
        energy_kwh,
        co2_kg,
        response_time_ms,
      });
    }

    const tier = classifyComplexity(prompt);
    const modelId = MODEL_IDS[tier];
    const modelLabel = tier === "simple" ? "haiku" : "sonnet";

    const answer = await invokeModel(prompt, modelId);
    const response_time_ms = Date.now() - start;
    const { energy_kwh, co2_kg } = estimateEnergy(false, modelLabel);

    await storeEntry(prompt, dedup.embedding, answer, modelLabel);

    await logMetric({
      prompt_preview: prompt.slice(0, 100),
      cache_hit: false,
      model_used: modelLabel,
      energy_kwh,
      co2_kg,
      response_time_ms,
    });

    return NextResponse.json({
      answer,
      model_used: modelLabel,
      cache_hit: false,
      energy_kwh,
      co2_kg,
      response_time_ms,
    });
  } catch (error: unknown) {
    console.error("Query error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to process query";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
