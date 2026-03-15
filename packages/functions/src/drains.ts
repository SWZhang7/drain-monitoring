import { Handler } from "aws-lambda"
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, ScanCommand, GetCommand } from "@aws-sdk/lib-dynamodb"
import { Resource } from "sst"

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}))

export const list: Handler = async () => {
  try {
    const result = await docClient.send(new ScanCommand({ TableName: Resource.Drains.name }))
    return jsonResponse(200, result.Items || [])
  } catch (err) {
    console.error("list drains error:", err)
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
    return jsonResponse(200, result.Item)
  } catch (err) {
    console.error("get drain error:", err)
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
