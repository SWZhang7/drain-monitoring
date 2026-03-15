/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "drain-monitoring",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {
    const storage = await import("./infra/storage");
    const database = await import("./infra/database");
    const cognito = await import("./infra/cognito");
    const messaging = await import("./infra/messaging");
    await import("./infra/api");
    await import("./infra/AdminSeed");

    return {
      MyBucket: storage.bucket.name,
      HeartbeatTable: database.heartbeatTable.name,
      SensorDataTable: database.sensorDataTable.name,
      UserPoolId: cognito.userPool.id,
      UserPoolArn: cognito.userPool.arn,
    };
  },
});
