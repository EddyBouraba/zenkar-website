import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Crown, ArrowLeft, Calendar } from 'lucide-react'
import DOMPurify from 'dompurify'
import { API_BASE } from '../lib/api'
import type { NewsArticle } from '../lib/api'
import SEO from '../components/SEO'
import NewsReactions from '../components/NewsReactions'
import SimilarArticles from '../components/SimilarArticles'

const CAT_LABELS: Record<string, string> = {
  annonce: 'Annonce', event: 'Événement', update: 'Mise à jour', communaute: 'Communauté',
}
const CAT_COLORS: Record<string, string> = {
  annonce:    'text-gold bg-gold/10 border-gold/30',
  event:      'text-purple-400 bg-purple-400/10 border-purple-400/30',
  update:     'text-blue-400 bg-blue-400/10 border-blue-400/30',
  communaute: 'text-green-400 bg-green-400/10 border-green-400/30',
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function NewsArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const [article, setArticle] = useState<NewsArticle | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`${API_BASE}/news/${slug}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(setArticle)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
    </div>
  )

  if (notFound || !article) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <p className="text-muted text-sm mb-4">Article introuvable.</p>
      <Link to="/" className="text-gold hover:text-gold-light text-sm transition-colors">← Retour à l'accueil</Link>
    </div>
  )

  const imageUrl = article.image_url?.startsWith('/')
    ? `${API_BASE}${article.image_url}`
    : article.image_url

  const CAT_SECTION: Record<string, string> = {
    annonce: 'Annonce', event: 'Événement', update: 'Mise à jour', communaute: 'Communauté',
  }

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    url: `https://zenkar.fr/news/${article.slug}`,
    datePublished: article.created_at,
    image: imageUrl || 'https://zenkar.fr/og-default.jpg',
    author: {
      '@type': 'Organization',
      name: 'Équipe Zenkar',
      url: 'https://zenkar.fr',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Zenkar',
      url: 'https://zenkar.fr',
      logo: {
        '@type': 'ImageObject',
        url: 'https://zenkar.fr/favicon.svg',
      },
    },
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <SEO
        title={article.title}
        description={article.excerpt}
        canonical={`/news/${article.slug}`}
        ogImage={imageUrl || undefined}
        ogType="article"
        article={{
          publishedTime: article.created_at,
          section: CAT_SECTION[article.category],
        }}
        jsonLd={articleJsonLd}
      />

      {/* Retour */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-text transition-colors mb-6">
        <ArrowLeft size={13} />
        Retour aux actualités
      </Link>

      {/* Image de couverture */}
      {imageUrl && (
        <div className="rounded border border-border overflow-hidden mb-6 aspect-[2/1]">
          <img src={imageUrl} alt={article.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Header article */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${CAT_COLORS[article.category]}`}>
            {CAT_LABELS[article.category]}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Calendar size={11} />
            {fmt(article.created_at)}
          </div>
        </div>
        <h1 className="font-heading text-2xl font-bold text-gold-light leading-tight mb-3">
          {article.title}
        </h1>
        <p className="text-muted text-sm leading-relaxed border-l-2 border-gold/30 pl-4">
          {article.excerpt}
        </p>
      </div>

      <div className="h-px mb-6" style={{ background: 'linear-gradient(to right, rgba(201,168,76,0.4), transparent)' }} />

      {/* Contenu */}
      {article.content ? (
        <div
          className="prose-zenkar text-sm"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }}
        />
      ) : (
        <p className="text-muted text-sm italic">Aucun contenu détaillé pour cet article.</p>
      )}

      {/* Réactions */}
      <div className="mt-8 pt-6 border-t border-border">
        <p className="text-xs text-muted mb-3">Réactions</p>
        <NewsReactions newsId={article.id} />
      </div>

      {/* Articles similaires */}
      <SimilarArticles newsId={article.id} />

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-border flex items-center gap-2">
        <Crown size={12} className="text-gold" />
        <span className="text-xs text-muted">Équipe Zenkar</span>
      </div>
    </div>
  )
}
