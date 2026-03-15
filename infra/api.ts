/// <reference path="./sst.d.ts" />
import { bucket } from "./storage";
import { heartbeatTable, sensorDataTable } from "./database";
import { userPool } from "./cognito";
import { sesPermissions } from "./messaging";

const apiPermissions = [
  {
    actions: ["dynamodb:*"],
    resources: ["*"],
  },
  {
    actions: ["comprehend:DetectSentiment"],
    resources: ["*"],
  },
  ...sesPermissions,
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

export const api = new sst.aws.ApiGatewayV2("MyApi", {
  cors: true,
});

// Heartbeat endpoint
api.route("POST /heartbeat", {
  handler: "packages/functions/src/heartbeat.handler",
  link: [heartbeatTable],
  permissions: apiPermissions,
});

// Sensor data endpoint
api.route("POST /sensor-data", {
  handler: "packages/functions/src/sensorData.handler",
  link: [sensorDataTable],
  permissions: apiPermissions,
  environment: {
    OPERATOR_EMAIL: process.env.OPERATOR_EMAIL || "operator@example.com",
  },
});

// Admin CRUD endpoints for operators
api.route("POST /admin/operators", {
  handler: "packages/functions/src/adminCrud.handler",
  link: [userPool],
  permissions: apiPermissions,
  environment: {
    COGNITO_USER_POOL_ID: userPool.id,
  },
});

api.route("GET /admin/operators", {
  handler: "packages/functions/src/adminCrud.handler",
  link: [userPool],
  permissions: apiPermissions,
  environment: {
    COGNITO_USER_POOL_ID: userPool.id,
  },
});

api.route("GET /admin/operators/{email}", {
  handler: "packages/functions/src/adminCrud.handler",
  link: [userPool],
  permissions: apiPermissions,
  environment: {
    COGNITO_USER_POOL_ID: userPool.id,
  },
});

api.route("PUT /admin/operators/{email}", {
  handler: "packages/functions/src/adminCrud.handler",
  link: [userPool],
  permissions: apiPermissions,
  environment: {
    COGNITO_USER_POOL_ID: userPool.id,
  },
});

api.route("DELETE /admin/operators/{email}", {
  handler: "packages/functions/src/adminCrud.handler",
  link: [userPool],
  permissions: apiPermissions,
  environment: {
    COGNITO_USER_POOL_ID: userPool.id,
  },
});

// Existing routes
api.route("ANY /", {
  handler: "packages/functions/src/api.handler",
  link: [bucket],
  permissions: apiPermissions,
});

api.route("ANY /{proxy+}", {
  handler: "packages/functions/src/api.handler",
  link: [bucket],
  permissions: apiPermissions,
});
