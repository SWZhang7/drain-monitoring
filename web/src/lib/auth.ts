import { CognitoUserPool, CognitoUser, AuthenticationDetails } from "amazon-cognito-identity-js"

function getPool() {
  return new CognitoUserPool({
    UserPoolId: import.meta.env.VITE_USER_POOL_ID ?? "",
    ClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID ?? "",
  })
}

export type SignInResult =
  | { type: "success"; token: string }
  | { type: "newPasswordRequired"; user: CognitoUser }

export function signIn(email: string, password: string): Promise<SignInResult> {
  return new Promise((resolve, reject) => {
    const pool = getPool()
    const user = new CognitoUser({ Username: email, Pool: pool })
    user.authenticateUser(new AuthenticationDetails({ Username: email, Password: password }), {
      onSuccess: (session) => resolve({ type: "success", token: session.getIdToken().getJwtToken() }),
      onFailure: reject,
      newPasswordRequired: () => resolve({ type: "newPasswordRequired", user }),
    })
  })
}

export function completeNewPassword(user: CognitoUser, newPassword: string): Promise<string> {
  return new Promise((resolve, reject) => {
    user.completeNewPasswordChallenge(newPassword, {}, {
      onSuccess: (session) => resolve(session.getIdToken().getJwtToken()),
      onFailure: reject,
    })
  })
}

export function signOut() {
  getPool().getCurrentUser()?.signOut()
}

export function getToken(): Promise<string | null> {
  return new Promise((resolve) => {
    const user = getPool().getCurrentUser()
    if (!user) return resolve(null)
    user.getSession((err: Error | null, session: { isValid: () => boolean; getIdToken: () => { getJwtToken: () => string } } | null) => {
      resolve(err || !session?.isValid() ? null : session.getIdToken().getJwtToken())
    })
  })
}
