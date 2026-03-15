import { Handler } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { Resource } from "sst";

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

export const handler: Handler = async (event: any) => {
  console.log("WsConnect invoked");
  console.log("Table name:", Resource.WebSocketConnections.name);
  
  try {
    const connectionId = event.requestContext?.connectionId;
    console.log("Connection ID:", connectionId);

    if (!connectionId) {
      console.log("Missing connectionId");
      return { statusCode: 400, body: "Missing connectionId" };
    }

    console.log("Writing to DynamoDB...");
    await docClient.send(
      new PutCommand({
        TableName: Resource.WebSocketConnections.name,
        Item: {
          ConnectionId: connectionId,
          ConnectedAt: new Date().toISOString(),
        },
      })
    );
    
    console.log("Write successful");
    return { statusCode: 200, body: "Connected" };
  } catch (error: any) {
    console.error("ERROR:", error.message);
    console.error("Full error:", JSON.stringify(error, null, 2));
    return { statusCode: 500, body: "Failed to connect" };
  }
};