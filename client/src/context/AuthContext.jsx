import { createContext, useContext, useState, useEffect } from 'react'

const TOKEN_KEY = 'pl_token'
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Read token synchronously so ProtectedRoute never flickers on first render
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user,  setUser]  = useState(null)
  // loading = true only when we have a saved token that still needs validation
  const [loading, setLoading] = useState(() => !!localStorage.getItem(TOKEN_KEY))

  // Validate saved token on mount via GET /api/auth/me
  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY)
    if (!saved) { setLoading(false); return }

    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${saved}` } })
      .then(r => r.json())
      .then(d => {
        if (d.success) setUser(d.user)
        else _clear() // token expired or revoked
      })
      .catch(() => _clear())
      .finally(() => setLoading(false))
  }, []) // intentionally runs once on mount only

  function _persist(newToken, newUser) {
    localStorage.setItem(TOKEN_KEY, newToken)
    setToken(newToken)
    setUser(newUser)
  }

  function _clear() {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }

  async function login(email, password) {
    try {
      const res  = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim(), password }),
      })
      const data = await res.json()
      if (data.success) { _persist(data.token, data.user); return { success: true } }
      return { success: false, error: data.message ?? 'Login failed.' }
    } catch {
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  async function register(fields) {
    try {
      const res  = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(fields),
      })
      const data = await res.json()
      if (data.success) { _persist(data.token, data.user); return { success: true } }
      return { success: false, error: data.message ?? 'Registration failed.' }
    } catch {
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  function logout() {
    const t = token
    _clear() // clear state immediately so UI updates at once
    if (t) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${t}` },
      }).catch(() => {}) // fire-and-forget — JWT is stateless
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
