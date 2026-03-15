import { Handler } from "aws-lambda"
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb"
import { Resource } from "sst"
import { broadcastMessage } from "./WsBroadcast"

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}))

export const handler: Handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}")
    const { drainId } = body

    if (!drainId) return jsonResponse(400, { error: "drainId is required" })

    const now = Date.now()

    await docClient.send(new UpdateCommand({
      TableName: Resource.Drains.name,
      Key: { D_Id: drainId },
      ConditionExpression: "attribute_exists(D_Id)",
      UpdateExpression: "SET lastSeen = :now",
      ExpressionAttributeValues: { ":now": now },
    }))

    await broadcastMessage({
      type: "heartbeat",
      drainId,
      lastSeen: now,
      status: "online",
    })

    return jsonResponse(200, { success: true })
  } catch (err) {
    console.error("heartbeat error:", err)
    return jsonResponse(500, { error: "Internal server error" })
  }
}

function jsonResponse(statusCode: number, body: unknown) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify(body),
  }
}