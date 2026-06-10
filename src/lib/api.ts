export const API_BASE = import.meta.env.VITE_API_URL

export interface ServerStats {
  players_online: number
  max_players: number
  version: string
  status: 'online' | 'offline'
  tps: number
}

export interface NewsArticle {
  id: string
  title: string
  slug: string
  category: 'annonce' | 'event' | 'update' | 'communaute'
  excerpt: string
  content: string | null
  image_url: string | null
  published: boolean
  created_at: string
  author_id: string | null
}

export async function fetchStats(): Promise<ServerStats> {
  const res = await fetch(`${API_BASE}/stats`)
  if (!res.ok) throw new Error('Failed to fetch stats')
  return res.json()
}

export async function fetchNews(): Promise<NewsArticle[]> {
  const res = await fetch(`${API_BASE}/news`)
  if (!res.ok) throw new Error('Failed to fetch news')
  return res.json()
}

