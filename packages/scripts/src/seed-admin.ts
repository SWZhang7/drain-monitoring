import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminAddUserToGroupCommand,
  AdminGetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider"

const client = new CognitoIdentityProviderClient({ region: "us-east-1" })

const USER_POOL_ID = process.env.USER_POOL_ID!
const EMAIL = "briefrater@gmail.com"
const TEMP_PASSWORD = "FloodWatch@2026!"

async function seed() {
  // Check if user already exists
  try {
    await client.send(new AdminGetUserCommand({ UserPoolId: USER_POOL_ID, Username: EMAIL }))
    console.log("User already exists, skipping creation.")
  } catch (e: unknown) {
    if ((e as { name?: string }).name !== "UserNotFoundException") throw e

    await client.send(new AdminCreateUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: EMAIL,
      UserAttributes: [
        { Name: "email", Value: EMAIL },
        { Name: "email_verified", Value: "true" },
      ],
      TemporaryPassword: TEMP_PASSWORD,
      MessageAction: "SUPPRESS",
    }))
    console.log(`✓ Created user: ${EMAIL}`)
  }

  await client.send(new AdminAddUserToGroupCommand({
    UserPoolId: USER_POOL_ID,
    Username: EMAIL,
    GroupName: "Admins",
  }))
  console.log(`✓ Added ${EMAIL} to Admins group`)
}

seed().catch(console.error)
