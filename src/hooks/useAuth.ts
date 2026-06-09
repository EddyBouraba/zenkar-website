import { useState, useEffect } from 'react'

const API = 'https://api.zenkar.fr'

export interface User {
  id: string
  username: string
  email: string
  discord_id: string | null
  discord_username: string | null
  discord_avatar: string | null
  created_at: string
}

function getToken(): string | null {
  return localStorage.getItem('token')
}

function setToken(token: string) {
  localStorage.setItem('token', token)
}

function removeToken() {
  localStorage.removeItem('token')
}

export async function apiRegister(data: {
  username: string
  email: string
  password: string
  date_of_birth: string
  turnstile_token: string
}): Promise<string> {
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.detail ?? 'Erreur inscription')
  setToken(json.access_token)
  return json.access_token
}

export async function apiLogin(email: string, password: string): Promise<string> {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.detail ?? 'Email ou mot de passe incorrect')
  setToken(json.access_token)
  return json.access_token
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (!token) { setLoading(false); return }
    fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(u => setUser(u))
      .finally(() => setLoading(false))
  }, [])

  function logout() {
    removeToken()
    setUser(null)
  }

  return { user, loading, logout }
}
