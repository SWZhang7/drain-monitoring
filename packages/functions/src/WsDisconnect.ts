import { Handler } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { Resource } from "sst";

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

export const handler: Handler = async (event: any) => {
  try {
    const connectionId = event.requestContext?.connectionId;

    if (!connectionId) {
      return { statusCode: 400, body: "Missing connectionId" };
    }

    await docClient.send(
      new DeleteCommand({
        TableName: Resource.WebSocketConnections.name,
        Key: {
          ConnectionId: connectionId,
        },
      })
    );

    return { statusCode: 200, body: "Disconnected" };
  } catch (error: any) {
    console.error("WebSocket disconnect error:", error);
    return { statusCode: 500, body: "Failed to disconnect" };
  }
};