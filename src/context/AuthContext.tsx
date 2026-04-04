import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { type AuthUser, apiMe, getToken, saveToken, clearToken } from '../lib/auth'

interface AuthState {
  user: AuthUser | null
  token: string | null
  loading: boolean
  login: (token: string, user: AuthUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]     = useState<AuthUser | null>(null)
  const [token, setToken]   = useState<string | null>(getToken)
  const [loading, setLoading] = useState(true)

  // on mount — if a token exists, validate it and restore the user
  useEffect(() => {
    if (!token) { setLoading(false); return }

    apiMe()
      .then(({ user }) => setUser(user))
      .catch(() => {
        // token is stale — clear it
        clearToken()
        setToken(null)
      })
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback((newToken: string, newUser: AuthUser) => {
    saveToken(newToken)
    setToken(newToken)
    setUser(newUser)
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
