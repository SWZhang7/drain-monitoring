import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";
import { Resource } from "sst";

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

export async function broadcastMessage(payload: any) {
  const wsEndpoint = process.env.WS_ENDPOINT;

  if (!wsEndpoint) {
    throw new Error("Missing WS_ENDPOINT");
  }

  const apiClient = new ApiGatewayManagementApiClient({
    endpoint: wsEndpoint,
  });

  const result = await docClient.send(
    new ScanCommand({
      TableName: Resource.WebSocketConnections.name,
    })
  );

  const connections = result.Items || [];

  await Promise.all(
    connections.map(async (item: any) => {
      const connectionId = item.ConnectionId;

      try {
        await apiClient.send(
          new PostToConnectionCommand({
            ConnectionId: connectionId,
            Data: Buffer.from(JSON.stringify(payload)),
          })
        );
      } catch (error: any) {
        if (error.$metadata?.httpStatusCode === 410) {
          await docClient.send(
            new DeleteCommand({
              TableName: Resource.WebSocketConnections.name,
              Key: { ConnectionId: connectionId },
            })
          );
        } else {
          console.error("Broadcast error:", error);
        }
      }
    })
  );
}