/// <reference path="./sst.d.ts" />

import { wsConnectionsTable } from "./database"

const dbPermissions = [{ actions: ["dynamodb:*"], resources: ["*"] }]

export const ws = new sst.aws.ApiGatewayWebSocket("DrainSocket")

ws.route("$connect", {
  handler: "packages/functions/src/WsConnect.handler",
  link: [wsConnectionsTable],
  permissions: dbPermissions,
})

ws.route("$disconnect", {
  handler: "packages/functions/src/WsDisconnect.handler",
  link: [wsConnectionsTable],
  permissions: dbPermissions,
})

ws.route("$default", {
  handler: "packages/functions/src/WsDefault.handler",
  link: [wsConnectionsTable],
  permissions: dbPermissions,
})