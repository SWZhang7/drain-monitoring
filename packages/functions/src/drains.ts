import { Handler } from "aws-lambda"
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, ScanCommand, GetCommand, UpdateCommand, QueryCommand } from "@aws-sdk/lib-dynamodb"
import { Resource } from "sst"

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}))

export const list: Handler = async () => {
  try {
    const result = await docClient.send(new ScanCommand({ TableName: Resource.Drains.name }))
    const items = (result.Items || []).map(({ D_Id, publicName, latitude, longitude, height }) => ({
      D_Id, publicName, latitude, longitude, height,
    }))
    return jsonResponse(200, items)
  } catch (err) {
    console.error("list drains error:", err)
    return jsonResponse(500, { error: "Internal server error" })
  }
}

export const listPrivate: Handler = async () => {
  try {
    const result = await docClient.send(new ScanCommand({ TableName: Resource.Drains.name }))
    const ONLINE_THRESHOLD_MS = 5 * 60 * 1000
    const now = Date.now()
    const items = (result.Items || []).map((item) => ({
      D_Id: item.D_Id,
      publicName: item.publicName,
      privateName: item.privateName ?? null,
      latitude: item.latitude,
      longitude: item.longitude,
      height: item.height ?? null,
      operatorEmail: item.operatorEmail ?? null,
      sentimentScore: item.sentimentScore ?? null,
      reportCount: item.reportCount ?? 0,
      lastSeen: item.lastSeen ?? null,
      online: item.lastSeen != null && (now - item.lastSeen) < ONLINE_THRESHOLD_MS,
      fillPercent: item.fillPercent ?? null,
      co2Ppm: item.co2Ppm ?? null,
      alertSince: item.alertSince ?? null,
      alreadyAlerted: item.alreadyAlerted ?? false,
    }))
    return jsonResponse(200, items)
  } catch (err) {
    console.error("list private drains error:", err)
    return jsonResponse(500, { error: "Internal server error" })
  }
}

export const get: Handler = async (event) => {
  try {
    const id = event.pathParameters?.id
    if (!id) return jsonResponse(400, { error: "Missing drain id" })

    const result = await docClient.send(
      new GetCommand({ TableName: Resource.Drains.name, Key: { D_Id: id } })
    )

    if (!result.Item) return jsonResponse(404, { error: "Drain not found" })

    const { D_Id, publicName, latitude, longitude } = result.Item
    return jsonResponse(200, { D_Id, publicName, latitude, longitude })
  } catch (err) {
    console.error("get drain error:", err)
    return jsonResponse(500, { error: "Internal server error" })
  }
}

export const listMessages: Handler = async (event) => {
  try {
    const id = event.pathParameters?.id
    if (!id) return jsonResponse(400, { error: "Missing drain id" })

    const result = await docClient.send(new QueryCommand({
      TableName: Resource.DrainMessages.name,
      KeyConditionExpression: "D_Id = :id",
      ExpressionAttributeValues: { ":id": id },
      ScanIndexForward: false, // newest first
    }))

    const items = (result.Items ?? []).map((item) => ({
      Event_Key: item.Event_Key,
      eventType: item.eventType,
      message: item.message,
      name: item.name ?? "Anonymous",
      createdAt: item.createdAt,
      sentiment: item.sentiment ?? null,
    }))

    return jsonResponse(200, items)
  } catch (err) {
    console.error("list messages error:", err)
    return jsonResponse(500, { error: "Internal server error" })
  }
}

export const patch: Handler = async (event) => {
  try {
    const id = event.pathParameters?.id
    if (!id) return jsonResponse(400, { error: "Missing drain id" })

    const body = JSON.parse(event.body || "{}")
    const { operatorEmail } = body

    await docClient.send(new UpdateCommand({
      TableName: Resource.Drains.name,
      Key: { D_Id: id },
      UpdateExpression: "SET operatorEmail = :email",
      ExpressionAttributeValues: { ":email": operatorEmail ?? null },
    }))

    return jsonResponse(200, { success: true })
  } catch (err) {
    console.error("patch drain error:", err)
    return jsonResponse(500, { error: "Internal server error" })
  }
}

export const resetSentiment: Handler = async (event) => {
  try {
    const id = event.pathParameters?.id
    if (!id) return jsonResponse(400, { error: "Missing drain id" })

    await docClient.send(new UpdateCommand({
      TableName: Resource.Drains.name,
      Key: { D_Id: id },
      UpdateExpression: "SET sentimentScore = :score",
      ExpressionAttributeValues: { ":score": 10 },
    }))

    return jsonResponse(200, { success: true })
  } catch (err) {
    console.error("reset sentiment error:", err)
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
