import * as aws from "@pulumi/aws";

export const userPool = new sst.aws.CognitoUserPool("DrainMonitoringPool", {
  usernames: ["email"],
});

// Use raw Pulumi to set explicit auth flows — SST's addClient() doesn't expose this
export const userPoolClient = new aws.cognito.UserPoolClient("DrainMonitoringWebClient", {
  userPoolId: userPool.id,
  name: "DrainMonitoringWebClient",
  explicitAuthFlows: [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH",
  ],
  preventUserExistenceErrors: "ENABLED",
});

export const adminsGroup = new aws.cognito.UserGroup("AdminsGroup", {
  userPoolId: userPool.id,
  name: "Admins",
  description: "Full admin access",
  precedence: 0,
});

export const operatorsGroup = new aws.cognito.UserGroup("OperatorsGroup", {
  userPoolId: userPool.id,
  name: "Operators",
  description: "Group for drain monitoring operators",
  precedence: 1,
});