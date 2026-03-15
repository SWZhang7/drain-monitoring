// SES configuration for sending alerts to operators
// Note: In development/staging, you'll need to verify email addresses in SES

export const sesPermissions = [
  {
    actions: [
      "ses:SendEmail",
      "ses:SendRawEmail",
      "ses:GetSendQuota",
      "ses:GetSendStatistics",
    ],
    resources: ["*"],
  },
];

// Email configuration will be handled through environment variables
// OPERATOR_EMAIL environment variable should be set to a verified SES email
