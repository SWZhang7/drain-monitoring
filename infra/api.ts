import { drainsTable, drainMessagesTable } from "./storage"
import { userPool, userPoolClient } from "./cognito"

const dbPermissions = [{ actions: ["dynamodb:*"], resources: ["*"] }]
const comprehendPermissions = [{ actions: ["comprehend:DetectSentiment"], resources: ["*"] }]
const sesPermissions = [{ actions: ["ses:SendEmail"], resources: ["*"] }]

export const sesFromEmail = new sst.Secret("SesFromEmail")

export const api = new sst.aws.ApiGatewayV2("MyApi", {
  cors: {
    allowOrigins: $app.stage === "production" ? ["https://your-app.netlify.app"] : ["*"],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  },
})

const cognitoAuthorizer = api.addAuthorizer({
  name: "CognitoAuthorizer",
  jwt: {
    issuer: $interpolate`https://cognito-idp.us-east-1.amazonaws.com/${userPool.id}`,
    audiences: [userPoolClient.id],
  },
})

const cognitoPermissions = [{ actions: ["cognito-idp:AdminCreateUser", "cognito-idp:AdminDeleteUser", "cognito-idp:AdminGetUser", "cognito-idp:AdminUpdateUserAttributes", "cognito-idp:AdminAddUserToGroup", "cognito-idp:AdminRemoveUserFromGroup", "cognito-idp:ListUsersInGroup", "ses:VerifyEmailIdentity"], resources: ["*"] }]
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
