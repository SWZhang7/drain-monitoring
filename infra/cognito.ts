import * as aws from "@pulumi/aws";

export const userPool = new sst.aws.CognitoUserPool("DrainMonitoringPool", {
  usernames: ["email"],
});

export const userPoolClient = userPool.addClient("DrainMonitoringWebClient");

// Use Pulumi AWS directly since SST v3 doesn't have CognitoUserPoolGroup
export const operatorsGroup = new aws.cognito.UserGroup("OperatorsGroup", {
  userPoolId: userPool.id,
  name: "Operators",
  description: "Group for drain monitoring operators",
  precedence: 1,
});