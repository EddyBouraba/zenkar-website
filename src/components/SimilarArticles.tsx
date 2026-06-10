import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar } from 'lucide-react'
import { API_BASE } from '../lib/api'
import type { NewsArticle } from '../lib/api'
import catAnnonce    from '../assets/cat-annonce.png'
import catEvent      from '../assets/cat-event.png'
import catUpdate     from '../assets/cat-update.png'
import catCommunaute from '../assets/cat-communaute.png'

const CAT_LABELS: Record<string, string> = {
  annonce: 'Annonce', event: 'Événement', update: 'Mise à jour', communaute: 'Communauté',
}
const CAT_COLORS: Record<string, string> = {
  annonce:    'text-gold bg-gold/10 border-gold/30',
  event:      'text-purple-400 bg-purple-400/10 border-purple-400/30',
  update:     'text-blue-400 bg-blue-400/10 border-blue-400/30',
  communaute: 'text-green-400 bg-green-400/10 border-green-400/30',
}
const CAT_IMG: Record<string, string> = {
  annonce:    catAnnonce,
  event:      catEvent,
  update:     catUpdate,
  communaute: catCommunaute,
}


function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

interface Props {
  newsId: string
}

export default function SimilarArticles({ newsId }: Props) {
  const [articles, setArticles] = useState<NewsArticle[]>([])

  useEffect(() => {
    fetch(`${API_BASE}/news/${newsId}/similar`)
      .then(r => r.ok ? r.json() : [])
      .then(setArticles)
      .catch(() => {})
  }, [newsId])

  if (articles.length === 0) return null

  return (
    <div className="mt-10 pt-8 border-t border-border">
      <p className="text-xs text-muted uppercase tracking-widest mb-4">Dans la même catégorie</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {articles.map(a => {
          const imageUrl = a.image_url?.startsWith('/') ? `${API_BASE}${a.image_url}` : a.image_url
          return (
            <Link
              key={a.id}
              to={`/news/${a.slug}`}
              className="group rounded border border-border bg-card hover:border-gold/30 transition-colors overflow-hidden flex flex-col"
            >
              {imageUrl ? (
                <div className="aspect-[2/1] overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={a.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="aspect-[2/1] bg-white flex items-center justify-center overflow-hidden">
                  <img
                    src={CAT_IMG[a.category]}
                    alt={CAT_LABELS[a.category]}
                    className="w-3/5 object-contain"
                  />
                </div>
              )}
              <div className="p-3 flex flex-col gap-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${CAT_COLORS[a.category]}`}>
                    {CAT_LABELS[a.category]}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-muted">
                    <Calendar size={9} />
                    {fmt(a.created_at)}
                  </span>
                </div>
                <p className="text-sm font-medium text-text group-hover:text-gold-light transition-colors line-clamp-2 leading-snug">
                  {a.title}
                </p>
                <p className="text-xs text-muted line-clamp-2 leading-relaxed mt-auto">
                  {a.excerpt}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
