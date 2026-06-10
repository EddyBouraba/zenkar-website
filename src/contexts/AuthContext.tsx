import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

const API = import.meta.env.VITE_API_URL

export interface User {
  id: string
  username: string
  email: string
  discord_id: string | null
  discord_username: string | null
  discord_avatar: string | null
  minecraft_username: string | null
  minecraft_uuid: string | null
  is_admin: boolean
  created_at: string
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (token: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = useCallback(async (token: string) => {
    const res = await fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      localStorage.removeItem('token')
      setUser(null)
      return
    }
    setUser(await res.json())
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { setLoading(false); return }
    fetchMe(token).finally(() => setLoading(false))
  }, [fetchMe])

  async function login(token: string) {
    localStorage.setItem('token', token)
    await fetchMe(token)
  }

  function logout() {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
