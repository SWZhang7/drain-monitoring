/// <reference path="./sst.d.ts" />

import * as aws from "@pulumi/aws";

export const userPool = new sst.aws.CognitoUserPool("DrainMonitoringPool", {
  usernames: ["email"],
  mfa: "off",
  passwords: {
    minLength: 12,
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: true,
  },
});

// Use Pulumi AWS directly since SST v3 doesn't have CognitoUserPoolGroup
export const operatorsGroup = new aws.cognito.UserGroup("OperatorsGroup", {
  userPoolId: userPool.id,
  name: "Operators",
  description: "Group for drain monitoring operators",
  precedence: 1,
});