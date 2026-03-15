/// <reference path="./sst.d.ts" />
import { bucket, drainsTable, drainMessagesTable } from "./storage";
import { heartbeatTable, sensorDataTable } from "./database";
import { userPool } from "./cognito";
import { sesPermissions } from "./messaging";

const dbPermissions = [{ actions: ["dynamodb:*"], resources: ["*"] }];
const comprehendPermissions = [
  { actions: ["comprehend:DetectSentiment"], resources: ["*"] },
];

// Heartbeat and sensor data permissions
const sensorPermissions = [
  {
    actions: ["dynamodb:*"],
    resources: ["*"],
  },
  {
    actions: ["comprehend:DetectSentiment"],
    resources: ["*"],
  },
  ...sesPermissions,
];

// Cognito admin permissions
const cognitoPermissions = [
  {
    actions: [
      "cognito-idp:AdminCreateUser",
      "cognito-idp:AdminGetUser",
      "cognito-idp:AdminUpdateUserAttributes",
      "cognito-idp:AdminDeleteUser",
      "cognito-idp:AdminListUsersInGroup",
      "cognito-idp:AdminAddUserToGroup",
      "cognito-idp:AdminRemoveUserFromGroup",
    ],
    resources: ["*"],
  },
];

export const sesFromEmail = new sst.Secret("SesFromEmail");

export const api = new sst.aws.ApiGatewayV2("MyApi", { cors: true });

// ============================================
// HEARTBEAT & SENSOR MONITORING (Gabby's work)
// ============================================

// Heartbeat endpoint
api.route("POST /heartbeat", {
  handler: "packages/functions/src/heartbeat.handler",
  link: [heartbeatTable],
  permissions: [...dbPermissions, ...sensorPermissions],
});

// Sensor data endpoint
api.route("POST /sensor-data", {
  handler: "packages/functions/src/sensorData.handler",
  link: [sensorDataTable],
  permissions: [...dbPermissions, ...sesPermissions],
  environment: {
    OPERATOR_EMAIL: process.env.OPERATOR_EMAIL || "operator@example.com",
  },
});

// ============================================
// ADMIN CRUD - OPERATORS (Gabby's work)
// ============================================

api.route("POST /admin/operators", {
  handler: "packages/functions/src/adminCrud.handler",
  link: [userPool],
  permissions: cognitoPermissions,
  environment: {
    COGNITO_USER_POOL_ID: userPool.id,
  },
});

api.route("GET /admin/operators", {
  handler: "packages/functions/src/adminCrud.handler",
  link: [userPool],
  permissions: cognitoPermissions,
  environment: {
    COGNITO_USER_POOL_ID: userPool.id,
  },
});

api.route("GET /admin/operators/{email}", {
  handler: "packages/functions/src/adminCrud.handler",
  link: [userPool],
  permissions: cognitoPermissions,
  environment: {
    COGNITO_USER_POOL_ID: userPool.id,
  },
});

api.route("PUT /admin/operators/{email}", {
  handler: "packages/functions/src/adminCrud.handler",
  link: [userPool],
  permissions: cognitoPermissions,
  environment: {
    COGNITO_USER_POOL_ID: userPool.id,
  },
});

api.route("DELETE /admin/operators/{email}", {
  handler: "packages/functions/src/adminCrud.handler",
  link: [userPool],
  permissions: cognitoPermissions,
  environment: {
    COGNITO_USER_POOL_ID: userPool.id,
  },
});

// ============================================
// DRAINS ENDPOINTS (Teammates' work)
// ============================================

api.route("GET /drains", {
  handler: "packages/functions/src/drains.list",
  link: [drainsTable],
  permissions: dbPermissions,
});

api.route("GET /drains/{id}", {
  handler: "packages/functions/src/drains.get",
  link: [drainsTable],
  permissions: dbPermissions,
});

// ============================================
// REPORTS ENDPOINTS (Teammates' work)
// ============================================

api.route("POST /reports", {
  handler: "packages/functions/src/reports.create",
  link: [drainMessagesTable, drainsTable],
  permissions: [...dbPermissions, ...comprehendPermissions],
});

// ============================================
// VOLUNTEERS ENDPOINTS (Teammates' work)
// ============================================

api.route("POST /volunteers", {
  handler: "packages/functions/src/volunteers.create",
  link: [drainsTable, sesFromEmail],
  permissions: [
    { actions: ["dynamodb:GetItem"], resources: ["*"] },
    { actions: ["ses:SendEmail"], resources: ["*"] },
  ],
});

// ============================================
// EXISTING ROUTES
// ============================================

api.route("ANY /", {
  handler: "packages/functions/src/api.handler",
  link: [bucket],
  permissions: dbPermissions,
});

api.route("ANY /{proxy+}", {
  handler: "packages/functions/src/api.handler",
  link: [bucket],
  permissions: dbPermissions,
});
