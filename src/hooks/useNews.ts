import { useState, useEffect } from 'react'
import { fetchNews } from '../lib/api'
import type { NewsArticle } from '../lib/api'

const MOCK: NewsArticle[] = [
  {
    id: '1',
    title: "Saison 1 — Les Fondateurs, c'est parti !",
    date: '2026-06-08',
    category: 'annonce',
    excerpt:
      "La Saison 1 de Zenkar est officiellement lancée. Villes à bâtir, guildes à forger, économie à construire — les premiers arrivés seront les premiers fondateurs.",
    slug: 'saison-1-fondateurs',
  },
  {
    id: '2',
    title: 'Équilibre économique & nouveaux métiers',
    date: '2026-06-05',
    category: 'update',
    excerpt:
      "Après les retours de la communauté, nous avons ajusté le système économique. Les salaires des métiers, le marché global et les boutiques joueurs sont maintenant calibrés.",
    slug: 'equilibre-economique-metiers',
  },
  {
    id: '3',
    title: 'Le Tournoi des Bâtisseurs — inscriptions ouvertes',
    date: '2026-06-01',
    category: 'event',
    excerpt:
      "Trois guildes, un terrain, 72 heures. Inscris-toi avec ta guilde avant le 15 juin pour participer au premier grand tournoi de Zenkar.",
    slug: 'tournoi-batisseurs',
  },
]

export function useNews() {
  const [news, setNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNews()
      .then(setNews)
      .catch(() => setNews(MOCK))
      .finally(() => setLoading(false))
  }, [])

  return { news, loading }
}
