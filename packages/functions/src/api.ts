import { Handler } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  ComprehendClient,
  DetectSentimentCommand,
} from "@aws-sdk/client-comprehend";

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const comprehend = new ComprehendClient({});

const DRAINS_TABLE = "Drains";
const REPORTS_TABLE = "DrainEvents";

export const handler: Handler = async (event: any) => {
  const rawMethod =
    event.requestContext?.http?.method ||
    event.httpMethod ||
    "GET";

  const method = String(rawMethod).toUpperCase();

  const rawPath = event.rawPath || event.path || "/";
  const path = rawPath.replace(/\/+$/, "") || "/";

  console.log("DEBUG:", { method, rawPath, path });


  try {
    if (method === "OPTIONS") {
      return jsonResponse(200, { ok: true });
    }

    // Health check
    if (method === "GET" && path === "/") {
      return jsonResponse(200, {
        message: "Drain monitoring API is running",
      });
    }

    // GET /drains
    if (method === "GET" && path === "/drains") {
      const result = await docClient.send(
        new ScanCommand({
          TableName: DRAINS_TABLE,
        })
      );

      return jsonResponse(200, result.Items || []);
    }

    // GET /drains/{id}
    if (method === "GET" && path.startsWith("/drains/")) {
      const id = event.pathParameters?.id || path.split("/")[2];

      if (!id) {
        return jsonResponse(400, { error: "Missing drain id" });
      }

      const result = await docClient.send(
        new GetCommand({
          TableName: DRAINS_TABLE,
          Key: { D_Id: id },
        })
      );

      if (!result.Item) {
        return jsonResponse(404, { error: "Drain not found" });
      }

      return jsonResponse(200, result.Item);
    }

    // POST /reports
    if (method === "POST" && path === "/reports") {
      const body = JSON.parse(event.body || "{}");

      const D_Id = body.D_Id;
      const message = body.message;

      if (!D_Id || !message) {
        return jsonResponse(400, {
          error: "D_Id and message are required",
        });
      }

      const now = new Date().toISOString();

      const sentimentResult = await comprehend.send(
        new DetectSentimentCommand({
          LanguageCode: "en",
          Text: message,
        })
      );

      const reportItem = {
        D_Id,
        Event_Key: `REPORT#${now}`,
        eventType: "REPORT",
        message,
        createdAt: now,
        sentiment: sentimentResult.Sentiment || "NEUTRAL",
        sentimentScore: sentimentResult.SentimentScore || null,
      };


      await docClient.send(
        new PutCommand({
          TableName: REPORTS_TABLE,
          Item: reportItem,
        })
      );

      return jsonResponse(200, {
        success: true,
        report: reportItem,
      });
    }

    return jsonResponse(404, { error: "Route not found" });
  } catch (error: any) {
    console.error("API error:", error);

    return jsonResponse(500, {
      error: "Internal server error",
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
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
    },
    body: JSON.stringify(body),
  };
}
