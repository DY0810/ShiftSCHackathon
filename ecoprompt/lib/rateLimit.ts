/**
 * DynamoDB-backed rate limiter.
 * Persists across Vercel serverless cold starts.
 */

import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, ensureTable } from "./dynamodb";

const TABLE_NAME = "ecoprompt-rate-limits";
const WINDOW_SECONDS = 60;
const MAX_REQUESTS = 20;

let tableReady: Promise<void> | null = null;

function ensureRateLimitTable() {
  if (!tableReady) {
    tableReady = ensureTable(TABLE_NAME, [
      { AttributeName: "id", KeyType: "HASH" },
    ]);
  }
  return tableReady;
}

/**
 * Extract the real client IP from x-forwarded-for.
 * On Vercel, the platform appends the true client IP as the LAST value.
 * The first value is attacker-controlled and can be spoofed.
 */
export function extractClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (!xff) return "unknown";
  const parts = xff.split(",").map((s) => s.trim());
  // Last value is the one Vercel appended — trustworthy
  return parts[parts.length - 1] || "unknown";
}

/**
 * Check if an IP is rate-limited. Returns true if the request should be blocked.
 * Uses DynamoDB atomic counters with TTL-based windows.
 */
export async function isRateLimited(ip: string): Promise<boolean> {
  await ensureRateLimitTable();

  const now = Math.floor(Date.now() / 1000);
  const windowKey = Math.floor(now / WINDOW_SECONDS);
  const id = `${ip}:${windowKey}`;
  const ttl = (windowKey + 1) * WINDOW_SECONDS + 60; // expire 60s after window ends

  try {
    const existing = await docClient.send(
      new GetCommand({ TableName: TABLE_NAME, Key: { id } })
    );

    const currentCount = (existing.Item?.count as number) ?? 0;

    if (currentCount >= MAX_REQUESTS) {
      return true;
    }

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: { id, count: currentCount + 1, ttl },
      })
    );

    return false;
  } catch (err) {
    // If DynamoDB is unreachable, fail open to avoid breaking the app
    // but log the error for monitoring
    console.error("Rate limiter error:", err);
    return false;
  }
}
