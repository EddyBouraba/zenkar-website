import { useState, useEffect } from 'react'
import { fetchNews } from '../lib/api'
import type { NewsArticle } from '../lib/api'

export type { NewsArticle }

export function useNews() {
  const [news, setNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNews()
      .then(setNews)
      .catch(() => setNews([]))
      .finally(() => setLoading(false))
  }, [])

  return { news, loading }
}
