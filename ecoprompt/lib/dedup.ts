import { generateEmbedding } from "./bedrock";
import { searchSimilar } from "./vectorStore";

export async function deduplicate(prompt: string): Promise<{
  hit: boolean;
  response?: string;
  similarity?: number;
  embedding: number[];
}> {
  const embedding = await generateEmbedding(prompt);
  const result = await searchSimilar(embedding);

  if (result.hit) {
    return {
      hit: true,
      response: result.response,
      similarity: result.similarity,
      embedding,
    };
  }

  return { hit: false, embedding };
}
