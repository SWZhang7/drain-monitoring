import { drainsTable, drainMessagesTable } from "./storage"

const dbPermissions = [{ actions: ["dynamodb:*"], resources: ["*"] }]
const comprehendPermissions = [{ actions: ["comprehend:DetectSentiment"], resources: ["*"] }]
const sesPermissions = [{ actions: ["ses:SendEmail"], resources: ["*"] }]

export const sesFromEmail = new sst.Secret("SesFromEmail")

export const api = new sst.aws.ApiGatewayV2("MyApi", { cors: true })

// Drains
api.route("GET /drains", {
  handler: "packages/functions/src/drains.list",
  link: [drainsTable],
  permissions: dbPermissions,
})

api.route("GET /drains/{id}", {
  handler: "packages/functions/src/drains.get",
  link: [drainsTable],
  permissions: dbPermissions,
})

// Reports
api.route("POST /reports", {
  handler: "packages/functions/src/reports.create",
  link: [drainMessagesTable, drainsTable],
  permissions: [...dbPermissions, ...comprehendPermissions],
})

// Volunteers — sends SES email to drain operator
api.route("POST /volunteers", {
  handler: "packages/functions/src/volunteers.create",
  link: [drainsTable, sesFromEmail],
  permissions: [...dbPermissions, ...sesPermissions],
})

// Sensor data — receives water level readings, computes fill %, alerts operator
api.route("POST /sensor-data", {
  handler: "packages/functions/src/sensorData.handler",
  link: [drainsTable, sesFromEmail],
  permissions: [...dbPermissions, ...sesPermissions],
})

// Heartbeat — device pings to update lastSeen
api.route("POST /heartbeat", {
  handler: "packages/functions/src/heartbeat.handler",
  link: [drainsTable],
  permissions: dbPermissions,
})
