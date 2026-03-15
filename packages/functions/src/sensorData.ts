import { Handler } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const sesClient = new SESClient({});

const SENSOR_DATA_TABLE = "SensorData";
const ALERT_THRESHOLD = 80; // Threshold percentage for alerts
const SUSTAINED_DURATION_MINUTES = 10; // Duration to check for sustained high levels
const OPERATOR_EMAIL = process.env.OPERATOR_EMAIL || "operator@example.com";

export const handler: Handler = async (event: any) => {
  try {
    const body = JSON.parse(event.body || "{}");

    const { sensorId, level, location } = body;

    if (!sensorId || level === undefined) {
      return jsonResponse(400, {
        error: "Missing required fields: sensorId, level",
      });
    }

    if (level < 0 || level > 100) {
      return jsonResponse(400, {
        error: "Level must be between 0 and 100",
      });
    }

    const now = new Date().toISOString();
    const timestamp = Date.now();

    // Save sensor data
    const sensorDataItem = {
      SensorId: sensorId,
      Timestamp: timestamp,
      Level: level,
      Location: location || "Unknown",
      ReceivedAt: now,
    };

    await docClient.send(
      new PutCommand({
        TableName: SENSOR_DATA_TABLE,
        Item: sensorDataItem,
      })
    );

    // Check if level is sustained high
    if (level >= ALERT_THRESHOLD) {
      const tenMinutesAgo = timestamp - SUSTAINED_DURATION_MINUTES * 60 * 1000;

      const result = await docClient.send(
        new QueryCommand({
          TableName: SENSOR_DATA_TABLE,
          KeyConditionExpression: "SensorId = :sensorId AND #ts > :startTime",
          ExpressionAttributeNames: {
            "#ts": "Timestamp",
          },
          ExpressionAttributeValues: {
            ":sensorId": sensorId,
            ":startTime": tenMinutesAgo,
          },
        })
      );

      const highLevelReadings = result.Items?.filter(
        (item: any) => item.Level >= ALERT_THRESHOLD
      ) || [];

      // If most readings in the past 10 minutes are high, send alert
      const totalReadings = result.Items?.length || 0;
      const highReadingPercentage = totalReadings > 0
        ? (highLevelReadings.length / totalReadings) * 100
        : 0;

      if (highReadingPercentage >= 80 && totalReadings >= 3) {
        await sendAlert(sensorId, location, level, highReadingPercentage);
      }
    }

    return jsonResponse(200, {
      success: true,
      message: `Sensor data recorded for sensor ${sensorId}`,
      data: sensorDataItem,
    });
  } catch (error: any) {
    console.error("Sensor data error:", error);

    return jsonResponse(500, {
      error: "Failed to process sensor data",
      details: error.message,
    });
  }
};

async function sendAlert(
  sensorId: string,
  location: string,
  currentLevel: number,
  highReadingPercentage: number
) {
  try {
    const emailCommand = new SendEmailCommand({
      Source: OPERATOR_EMAIL,
      Destination: {
        ToAddresses: [OPERATOR_EMAIL],
      },
      Message: {
        Subject: {
          Data: `ALERT: Sustained High Water Level - Sensor ${sensorId}`,
          Charset: "UTF-8",
        },
        Body: {
          Text: {
            Data: `
WATER LEVEL ALERT
==================
Sensor ID: ${sensorId}
Location: ${location}
Current Level: ${currentLevel}%
Sustained High Level: ${highReadingPercentage.toFixed(1)}% of recent readings
Threshold: ${ALERT_THRESHOLD}%

Action Required: Please check the sensor location immediately.
            `,
            Charset: "UTF-8",
          },
        },
      },
    });

    await sesClient.send(emailCommand);
    console.log(`Alert sent for sensor ${sensorId}`);
  } catch (error: any) {
    console.error("Failed to send alert email:", error);
    throw error;
  }
}

function jsonResponse(statusCode: number, body: any) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(body),
  };
}
