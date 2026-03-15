import { createContext, useContext, useEffect, useState } from "react"
import { getToken, signOut as cognitoSignOut, clearStaleSession } from "./auth"

type AuthCtx = {
  token: string | null
  logout: () => void
  refresh: () => void
}

const AuthContext = createContext<AuthCtx>({ token: null, logout: () => {}, refresh: () => {} })

export function AuthProvider({ children }: { readonly children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)

  const refresh = () => { clearStaleSession(); getToken().then(setToken) }

  useEffect(() => { refresh() }, [])

  const logout = () => { cognitoSignOut(); setToken(null) }

  return <AuthContext.Provider value={{ token, logout, refresh }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
