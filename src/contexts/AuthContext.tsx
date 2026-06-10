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
  minecraft_linked_at: string | null
  grade: string | null
  is_admin: boolean
  created_at: string
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  refreshUser: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    const res = await fetch(`${API}/auth/me`, { credentials: 'include' })
    if (!res.ok) { setUser(null); return }
    setUser(await res.json())
  }, [])

  useEffect(() => {
    refreshUser().finally(() => setLoading(false))
  }, [refreshUser])

  async function logout() {
    await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' })
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
