import { NextResponse } from "next/server";
import { docClient } from "@/lib/dynamodb";
import { ScanCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { isRateLimited, extractClientIp } from "@/lib/rateLimit";

const TABLES = ["ecoprompt-query-cache", "ecoprompt-query-metrics"];

async function clearTable(tableName: string) {
  try {
    const scan = await docClient.send(
      new ScanCommand({ TableName: tableName, ProjectionExpression: "id" })
    );
    const items = scan.Items ?? [];
    for (const item of items) {
      await docClient.send(
        new DeleteCommand({ TableName: tableName, Key: { id: item.id } })
      );
    }
    return items.length;
  } catch {
    return 0;
  }
}

export async function POST(request: Request) {
  const ip = extractClientIp(request);
  if (await isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429 }
    );
  }

  let totalDeleted = 0;
  for (const table of TABLES) {
    totalDeleted += await clearTable(table);
  }
  return NextResponse.json({ cleared: true, itemsDeleted: totalDeleted });
}
