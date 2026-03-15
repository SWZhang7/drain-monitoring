/// <reference path="./sst.d.ts" />

// Cognito User Pool for authentication and operator management

export const userPool = new sst.aws.CognitoUserPool("DrainMonitoringPool", {
  emails: ["noreply@drain-monitoring.local"],
  defaultAutoVerifiedAttributes: ["email"],
  mfa: "optional",
  passwordPolicy: {
    minLength: 12,
    requireLowercase: true,
    requireUppercase: true,
    requireNumbers: true,
    requireSymbols: true,
  },
});

// Create admin user (hardcoded as per requirements)
export const adminUser = userPool.attachPermissions([
  {
    actions: ["cognito-idp:AdminCreateUser", "cognito-idp:AdminDeleteUser"],
    resources: ["*"],
  },
]);

// Create Operators group for role-based access control
export const operatorsGroup = new sst.aws.CognitoUserPoolGroup(
  "OperatorsGroup",
  {
    userPool,
    name: "Operators",
    description: "Group for drain monitoring operators",
    priority: 1,
  }
);
