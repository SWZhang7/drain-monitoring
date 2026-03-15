import { Handler } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const CONNECTIONS_TABLE = "WebSocketConnections";

export const handler: Handler = async (event: any) => {
  try {
    const connectionId = event.requestContext?.connectionId;

    if (!connectionId) {
      return { statusCode: 400, body: "Missing connectionId" };
    }

    await docClient.send(
      new PutCommand({
        TableName: CONNECTIONS_TABLE,
        Item: {
          ConnectionId: connectionId,
          ConnectedAt: new Date().toISOString(),
        },
      })
    );

    return { statusCode: 200, body: "Connected" };
  } catch (error: any) {
    console.error("WebSocket connect error:", error);
    return { statusCode: 500, body: "Failed to connect" };
  }
};