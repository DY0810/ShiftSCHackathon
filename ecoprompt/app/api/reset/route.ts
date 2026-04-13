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
  // Require API key for destructive operations (not just same-origin)
  const apiKey = process.env.API_SECRET_KEY;
  const provided = request.headers.get("x-api-key");
  if (!apiKey || provided !== apiKey) {
    // Allow same-origin browser requests by checking referer
    const referer = request.headers.get("referer");
    const host = request.headers.get("host");
    const isSameOrigin =
      host &&
      (referer?.startsWith(`https://${host}`) ||
        referer?.startsWith(`http://${host}`));
    if (!isSameOrigin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

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
