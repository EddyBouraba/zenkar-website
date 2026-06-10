const API = import.meta.env.VITE_API_URL

export type { User } from '../contexts/AuthContext'
export { useAuth } from '../contexts/AuthContext'

export type FieldErrors = Record<string, string>

function parseErrors(detail: unknown): { global: string; fields: FieldErrors } {
  if (typeof detail === 'string') return { global: detail, fields: {} }
  if (Array.isArray(detail)) {
    const fields: FieldErrors = {}
    for (const err of detail) {
      const loc: string[] = err.loc ?? []
      const field = loc[loc.length - 1] ?? 'global'
      const msg: string = err.msg?.replace(/^Value error, /, '') ?? 'Erreur'
      if (field === 'global' || field === 'body') {
        fields['_global'] = msg
      } else {
        fields[field] = msg
      }
    }
    const global = fields['_global'] ?? Object.values(fields)[0] ?? 'Erreur'
    return { global, fields }
  }
  return { global: 'Erreur inattendue', fields: {} }
}

export class ApiError extends Error {
  fields: FieldErrors
  constructor(message: string, fields: FieldErrors = {}) {
    super(message)
    this.fields = fields
  }
}

export async function apiRegister(data: {
  username: string
  email: string
  password: string
  date_of_birth: string
  turnstile_token: string
}): Promise<void> {
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const json = await res.json()
    const { global, fields } = parseErrors(json.detail)
    throw new ApiError(global, fields)
  }
}

export async function apiLogin(email: string, password: string, turnstile_token?: string): Promise<void> {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password, ...(turnstile_token ? { turnstile_token } : {}) }),
  })
  if (!res.ok) {
    const json = await res.json()
    const { global } = parseErrors(json.detail)
    throw new ApiError(global)
  }
}
