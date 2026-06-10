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

export type ReactionEmoji = 'fire' | 'heart' | 'gg' | 'surprised'

export interface ReactionsResponse {
  counts: Record<ReactionEmoji, number>
  user_reaction: ReactionEmoji | null
}

export async function fetchReactions(newsId: string): Promise<ReactionsResponse> {
  const res = await fetch(`${API_BASE}/news/${newsId}/reactions`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch reactions')
  return res.json()
}

export async function toggleReaction(newsId: string, emoji: ReactionEmoji): Promise<ReactionsResponse> {
  const res = await fetch(`${API_BASE}/news/${newsId}/reactions/${emoji}`, {
    method: 'POST',
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to toggle reaction')
  return res.json()
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

