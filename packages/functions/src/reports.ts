import { Handler } from "aws-lambda"
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import {
  DynamoDBDocumentClient, PutCommand, UpdateCommand,
  GetCommand, QueryCommand, DeleteCommand,
} from "@aws-sdk/lib-dynamodb"
import { ComprehendClient, DetectSentimentCommand } from "@aws-sdk/client-comprehend"
import { Resource } from "sst"

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}))
const comprehend = new ComprehendClient({})
const MAX_MESSAGES = 20

function sentimentToScore(scores: Record<string, number>): number {
  const pos = scores.Positive ?? 0
  const neu = scores.Neutral ?? 0
  const raw = (pos * 10) + (neu * 5)
  return Math.round(Math.min(10, Math.max(0, raw)))
}

export const create: Handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}")
    const { D_Id, message, name } = body

    if (!D_Id || !message) {
      return jsonResponse(400, { error: "D_Id and message are required" })
    }

    const now = new Date().toISOString()

    const sentimentResult = await comprehend.send(
      new DetectSentimentCommand({ LanguageCode: "en", Text: message })
    )

    const sentiment = sentimentResult.Sentiment ?? "NEUTRAL"
    const sentimentScores = sentimentResult.SentimentScore as Record<string, number> ?? {}
    const newScore = sentimentToScore(sentimentScores)

    const item = {
      D_Id,
      message,
      name: name || null,
      createdAt: now,
      sentiment,
      sentimentScore: sentimentScores,
    }

    await docClient.send(new PutCommand({ TableName: Resource.DrainMessages.name, Item: item }))

    const all = await docClient.send(new QueryCommand({
      TableName: Resource.DrainMessages.name,
      KeyConditionExpression: "D_Id = :id",
      ExpressionAttributeValues: { ":id": D_Id },
      ScanIndexForward: true,
    }))

    const items = all.Items ?? []
    if (items.length > MAX_MESSAGES) {
      const toDelete = items.slice(0, items.length - MAX_MESSAGES)
      await Promise.all(toDelete.map((i) =>
        docClient.send(new DeleteCommand({
          TableName: Resource.DrainMessages.name,
          Key: { D_Id: i.D_Id, Event_Key: i.Event_Key },
        }))
      ))
    }

    const drain = await docClient.send(
      new GetCommand({ TableName: Resource.Drains.name, Key: { D_Id } })
    )

    if (drain.Item) {
      const current = drain.Item.sentimentScore ?? 5
      const count = drain.Item.reportCount ?? 0
      const updated = Math.round(((current * count) + newScore) / (count + 1))

      await docClient.send(new UpdateCommand({
        TableName: Resource.Drains.name,
        Key: { D_Id },
        UpdateExpression: "SET sentimentScore = :score, reportCount = :count",
        ExpressionAttributeValues: { ":score": updated, ":count": count + 1 },
      }))
    }

    return jsonResponse(200, { success: true, report: item, sentimentScore: newScore })
  } catch (err) {
    console.error("create report error:", err)
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
