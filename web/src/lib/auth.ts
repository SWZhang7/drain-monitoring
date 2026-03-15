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

export function clearStaleSession() {
  // Remove all localStorage keys for this Cognito pool so stale tokens
  // from a previous deploy (different client ID) never cause 400 storms.
  const prefix = `CognitoIdentityServiceProvider.${import.meta.env.VITE_USER_POOL_CLIENT_ID ?? ""}`
  Object.keys(localStorage)
    .filter((k) => k.startsWith("CognitoIdentityServiceProvider.") && !k.startsWith(prefix))
    .forEach((k) => localStorage.removeItem(k))
}

export function getToken(): Promise<string | null> {
  return new Promise((resolve) => {
    const pool = getPool()
    const user = pool.getCurrentUser()
    if (!user) return resolve(null)

    // Guard: if no refresh token stored for this client, bail immediately.
    // Calling getSession without one causes the SDK to hammer Cognito with retries.
    const storageKey = `CognitoIdentityServiceProvider.${pool.getClientId()}.${user.getUsername()}.refreshToken`
    if (!localStorage.getItem(storageKey)) return resolve(null)

    user.getSession((err: Error | null, session: { isValid: () => boolean; getIdToken: () => { getJwtToken: () => string } } | null) => {
      if (err || !session?.isValid()) {
        user.signOut()
        return resolve(null)
      }
      resolve(session.getIdToken().getJwtToken())
    })
  })
}
