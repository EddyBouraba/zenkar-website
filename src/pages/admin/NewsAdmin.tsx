import { useState, useEffect } from 'react'
import { Crown, Plus, Trash2, Eye, EyeOff, AlertCircle, Check } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { API_BASE } from '../../lib/api'
import type { NewsArticle } from '../../lib/api'

const CATEGORIES = ['annonce', 'event', 'update', 'communaute'] as const

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

const CAT_LABELS: Record<string, string> = {
  annonce: 'Annonce', event: 'Événement', update: 'Mise à jour', communaute: 'Communauté',
}

const CAT_COLORS: Record<string, string> = {
  annonce:    'text-gold bg-gold/10 border-gold/30',
  event:      'text-purple-400 bg-purple-400/10 border-purple-400/30',
  update:     'text-blue-400 bg-blue-400/10 border-blue-400/30',
  communaute: 'text-green-400 bg-green-400/10 border-green-400/30',
}

const EMPTY = { title: '', slug: '', category: 'annonce' as string, excerpt: '', content: '', published: true }

export default function NewsAdmin() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (!loading && (!user || !user.is_admin)) navigate('/')
  }, [user, loading])

  useEffect(() => {
    fetch(`${API_BASE}/news`)
      .then(r => r.json())
      .then(setArticles)
      .catch(() => {})
  }, [])

  function token() {
    return localStorage.getItem('token') ?? ''
  }

  function updateForm(k: string, v: string | boolean) {
    setForm(p => {
      const next = { ...p, [k]: v }
      if (k === 'title') next.slug = slugify(v as string)
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSuccess('')
    setSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/news`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ ...form, content: form.content || null }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.detail ?? 'Erreur')
      setArticles(prev => [json, ...prev])
      setForm(EMPTY)
      setShowForm(false)
      setSuccess('Article publié !')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function togglePublish(article: NewsArticle) {
    const res = await fetch(`${API_BASE}/news/${article.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ published: !article.published }),
    })
    if (res.ok) {
      const updated = await res.json()
      setArticles(prev => prev.map(a => a.id === article.id ? updated : a))
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cet article ?')) return
    const res = await fetch(`${API_BASE}/news/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token()}` },
    })
    if (res.ok) setArticles(prev => prev.filter(a => a.id !== id))
  }

  if (loading) return null

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Crown size={14} className="text-gold" />
          <h1 className="font-heading text-sm font-semibold text-gold tracking-widest uppercase">Admin — News</h1>
        </div>
        <button
          onClick={() => { setShowForm(v => !v); setError('') }}
          className="flex items-center gap-2 px-3 py-1.5 rounded bg-gold hover:bg-gold-light text-bg text-xs font-semibold transition-colors"
        >
          <Plus size={13} />
          Nouvel article
        </button>
      </div>

      {success && (
        <div className="flex items-center gap-2 p-3 rounded border border-green-500/30 bg-green-500/10 mb-4">
          <Check size={14} className="text-green-400" />
          <p className="text-xs text-green-400">{success}</p>
        </div>
      )}

      {/* Formulaire */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded border border-border bg-card p-5 mb-6 space-y-4">
          <h2 className="text-sm font-semibold text-text mb-2">Nouvel article</h2>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded border border-red-500/30 bg-red-500/10">
              <AlertCircle size={13} className="text-red-400" />
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-xs text-muted mb-1.5">Titre</label>
            <input
              required
              value={form.title}
              onChange={e => updateForm('title', e.target.value)}
              placeholder="Titre de l'article"
              className="w-full px-3 py-2 rounded border border-border bg-surface text-text text-sm placeholder:text-muted/40 focus:outline-none focus:border-gold/50"
            />
          </div>

          <div>
            <label className="block text-xs text-muted mb-1.5">Slug</label>
            <input
              required
              value={form.slug}
              onChange={e => updateForm('slug', e.target.value)}
              placeholder="mon-article"
              className="w-full px-3 py-2 rounded border border-border bg-surface text-text text-sm font-mono placeholder:text-muted/40 focus:outline-none focus:border-gold/50"
            />
          </div>

          <div>
            <label className="block text-xs text-muted mb-1.5">Catégorie</label>
            <select
              value={form.category}
              onChange={e => updateForm('category', e.target.value)}
              className="w-full px-3 py-2 rounded border border-border bg-surface text-text text-sm focus:outline-none focus:border-gold/50"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs text-muted mb-1.5">Résumé</label>
            <textarea
              required
              value={form.excerpt}
              onChange={e => updateForm('excerpt', e.target.value)}
              placeholder="Résumé affiché sur la page d'accueil..."
              rows={3}
              className="w-full px-3 py-2 rounded border border-border bg-surface text-text text-sm placeholder:text-muted/40 focus:outline-none focus:border-gold/50 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs text-muted mb-1.5">Contenu complet <span className="text-muted/50">(optionnel)</span></label>
            <textarea
              value={form.content}
              onChange={e => updateForm('content', e.target.value)}
              placeholder="Contenu détaillé de l'article..."
              rows={6}
              className="w-full px-3 py-2 rounded border border-border bg-surface text-text text-sm placeholder:text-muted/40 focus:outline-none focus:border-gold/50 resize-y"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={form.published}
              onChange={e => updateForm('published', e.target.checked)}
              className="accent-gold"
            />
            <label htmlFor="published" className="text-xs text-muted">Publier immédiatement</label>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded bg-gold hover:bg-gold-light text-bg text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {submitting ? 'Publication...' : 'Publier'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setError('') }}
              className="px-4 py-2 rounded border border-border text-muted hover:text-text text-xs transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Liste des articles */}
      <div className="space-y-2">
        {articles.length === 0 ? (
          <div className="text-center py-12 text-muted text-sm">Aucun article pour l'instant.</div>
        ) : articles.map(a => (
          <div key={a.id} className={`flex items-center gap-4 p-4 rounded border bg-card transition-colors ${a.published ? 'border-border' : 'border-border/40 opacity-60'}`}>
            <span className={`px-2 py-0.5 rounded text-[11px] font-medium border flex-shrink-0 ${CAT_COLORS[a.category]}`}>
              {CAT_LABELS[a.category]}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text font-medium truncate">{a.title}</p>
              <p className="text-xs text-muted mt-0.5">{fmt(a.created_at)} · <span className="font-mono">{a.slug}</span></p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => togglePublish(a)}
                className="text-muted hover:text-text transition-colors"
                title={a.published ? 'Dépublier' : 'Publier'}
              >
                {a.published ? <Eye size={15} /> : <EyeOff size={15} />}
              </button>
              <button
                onClick={() => handleDelete(a.id)}
                className="text-muted hover:text-red-400 transition-colors"
                title="Supprimer"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
