import { Handler } from "aws-lambda"
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb"
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"
import { Resource } from "sst"

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}))
const ses = new SESClient({})

export const create: Handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}")
    const { D_Id, name, contact, availability } = body

    if (!D_Id || !name || !contact) {
      return jsonResponse(400, { error: "D_Id, name, and contact are required" })
    }

    const drain = await docClient.send(
      new GetCommand({ TableName: Resource.Drains.name, Key: { D_Id } })
    )

    if (!drain.Item) return jsonResponse(404, { error: "Drain not found" })

    const operatorEmail = drain.Item.operatorEmail
    if (!operatorEmail) return jsonResponse(500, { error: "No operator assigned to this drain" })

    await ses.send(new SendEmailCommand({
      Source: Resource.SesFromEmail.value,
      Destination: { ToAddresses: [operatorEmail] },
      Message: {
        Subject: { Data: `Volunteer offer for ${drain.Item.publicName}` },
        Body: {
          Text: {
            Data: [
              `Someone wants to volunteer to fix a drain in your area.`,
              ``,
              `Drain: ${drain.Item.publicName} (${D_Id})`,
              `Name: ${name}`,
              `Contact: ${contact}`,
              availability ? `Availability: ${availability}` : null,
            ].filter(Boolean).join("\n"),
          },
        },
      },
    }))

    return jsonResponse(200, { success: true })
  } catch (err) {
    console.error("create volunteer error:", err)
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
