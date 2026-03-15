import { drainsTable, drainMessagesTable } from "./storage"
import { wsConnectionsTable } from "./database"
import { ws } from "./websocket"

const dbPermissions = [{ actions: ["dynamodb:*"], resources: ["*"] }]
const comprehendPermissions = [{ actions: ["comprehend:DetectSentiment"], resources: ["*"] }]
const sesPermissions = [{ actions: ["ses:SendEmail"], resources: ["*"] }]
const wsManagePermissions = [{ actions: ["execute-api:ManageConnections"], resources: ["*"] }]

export const sesFromEmail = new sst.Secret("SesFromEmail")

// HTTP API
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

// Admin — protected
api.route(
  "GET /admin/drains",
  { handler: "packages/functions/src/drains.listPrivate", link: [drainsTable], permissions: dbPermissions },
  { auth: { jwt: { authorizer: cognitoAuthorizer.id } } },
)

api.route(
  "GET /admin/drains/{id}/messages",
  { handler: "packages/functions/src/drains.listMessages", link: [drainsTable, drainMessagesTable], permissions: dbPermissions },
  { auth: { jwt: { authorizer: cognitoAuthorizer.id } } },
)

api.route(
  "POST /admin/drains/{id}/reset-sentiment",
  { handler: "packages/functions/src/drains.resetSentiment", link: [drainsTable], permissions: dbPermissions },
  { auth: { jwt: { authorizer: cognitoAuthorizer.id } } },
)

api.route(
  "PATCH /admin/drains/{id}",
  { handler: "packages/functions/src/drains.patch", link: [drainsTable], permissions: dbPermissions },
  { auth: { jwt: { authorizer: cognitoAuthorizer.id } } },
)

// Operator CRUD — admin only (group check enforced in Lambda)
const operatorHandler = {
  handler: "packages/functions/src/adminCrud.handler",
  environment: { COGNITO_USER_POOL_ID: userPool.id },
  permissions: cognitoPermissions,
}
api.route("GET /admin/operators", operatorHandler, { auth: { jwt: { authorizer: cognitoAuthorizer.id } } })
api.route("POST /admin/operators", operatorHandler, { auth: { jwt: { authorizer: cognitoAuthorizer.id } } })
api.route("GET /admin/operators/{email}", operatorHandler, { auth: { jwt: { authorizer: cognitoAuthorizer.id } } })
api.route("PUT /admin/operators/{email}", operatorHandler, { auth: { jwt: { authorizer: cognitoAuthorizer.id } } })
api.route("DELETE /admin/operators/{email}", operatorHandler, { auth: { jwt: { authorizer: cognitoAuthorizer.id } } })

// Reports
api.route("POST /reports", {
  handler: "packages/functions/src/reports.create",
  link: [drainMessagesTable, drainsTable],
  permissions: [...dbPermissions, ...comprehendPermissions],
})

// Volunteers
api.route("POST /volunteers", {
  handler: "packages/functions/src/volunteers.create",
  link: [drainsTable, sesFromEmail],
  permissions: [...dbPermissions, ...sesPermissions],
})

// Sensor data
api.route("POST /sensor-data", {
  handler: "packages/functions/src/sensorData.handler",
  link: [drainsTable, sesFromEmail],
  permissions: [...dbPermissions, ...sesPermissions, ...wsManagePermissions],
  environment: {
    WS_ENDPOINT: ws.managementEndpoint,
  },
})

// Heartbeat
api.route("POST /heartbeat", {
  handler: "packages/functions/src/heartbeat.handler",
  link: [drainsTable],
  permissions: [...dbPermissions, ...wsManagePermissions],
  environment: {
    WS_ENDPOINT: ws.managementEndpoint,
  },
})