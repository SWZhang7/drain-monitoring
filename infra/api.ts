import { bucket } from "./storage";

const apiPermissions = [
  {
    actions: ["dynamodb:*"],
    resources: ["*"],
  },
  {
    actions: ["comprehend:DetectSentiment"],
    resources: ["*"],
  },
];

export const api = new sst.aws.ApiGatewayV2("MyApi", {
  cors: true,
});

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
