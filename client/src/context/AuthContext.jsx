import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api, { TOKEN_KEY } from '../api/client'

/**
 * AuthContext — global application state (React Context API).
 *
 * It owns:
 *   - token  : the JWT persisted in localStorage
 *   - user   : the currently logged-in user ({ _id, username, email, ... })
 *   - login / register / logout
 *   - loading: true while the session is being restored on first paint
 *
 * Any component can read it with the useAuth() hook.
 */
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)))

  /** Persist the session after a successful login/registration. */
  const persistSession = useCallback((data) => {
    localStorage.setItem(TOKEN_KEY, data.token)
    setToken(data.token)
    setUser({
      _id: data._id,
      username: data.username,
      email: data.email,
      bio: data.bio ?? '',
      skills: data.skills ?? [],
    })
  }, [])

  /* Restore the session on reload: the token is in localStorage, but we ask the
     API who it belongs to (GET /api/users/me) instead of trusting stale data. */
  useEffect(() => {
    let cancelled = false

    const restoreSession = async () => {
      const stored = localStorage.getItem(TOKEN_KEY)

      if (!stored) {
        if (!cancelled) setLoading(false)
        return
      }

      try {
        const { data } = await api.get('/users/me')
        if (!cancelled) setUser(data.data)
      } catch {
        // Token expired or invalid -> clear it.
        localStorage.removeItem(TOKEN_KEY)
        if (!cancelled) {
          setToken(null)
          setUser(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    restoreSession()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(
    async (email, password) => {
      const { data } = await api.post('/users/login', { email, password })
      persistSession(data.data)
      return data.data
    },
    [persistSession]
  )

  const register = useCallback(
    async (username, email, password) => {
      const { data } = await api.post('/users/register', { username, email, password })
      persistSession(data.data)
      return data.data
    },
    [persistSession]
  )

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }, [])

  /** Refresh the cached user (used by the admin profile form). */
  const refreshUser = useCallback(async () => {
    const { data } = await api.get('/users/me')
    setUser(data.data)
    return data.data
  }, [])

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
      refreshUser,
      setUser,
    }),
    [token, user, loading, login, register, logout, refreshUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside an <AuthProvider>')
  }
  return context
}

export default AuthContext
