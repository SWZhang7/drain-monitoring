// DynamoDB tables for heartbeat and sensor data monitoring

export const heartbeatTable = new sst.aws.Dynamo("SensorHeartbeat", {
  fields: {
    SensorId: "string",
    Timestamp: "number",
  },
  primaryIndex: { hashKey: "SensorId", rangeKey: "Timestamp" },
  ttl: "Timestamp",
});

export const sensorDataTable = new sst.aws.Dynamo("SensorData", {
  fields: {
    SensorId: "string",
    Timestamp: "number",
  },
  primaryIndex: { hashKey: "SensorId", rangeKey: "Timestamp" },
  ttl: "Timestamp",
});

export const wsConnectionsTable = new sst.aws.Dynamo("WebSocketConnections", {
  fields: {
    ConnectionId: "string",
  },
  primaryIndex: { hashKey: "ConnectionId" },
});
