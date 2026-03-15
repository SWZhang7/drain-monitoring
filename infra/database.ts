/// <reference path="./sst.d.ts" />

// DynamoDB tables for heartbeat and sensor data monitoring

export const heartbeatTable = new sst.aws.Dynamodb("SensorHeartbeat", {
  fields: {
    SensorId: "string",
    LastHeartbeat: "string",
    Timestamp: "number",
    Status: "string",
  },
  primaryIndex: { hashKey: "SensorId", rangeKey: "Timestamp" },
  ttl: "Timestamp",
});

export const sensorDataTable = new sst.aws.Dynamodb("SensorData", {
  fields: {
    SensorId: "string",
    Timestamp: "number",
    Level: "number",
    Location: "string",
    ReceivedAt: "string",
  },
  primaryIndex: { hashKey: "SensorId", rangeKey: "Timestamp" },
  ttl: "Timestamp",
});
