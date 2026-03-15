import { Handler } from "aws-lambda"
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb"
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"
import { Resource } from "sst"
import { broadcastMessage } from "./WsBroadcast"

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}))
const ses = new SESClient({})

const ALERT_THRESHOLD = 80
const SUSTAINED_MS = 10 * 60 * 1000

export const handler: Handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}")
    const { drainId, waterLevelCm } = body

    if (!drainId || waterLevelCm === undefined) {
      return jsonResponse(400, { error: "drainId and waterLevelCm are required" })
    }

    const drainResult = await docClient.send(
      new GetCommand({ TableName: Resource.Drains.name, Key: { D_Id: drainId } })
    )

    if (!drainResult.Item) return jsonResponse(404, { error: "Drain not found" })

    const drain = drainResult.Item
    const drainHeightCm: number = drain.height
    if (!drainHeightCm) return jsonResponse(400, { error: "Drain has no height configured" })

    const fillPercent = Math.min(100, Math.round((waterLevelCm / drainHeightCm) * 100))
    const now = Date.now()
    const isHigh = fillPercent >= ALERT_THRESHOLD

    const drainStatus: "normal" | "elevated" | "critical" =
      fillPercent >= 80 ? "critical" :
      fillPercent >= 60 ? "elevated" :
      "normal"

    const alertSince: number | null = isHigh
      ? (drain.alertSince ?? now)
      : null

    const sustainedAlert = isHigh && alertSince !== null && (now - alertSince) >= SUSTAINED_MS
    const alreadyAlerted: boolean = drain.alreadyAlerted ?? false
    const newAlerted = sustainedAlert ? true : (isHigh ? alreadyAlerted : false)

    await docClient.send(new UpdateCommand({
      TableName: Resource.Drains.name,
      Key: { D_Id: drainId },
      UpdateExpression: "SET alertSince = :alertSince, alreadyAlerted = :alerted, fillPercent = :fill, drainStatus = :status",
      ExpressionAttributeValues: {
        ":alertSince": alertSince,
        ":alerted": newAlerted,
        ":fill": fillPercent,
        ":status": drainStatus,
      },
    }))

    await broadcastMessage({
      type: "sensor-data",
      drainId,
      fillPercent,
      drainStatus,
      waterLevelCm,
      timestamp: now,
    })

    if (sustainedAlert && !alreadyAlerted && drain.operatorEmail) {
      await ses.send(new SendEmailCommand({
        Source: Resource.SesFromEmail.value,
        Destination: { ToAddresses: [drain.operatorEmail] },
        Message: {
          Subject: { Data: `ALERT: ${drain.publicName} is ${fillPercent}% full` },
          Body: {
            Text: {
              Data: [
                `Drain: ${drain.publicName} (${drainId})`,
                `Current fill: ${fillPercent}% (${waterLevelCm}cm of ${drainHeightCm}cm)`,
                `Has been above ${ALERT_THRESHOLD}% for over 10 minutes.`,
                `Action required.`,
              ].join("\n"),
            },
          },
        },
      }))
    }

    return jsonResponse(200, { success: true, fillPercent })
  } catch (err) {
    console.error("sensor data error:", err)
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