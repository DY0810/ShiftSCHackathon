/**
 * DynamoDB-backed rate limiter.
 * Persists across Vercel serverless cold starts.
 */

import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
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
 * Uses DynamoDB atomic ADD (single operation, no race condition).
 * Fails CLOSED — if DynamoDB is unreachable, requests are blocked.
 */
export async function isRateLimited(ip: string): Promise<boolean> {
  await ensureRateLimitTable();

  const now = Math.floor(Date.now() / 1000);
  const windowKey = Math.floor(now / WINDOW_SECONDS);
  const id = `${ip}:${windowKey}`;
  const ttl = (windowKey + 1) * WINDOW_SECONDS + 60; // expire 60s after window ends

  try {
    // Atomic increment with condition check — no race condition
    await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id },
        UpdateExpression: "ADD #count :inc SET #ttl = if_not_exists(#ttl, :ttl)",
        ConditionExpression:
          "attribute_not_exists(#count) OR #count < :max",
        ExpressionAttributeNames: { "#count": "count", "#ttl": "ttl" },
        ExpressionAttributeValues: { ":inc": 1, ":ttl": ttl, ":max": MAX_REQUESTS },
      })
    );
    return false;
  } catch (err) {
    if (err instanceof ConditionalCheckFailedException) {
      // count >= MAX_REQUESTS — rate limited
      return true;
    }
    // DynamoDB unreachable — fail closed to protect AWS bill
    console.error("Rate limiter error:", (err as Error).message);
    return true;
  }
}
