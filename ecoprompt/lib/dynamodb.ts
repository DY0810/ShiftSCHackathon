import { DynamoDBClient, DescribeTableCommand, CreateTableCommand, type KeySchemaElement } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const rawClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

export const docClient = DynamoDBDocumentClient.from(rawClient);

const ensuredTables = new Set<string>();

export async function ensureTable(
  tableName: string,
  keySchema: KeySchemaElement[]
): Promise<void> {
  if (ensuredTables.has(tableName)) return;

  try {
    await rawClient.send(new DescribeTableCommand({ TableName: tableName }));
    ensuredTables.add(tableName);
    return;
  } catch (err: unknown) {
    if (!(err instanceof Error && err.name === "ResourceNotFoundException")) throw err;
  }

  try {
    await rawClient.send(
      new CreateTableCommand({
        TableName: tableName,
        KeySchema: keySchema,
        AttributeDefinitions: keySchema.map((k) => ({
          AttributeName: k.AttributeName!,
          AttributeType: "S",
        })),
        BillingMode: "PAY_PER_REQUEST",
      })
    );
  } catch (err: unknown) {
    if (!(err instanceof Error && err.name === "ResourceInUseException")) throw err;
  }

  // Poll until ACTIVE
  for (let i = 0; i < 30; i++) {
    const desc = await rawClient.send(new DescribeTableCommand({ TableName: tableName }));
    if (desc.Table?.TableStatus === "ACTIVE") {
      ensuredTables.add(tableName);
      return;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  ensuredTables.add(tableName);
}
