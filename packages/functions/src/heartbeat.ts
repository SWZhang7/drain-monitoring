import { Handler } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const HEARTBEAT_TABLE = "SensorHeartbeat";

export const handler: Handler = async (event: any) => {
  try {
    const body = JSON.parse(event.body || "{}");

    const { sensorId } = body;

    if (!sensorId) {
      return jsonResponse(400, {
        error: "Missing required field: sensorId",
      });
    }

    const now = new Date().toISOString();
    const timestamp = Date.now();

    const heartbeatItem = {
      SensorId: sensorId,
      LastHeartbeat: now,
      Timestamp: timestamp,
      Status: "ACTIVE",
    };

    await docClient.send(
      new PutCommand({
        TableName: HEARTBEAT_TABLE,
        Item: heartbeatItem,
      })
    );

    return jsonResponse(200, {
      success: true,
      message: `Heartbeat recorded for sensor ${sensorId}`,
      data: heartbeatItem,
    });
  } catch (error: any) {
    console.error("Heartbeat error:", error);

    return jsonResponse(500, {
      error: "Failed to record heartbeat",
      details: error.message,
    });
  }
};

function jsonResponse(statusCode: number, body: any) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(body),
  };
}
