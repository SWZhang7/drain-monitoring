import { Handler } from "aws-lambda";
import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminGetUserCommand,
  AdminUpdateUserAttributesCommand,
  AdminDeleteUserCommand,
  ListUsersInGroupCommand,
  AdminAddUserToGroupCommand,
  AdminRemoveUserFromGroupCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const cognitoClient = new CognitoIdentityProviderClient({});

const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID || "";
const OPERATOR_GROUP = "Operators";

export const handler: Handler = async (event: any) => {
  try {
    const method = event.requestContext?.http?.method || event.httpMethod || "GET";
    const path = event.rawPath || event.path || "/";

    if (method === "POST" && path === "/admin/operators") {
      return await createOperator(event);
    }

    if (method === "GET" && path === "/admin/operators") {
      return await listOperators(event);
    }

    if (method === "GET" && path.match(/^\/admin\/operators\/[^/]+$/)) {
      const email = path.split("/").pop();
      return await getOperator(email || "");
    }

    if (method === "PUT" && path.match(/^\/admin\/operators\/[^/]+$/)) {
      const email = path.split("/").pop();
      return await updateOperator(email || "", event);
    }

    if (method === "DELETE" && path.match(/^\/admin\/operators\/[^/]+$/)) {
      const email = path.split("/").pop();
      return await deleteOperator(email || "");
    }

    return jsonResponse(404, { error: "Route not found" });
  } catch (error: any) {
    console.error("Admin CRUD error:", error);
    return jsonResponse(500, {
      error: "Failed to process admin operation",
      details: error.message,
    });
  }
};

async function createOperator(event: any) {
  try {
    const body = JSON.parse(event.body || "{}");
    const { email, firstName, lastName, tempPassword } = body;

    if (!email) {
      return jsonResponse(400, { error: "Missing required field: email" });
    }

    const createUserCommand = new AdminCreateUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: email,
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "email_verified", Value: "true" },
        { Name: "given_name", Value: firstName || "" },
        { Name: "family_name", Value: lastName || "" },
      ],
      TemporaryPassword: tempPassword || generateTempPassword(),
      MessageAction: "SUPPRESS",
    });

    const createResult = await cognitoClient.send(createUserCommand);

    await cognitoClient.send(
      new AdminAddUserToGroupCommand({
        UserPoolId: USER_POOL_ID,
        Username: email,
        GroupName: OPERATOR_GROUP,
      })
    );

    return jsonResponse(201, {
      success: true,
      message: `Operator ${email} created successfully`,
      data: { username: createResult.User?.Username, email },
    });
  } catch (error: any) {
    console.error("Create operator error:", error);
    return jsonResponse(500, {
      error: "Failed to create operator",
      details: error.message,
    });
  }
}

async function listOperators(event: any) {
  try {
    const result = await cognitoClient.send(
      new ListUsersInGroupCommand({
        UserPoolId: USER_POOL_ID,
        GroupName: OPERATOR_GROUP,
      })
    );

    const operators = result.Users?.map((user) => ({
      username: user.Username,
      attributes: user.Attributes?.reduce(
        (acc: any, attr) => ({
          ...acc,
          [attr.Name || ""]: attr.Value,
        }),
        {}
      ),
      status: user.UserStatus,
    })) || [];

    return jsonResponse(200, { success: true, data: operators });
  } catch (error: any) {
    console.error("List operators error:", error);
    return jsonResponse(500, {
      error: "Failed to list operators",
      details: error.message,
    });
  }
}

async function getOperator(email: string) {
  try {
    if (!email) {
      return jsonResponse(400, { error: "Missing required parameter: email" });
    }

    const result = await cognitoClient.send(
      new AdminGetUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: email,
      })
    );

    const attributes = result.UserAttributes?.reduce(
      (acc: any, attr) => ({
        ...acc,
        [attr.Name || ""]: attr.Value,
      }),
      {}
    );

    return jsonResponse(200, {
      success: true,
      data: {
        username: result.Username,
        attributes,
        status: result.UserStatus,
        mfaOptions: result.MFAOptions,
      },
    });
  } catch (error: any) {
    console.error("Get operator error:", error);

    if (error.name === "UserNotFoundException") {
      return jsonResponse(404, { error: "Operator not found" });
    }

    return jsonResponse(500, {
      error: "Failed to get operator",
      details: error.message,
    });
  }
}

async function updateOperator(email: string, event: any) {
  try {
    const body = JSON.parse(event.body || "{}");
    const { firstName, lastName } = body;

    if (!email) {
      return jsonResponse(400, { error: "Missing required parameter: email" });
    }

    const userAttributes = [];

    if (firstName) {
      userAttributes.push({ Name: "given_name", Value: firstName });
    }

    if (lastName) {
      userAttributes.push({ Name: "family_name", Value: lastName });
    }

    if (userAttributes.length === 0) {
      return jsonResponse(400, { error: "No attributes to update" });
    }

    await cognitoClient.send(
      new AdminUpdateUserAttributesCommand({
        UserPoolId: USER_POOL_ID,
        Username: email,
        UserAttributes: userAttributes,
      })
    );

    return jsonResponse(200, {
      success: true,
      message: `Operator ${email} updated successfully`,
    });
  } catch (error: any) {
    console.error("Update operator error:", error);

    if (error.name === "UserNotFoundException") {
      return jsonResponse(404, { error: "Operator not found" });
    }

    return jsonResponse(500, {
      error: "Failed to update operator",
      details: error.message,
    });
  }
}

async function deleteOperator(email: string) {
  try {
    if (!email) {
      return jsonResponse(400, { error: "Missing required parameter: email" });
    }

    await cognitoClient.send(
      new AdminRemoveUserFromGroupCommand({
        UserPoolId: USER_POOL_ID,
        Username: email,
        GroupName: OPERATOR_GROUP,
      })
    );

    await cognitoClient.send(
      new AdminDeleteUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: email,
      })
    );

    return jsonResponse(200, {
      success: true,
      message: `Operator ${email} deleted successfully`,
    });
  } catch (error: any) {
    console.error("Delete operator error:", error);

    if (error.name === "UserNotFoundException") {
      return jsonResponse(404, { error: "Operator not found" });
    }

    return jsonResponse(500, {
      error: "Failed to delete operator",
      details: error.message,
    });
  }
}

function generateTempPassword(): string {
  return Math.random().toString(36).slice(-12) + "Temp@123";
}

function jsonResponse(statusCode: number, body: any) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(body),
  };
}
