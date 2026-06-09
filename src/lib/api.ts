export const API_BASE = 'https://api.zenkar.fr'

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
  date: string
  category: 'annonce' | 'event' | 'update' | 'communaute'
  excerpt: string
  slug: string
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
