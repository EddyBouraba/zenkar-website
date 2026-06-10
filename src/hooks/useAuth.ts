const API = import.meta.env.VITE_API_URL

export type { User } from '../contexts/AuthContext'
export { useAuth } from '../contexts/AuthContext'

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
  return json.access_token
}
