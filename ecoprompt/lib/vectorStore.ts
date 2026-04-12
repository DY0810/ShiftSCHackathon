import { ScanCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, ensureTable } from "./dynamodb";

const QUERY_CACHE_TABLE = "ecoprompt-query-cache";

let tableReady: Promise<void> | null = null;

function ensureCacheTable() {
  if (!tableReady) {
    tableReady = ensureTable(QUERY_CACHE_TABLE, [
      { AttributeName: "id", KeyType: "HASH" },
    ]);
  }
  return tableReady;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0,
    magA = 0,
    magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

export async function searchSimilar(
  embedding: number[],
  threshold: number = 0.80
): Promise<{ hit: true; response: string; similarity: number } | { hit: false }> {
  await ensureCacheTable();

  const result = await docClient.send(
    new ScanCommand({ TableName: QUERY_CACHE_TABLE })
  );

  if (!result.Items || result.Items.length === 0) return { hit: false };

  let bestSimilarity = -1;
  let bestResponse = "";

  for (const item of result.Items) {
    const storedEmbedding = item.embedding as number[];
    const similarity = cosineSimilarity(embedding, storedEmbedding);
    if (similarity > bestSimilarity) {
      bestSimilarity = similarity;
      bestResponse = item.response as string;
    }
  }

  if (bestSimilarity >= threshold) {
    return { hit: true, response: bestResponse, similarity: bestSimilarity };
  }

  return { hit: false };
}

export async function storeEntry(
  prompt: string,
  embedding: number[],
  response: string,
  model_used: string
): Promise<void> {
  await ensureCacheTable();

  await docClient.send(
    new PutCommand({
      TableName: QUERY_CACHE_TABLE,
      Item: {
        id: crypto.randomUUID(),
        prompt,
        embedding,
        response,
        model_used,
        created_at: new Date().toISOString(),
      },
    })
  );
}
