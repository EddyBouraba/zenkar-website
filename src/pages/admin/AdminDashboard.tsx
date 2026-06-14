import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Crown, Newspaper, Users, LayoutDashboard, Plus, Trash2, Eye, EyeOff, Shield, ShieldOff, AlertCircle, Check, ImagePlus, ExternalLink, Pencil, X, Calendar, Flame, Medal, RotateCcw } from 'lucide-react'
import DOMPurify from 'dompurify'
import RichEditor from '../../components/RichEditor'
import { useAuth } from '../../hooks/useAuth'
import { API_BASE } from '../../lib/api'
import type { NewsArticle } from '../../lib/api'
import type { User } from '../../contexts/AuthContext'
import GradeBadge, { GRADES } from '../../components/GradeBadge'

type Tab = 'overview' | 'news' | 'users' | 'engagement' | 'badges'

const CATEGORIES = ['annonce', 'event', 'update', 'communaute'] as const
const CAT_LABELS: Record<string, string> = {
  annonce: 'Annonce', event: 'Événement', update: 'Mise à jour', communaute: 'Communauté',
}
const CAT_COLORS: Record<string, string> = {
  annonce:    'text-gold bg-gold/10 border-gold/30',
  event:      'text-purple-400 bg-purple-400/10 border-purple-400/30',
  update:     'text-blue-400 bg-blue-400/10 border-blue-400/30',
  communaute: 'text-green-400 bg-green-400/10 border-green-400/30',
}
const EMPTY_FORM = { title: '', slug: '', category: 'annonce' as string, excerpt: '', content: '', published: true }

function slugify(str: string) {
  return str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}
function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}
function authFetch(url: string, opts: RequestInit = {}) {
  return fetch(url, { ...opts, credentials: 'include' })
}

// ── Overview ──────────────────────────────────────────────────────────────────

function Overview({ onTab }: { onTab: (t: Tab) => void }) {
  const [stats, setStats] = useState<{ users_total: number; news_total: number; news_published: number } | null>(null)
  const [resetting, setResetting] = useState(false)
  const [resetMsg, setResetMsg] = useState('')

  useEffect(() => {
    authFetch(`${API_BASE}/admin/stats`)
      .then(r => r.json()).then(setStats).catch(() => {})
  }, [])

  async function handleResetLeaderboard() {
    if (!confirm('Supprimer toutes les données du leaderboard ? Cette action est irréversible.')) return
    setResetting(true)
    setResetMsg('')
    try {
      const res = await authFetch(`${API_BASE}/admin/leaderboard/reset`, { method: 'POST' })
      const data = await res.json()
      setResetMsg(res.ok ? '✓ Leaderboard réinitialisé' : `Erreur : ${data.detail}`)
    } catch {
      setResetMsg('Erreur réseau')
    } finally {
      setResetting(false)
      setTimeout(() => setResetMsg(''), 4000)
    }
  }

  const cards = [
    { label: 'Joueurs inscrits', value: stats?.users_total ?? '—', icon: Users, tab: 'users' as Tab },
    { label: 'Articles publiés', value: stats?.news_published ?? '—', icon: Newspaper, tab: 'news' as Tab },
    { label: 'Articles total', value: stats?.news_total ?? '—', icon: Newspaper, tab: 'news' as Tab },
  ]

  return (
    <div>
      <p className="text-muted text-xs mb-6">Vue d'ensemble du serveur Zenkar.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, tab }) => (
          <button key={label} onClick={() => onTab(tab)}
            className="p-5 rounded border border-border bg-card hover:border-gold/30 transition-colors text-left group">
            <div className="flex items-center gap-2 mb-3">
              <Icon size={14} className="text-muted group-hover:text-gold transition-colors" />
              <span className="text-xs text-muted uppercase tracking-widest">{label}</span>
            </div>
            <p className="font-heading font-bold text-2xl text-gold-light">{value}</p>
          </button>
        ))}
      </div>

      {/* Zone danger */}
      <div className="rounded border border-red-500/20 bg-red-500/5 p-5">
        <p className="text-xs font-semibold text-red-400 uppercase tracking-widest mb-4">Zone dangereuse</p>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-text font-medium">Réinitialiser le leaderboard</p>
            <p className="text-xs text-muted mt-0.5">Supprime toutes les statistiques joueurs et guildes. À faire avant le lancement officiel.</p>
          </div>
          <button
            onClick={handleResetLeaderboard}
            disabled={resetting}
            className="flex items-center gap-2 px-4 py-2 rounded border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition-colors disabled:opacity-50 flex-shrink-0"
          >
            <RotateCcw size={13} className={resetting ? 'animate-spin' : ''} />
            {resetting ? 'Réinitialisation...' : 'Reset leaderboard'}
          </button>
        </div>
        {resetMsg && (
          <p className={`text-xs mt-3 ${resetMsg.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>
            {resetMsg}
          </p>
        )}
      </div>
    </div>
  )
}

// ── Article Preview Modal ─────────────────────────────────────────────────────

function ArticlePreviewModal({ article, imagePreview, onClose }: {
  article: { title: string; slug: string; category: string; excerpt: string; content: string; published: boolean }
  imagePreview: string | null
  onClose: () => void
}) {
  function fmtFull(iso: string) {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto"
      style={{ background: 'rgba(9,8,12,0.85)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-3xl bg-bg rounded border border-border shadow-2xl mb-8">
        {/* Barre supérieure */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card rounded-t">
          <div className="flex items-center gap-2">
            <Eye size={12} className="text-gold" />
            <span className="text-xs text-muted font-medium">Aperçu — tel qu'il apparaîtra</span>
            {!article.published && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Non publié</span>
            )}
          </div>
          <button onClick={onClose} className="text-muted hover:text-text transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Contenu de l'aperçu */}
        <div className="px-6 py-8">
          {imagePreview && (
            <div className="rounded border border-border overflow-hidden mb-6 aspect-[2/1]">
              <img src={imagePreview} alt={article.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${CAT_COLORS[article.category]}`}>
                {CAT_LABELS[article.category]}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <Calendar size={11} />
                {fmtFull(new Date().toISOString())}
              </div>
            </div>
            <h1 className="font-heading text-2xl font-bold text-gold-light leading-tight mb-3">
              {article.title || <span className="text-muted/40 italic">Sans titre</span>}
            </h1>
            <p className="text-muted text-sm leading-relaxed border-l-2 border-gold/30 pl-4">
              {article.excerpt || <span className="italic">Aucun résumé</span>}
            </p>
          </div>

          <div className="h-px mb-6" style={{ background: 'linear-gradient(to right, rgba(201,168,76,0.4), transparent)' }} />

          {article.content && article.content !== '<p></p>' ? (
            <div className="prose-zenkar text-sm" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }} />
          ) : (
            <p className="text-muted text-sm italic">Aucun contenu détaillé pour cet article.</p>
          )}

          <div className="mt-10 pt-6 border-t border-border flex items-center gap-2">
            <Crown size={12} className="text-gold" />
            <span className="text-xs text-muted">Équipe Zenkar</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── News ──────────────────────────────────────────────────────────────────────

function NewsTab() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [previewArticle, setPreviewArticle] = useState<{ article: typeof EMPTY_FORM; image: string | null } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    authFetch(`${API_BASE}/admin/news`)
      .then(r => r.json()).then(setArticles).catch(() => {})
  }, [])

  function updateForm(k: string, v: string | boolean) {
    setForm(p => { const n = { ...p, [k]: v }; if (k === 'title' && !editingId) n.slug = slugify(v as string); return n })
  }

  function openEdit(a: NewsArticle) {
    setEditingId(a.id)
    setForm({ title: a.title, slug: a.slug, category: a.category, excerpt: a.excerpt, content: a.content ?? '', published: a.published })
    setImagePreview(a.image_url ? `${API_BASE}${a.image_url}` : null)
    setImageFile(null)
    setError('')
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function closeForm() {
    setShowForm(false); setEditingId(null)
    setForm(EMPTY_FORM); setImageFile(null); setImagePreview(null); setError('')
  }

  function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setSuccess(''); setSubmitting(true)
    try {
      let json: NewsArticle
      if (editingId) {
        // Modification
        const res = await authFetch(`${API_BASE}/news/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, content: form.content || null }),
        })
        json = await res.json()
        if (!res.ok) throw new Error((json as any).detail ?? 'Erreur')
        setArticles(p => p.map(a => a.id === editingId ? json : a))
        setSuccess('Article modifié !')
      } else {
        // Création
        const res = await authFetch(`${API_BASE}/news`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, content: form.content || null }),
        })
        json = await res.json()
        if (!res.ok) throw new Error((json as any).detail ?? 'Erreur')
        setArticles(p => [json, ...p])
        setSuccess('Article publié !')
      }

      // Upload image si nouvelle image sélectionnée
      if (imageFile) {
        const fd = new FormData()
        fd.append('file', imageFile)
        const imgRes = await authFetch(`${API_BASE}/news/${json.id}/upload-image`, {
          method: 'POST', body: fd,
        })
        if (imgRes.ok) {
          const imgJson = await imgRes.json()
          setArticles(p => p.map(a => a.id === json.id ? { ...a, image_url: imgJson.image_url } : a))
        }
      }

      closeForm()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  async function uploadImageForArticle(articleId: string, file: File) {
    setUploadingImage(articleId)
    const fd = new FormData()
    fd.append('file', file)
    const res = await authFetch(`${API_BASE}/news/${articleId}/upload-image`, {
      method: 'POST', body: fd,
    })
    if (res.ok) {
      const json = await res.json()
      setArticles(p => p.map(a => a.id === articleId ? { ...a, image_url: json.image_url } : a))
    }
    setUploadingImage(null)
  }

  async function togglePublish(a: NewsArticle) {
    const res = await authFetch(`${API_BASE}/news/${a.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !a.published }),
    })
    if (res.ok) { const u = await res.json(); setArticles(p => p.map(x => x.id === a.id ? u : x)) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cet article ?')) return
    const res = await authFetch(`${API_BASE}/news/${id}`, { method: 'DELETE' })
    if (res.ok) setArticles(p => p.filter(a => a.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-muted">{articles.length} article{articles.length !== 1 ? 's' : ''}</p>
        <button onClick={() => { closeForm(); setShowForm(v => !v) }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-gold hover:bg-gold-light text-bg text-xs font-semibold transition-colors">
          <Plus size={12} /> Nouvel article
        </button>
      </div>

      {success && (
        <div className="flex items-center gap-2 p-3 rounded border border-green-500/30 bg-green-500/10 mb-4">
          <Check size={13} className="text-green-400" /><p className="text-xs text-green-400">{success}</p>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded border border-border bg-card p-5 mb-5 space-y-4">
          <h3 className="text-sm font-semibold text-text">{editingId ? 'Modifier l\'article' : 'Nouvel article'}</h3>
          {error && (
            <div className="flex items-center gap-2 p-3 rounded border border-red-500/30 bg-red-500/10">
              <AlertCircle size={13} className="text-red-400" /><p className="text-xs text-red-400">{error}</p>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted mb-1.5">Titre</label>
              <input required value={form.title} onChange={e => updateForm('title', e.target.value)}
                placeholder="Titre de l'article"
                className="w-full px-3 py-2 rounded border border-border bg-surface text-text text-sm placeholder:text-muted/40 focus:outline-none focus:border-gold/50" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">Slug</label>
              <input required value={form.slug} onChange={e => updateForm('slug', e.target.value)}
                className="w-full px-3 py-2 rounded border border-border bg-surface text-text text-sm font-mono placeholder:text-muted/40 focus:outline-none focus:border-gold/50" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">Catégorie</label>
            <select value={form.category} onChange={e => updateForm('category', e.target.value)}
              className="w-full px-3 py-2 rounded border border-border bg-surface text-text text-sm focus:outline-none focus:border-gold/50">
              {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">Résumé</label>
            <textarea required value={form.excerpt} onChange={e => updateForm('excerpt', e.target.value)}
              placeholder="Résumé affiché sur la page d'accueil..." rows={3}
              className="w-full px-3 py-2 rounded border border-border bg-surface text-text text-sm placeholder:text-muted/40 focus:outline-none focus:border-gold/50 resize-none" />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">Contenu <span className="text-muted/50">(optionnel)</span></label>
            <RichEditor value={form.content} onChange={v => updateForm('content', v)} />
          </div>
          {/* Image */}
          <div>
            <label className="block text-xs text-muted mb-1.5">Image de couverture <span className="text-muted/50">(optionnel)</span></label>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImagePick} className="hidden" />
            {imagePreview ? (
              <div className="relative rounded border border-border overflow-hidden aspect-[3/1]">
                <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); if (fileRef.current) fileRef.current.value = '' }}
                  className="absolute top-2 right-2 px-2 py-1 rounded bg-bg/80 text-xs text-red-400 hover:text-red-300 transition-colors">
                  Supprimer
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 w-full px-3 py-6 rounded border border-dashed border-border hover:border-gold/40 text-muted hover:text-text text-xs transition-colors justify-center">
                <ImagePlus size={14} /> Choisir une image
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="pub" checked={form.published} onChange={e => updateForm('published', e.target.checked)} className="accent-gold" />
            <label htmlFor="pub" className="text-xs text-muted">Publier immédiatement</label>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={submitting}
              className="px-4 py-2 rounded bg-gold hover:bg-gold-light text-bg text-xs font-semibold transition-colors disabled:opacity-50">
              {submitting ? 'Sauvegarde...' : editingId ? 'Sauvegarder' : 'Publier'}
            </button>
            <button type="button" onClick={() => setPreviewArticle({ article: form, image: imagePreview })}
              className="flex items-center gap-1.5 px-4 py-2 rounded border border-border text-muted hover:text-gold hover:border-gold/40 text-xs transition-colors">
              <Eye size={12} /> Aperçu
            </button>
            <button type="button" onClick={closeForm}
              className="px-4 py-2 rounded border border-border text-muted hover:text-text text-xs transition-colors">
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {articles.length === 0
          ? <p className="text-center py-10 text-muted text-sm">Aucun article.</p>
          : articles.map(a => (
            <div key={a.id} className={`rounded border bg-card ${a.published ? 'border-border' : 'border-border/40 opacity-60'}`}>
              {a.image_url && (
                <div className="aspect-[3/1] overflow-hidden rounded-t border-b border-border">
                  <img src={`${API_BASE}${a.image_url}`} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex items-center gap-3 p-4">
                <span className={`px-2 py-0.5 rounded text-[11px] font-medium border flex-shrink-0 ${CAT_COLORS[a.category]}`}>
                  {CAT_LABELS[a.category]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text font-medium truncate">{a.title}</p>
                  <p className="text-xs text-muted mt-0.5">{fmt(a.created_at)} · <span className="font-mono">{a.slug}</span></p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(a)} className="text-muted hover:text-gold transition-colors" title="Modifier">
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setPreviewArticle({ article: { title: a.title, slug: a.slug, category: a.category, excerpt: a.excerpt, content: a.content ?? '', published: a.published }, image: a.image_url ? `${API_BASE}${a.image_url}` : null })}
                    className="text-muted hover:text-gold transition-colors" title="Aperçu">
                    <Eye size={14} />
                  </button>
                  <label className={`cursor-pointer text-muted hover:text-text transition-colors ${uploadingImage === a.id ? 'animate-pulse' : ''}`} title="Changer l'image">
                    <ImagePlus size={14} />
                    <input type="file" accept="image/*" className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) uploadImageForArticle(a.id, f) }} />
                  </label>
                  {a.published && (
                    <Link to={`/news/${a.slug}`} target="_blank" className="text-muted hover:text-text transition-colors" title="Voir l'article (publié)">
                      <ExternalLink size={14} />
                    </Link>
                  )}
                  <button onClick={() => togglePublish(a)} className="text-muted hover:text-text transition-colors" title={a.published ? 'Dépublier' : 'Publier'}>
                    {a.published ? <EyeOff size={14} /> : <Eye size={14} className="text-green-400/60" />}
                  </button>
                  <button onClick={() => handleDelete(a.id)} className="text-muted hover:text-red-400 transition-colors" title="Supprimer">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {previewArticle && (
        <ArticlePreviewModal
          article={previewArticle.article}
          imagePreview={previewArticle.image}
          onClose={() => setPreviewArticle(null)}
        />
      )}
    </div>
  )
}

// ── Badges ────────────────────────────────────────────────────────────────────

const BADGE_COLORS = [
  { value: 'text-gold',        label: 'Or',      preview: 'bg-gold'        },
  { value: 'text-purple-400',  label: 'Violet',  preview: 'bg-purple-400'  },
  { value: 'text-blue-400',    label: 'Bleu',    preview: 'bg-blue-400'    },
  { value: 'text-green-400',   label: 'Vert',    preview: 'bg-green-400'   },
  { value: 'text-red-400',     label: 'Rouge',   preview: 'bg-red-400'     },
  { value: 'text-orange-400',  label: 'Orange',  preview: 'bg-orange-400'  },
  { value: 'text-cyan-400',    label: 'Cyan',    preview: 'bg-cyan-400'    },
  { value: 'text-pink-400',    label: 'Rose',    preview: 'bg-pink-400'    },
]

interface Badge {
  id: string
  name: string
  description: string | null
  icon: string
  icon_url: string | null
  color: string
  season: string | null
  created_at: string
}

interface UserBadge {
  badge: Badge
  assigned_at: string
}


function BadgeIcon({ badge, size = 24 }: { badge: Badge; size?: number }) {
  if (badge.icon_url) {
    const url = badge.icon_url.startsWith('/') ? `${API_BASE}${badge.icon_url}` : badge.icon_url
    return <img src={url} alt={badge.name} style={{ width: size, height: size }} className="object-contain" />
  }
  return <span style={{ fontSize: size * 0.8 }} className="leading-none">{badge.icon}</span>
}

function BadgesTab({ users }: { users: { id: string; username: string }[] }) {
  const [badges, setBadges] = useState<Badge[]>([])
  const [form, setForm] = useState({ name: '', description: '', icon: '🏆', color: 'text-gold', season: '' })
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [iconPreview, setIconPreview] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const iconFileRef = useRef<HTMLInputElement>(null)

  // Attribution
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)
  const [userBadges, setUserBadges] = useState<Record<string, UserBadge[]>>({})
  const [assigning, setAssigning] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')

  useEffect(() => {
    authFetch(`${API_BASE}/admin/badges`)
      .then(r => r.json()).then(setBadges).catch(() => {})
  }, [])

  async function loadUserBadges(userId: string) {
    if (userBadges[userId]) return
    const res = await authFetch(`${API_BASE}/admin/users/${userId}/badges`)
    if (res.ok) {
      const data = await res.json()
      setUserBadges(p => ({ ...p, [userId]: data }))
    }
  }

  function handleIconPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setIconFile(file)
    setIconPreview(URL.createObjectURL(file))
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setError(''); setSuccess(''); setSubmitting(true)
    try {
      const res = await authFetch(`${API_BASE}/admin/badges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, description: form.description || null, season: form.season || null }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.detail ?? 'Erreur')

      // upload icône custom si sélectionnée
      if (iconFile) {
        const fd = new FormData()
        fd.append('file', iconFile)
        const imgRes = await authFetch(`${API_BASE}/admin/badges/${json.id}/upload-icon`, { method: 'POST', body: fd })
        if (imgRes.ok) {
          const imgJson = await imgRes.json()
          json.icon_url = imgJson.icon_url
        }
      }

      setBadges(p => [json, ...p])
      setForm({ name: '', description: '', icon: '🏆', color: 'text-gold', season: '' })
      setIconFile(null); setIconPreview(null)
      setShowForm(false)
      setSuccess('Badge créé !')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce badge ? Il sera retiré à tous les joueurs.')) return
    const res = await authFetch(`${API_BASE}/admin/badges/${id}`, { method: 'DELETE' })
    if (res.ok) setBadges(p => p.filter(b => b.id !== id))
  }

  async function handleAssign(userId: string, badgeId: string) {
    setAssigning(true)
    const res = await authFetch(`${API_BASE}/admin/users/${userId}/badges/${badgeId}`, { method: 'POST' })
    if (res.ok) {
      // refresh
      const updated = await authFetch(`${API_BASE}/admin/users/${userId}/badges`)
      if (updated.ok) {
        const data = await updated.json()
        setUserBadges(p => ({ ...p, [userId]: data }))
      }
    }
    setAssigning(false)
  }

  async function handleRevoke(userId: string, badgeId: string) {
    const res = await authFetch(`${API_BASE}/admin/users/${userId}/badges/${badgeId}`, { method: 'DELETE' })
    if (res.ok) {
      setUserBadges(p => ({
        ...p,
        [userId]: (p[userId] ?? []).filter(ub => ub.badge.id !== badgeId),
      }))
    }
  }

  return (
    <div className="space-y-8">

      {/* Création badge */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-muted uppercase tracking-widest">Badges disponibles</p>
          <button onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-gold hover:bg-gold-light text-bg text-xs font-semibold transition-colors">
            <Plus size={12} /> Nouveau badge
          </button>
        </div>

        {success && (
          <div className="flex items-center gap-2 p-3 rounded border border-green-500/30 bg-green-500/10 mb-3">
            <Check size={13} className="text-green-400" /><p className="text-xs text-green-400">{success}</p>
          </div>
        )}

        {showForm && (
          <form onSubmit={handleCreate} className="rounded border border-border bg-card p-4 mb-4 space-y-3">
            {error && (
              <div className="flex items-center gap-2 p-2.5 rounded border border-red-500/30 bg-red-500/10">
                <AlertCircle size={12} className="text-red-400" /><p className="text-xs text-red-400">{error}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted mb-1">Nom</label>
                <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Ex: Champion Saison 1"
                  className="w-full px-3 py-2 rounded border border-border bg-surface text-text text-sm placeholder:text-muted/40 focus:outline-none focus:border-gold/50" />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Saison <span className="text-muted/50">(optionnel)</span></label>
                <input value={form.season} onChange={e => setForm(p => ({ ...p, season: e.target.value }))}
                  placeholder="Ex: Saison 1"
                  className="w-full px-3 py-2 rounded border border-border bg-surface text-text text-sm placeholder:text-muted/40 focus:outline-none focus:border-gold/50" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Description <span className="text-muted/50">(optionnel)</span></label>
              <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Ex: Meilleur joueur de la saison"
                className="w-full px-3 py-2 rounded border border-border bg-surface text-text text-sm placeholder:text-muted/40 focus:outline-none focus:border-gold/50" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted mb-1">Icône custom <span className="text-muted/50">(image)</span></label>
                <input ref={iconFileRef} type="file" accept="image/*" onChange={handleIconPick} className="hidden" />
                {iconPreview ? (
                  <div className="flex items-center gap-2">
                    <img src={iconPreview} alt="" className="w-10 h-10 object-contain rounded border border-border" />
                    <button type="button" onClick={() => { setIconFile(null); setIconPreview(null); if (iconFileRef.current) iconFileRef.current.value = '' }}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors">Retirer</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => iconFileRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 rounded border border-dashed border-border hover:border-gold/40 text-muted hover:text-text text-xs transition-colors">
                    <ImagePlus size={12} /> Choisir une image
                  </button>
                )}
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Emoji <span className="text-muted/50">(fallback sans image)</span></label>
                <input required value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))}
                  className="w-full px-3 py-2 rounded border border-border bg-surface text-text text-2xl focus:outline-none focus:border-gold/50" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Couleur du nom</label>
              <div className="flex gap-1.5 flex-wrap">
                {BADGE_COLORS.map(c => (
                  <button key={c.value} type="button" onClick={() => setForm(p => ({ ...p, color: c.value }))}
                    title={c.label}
                    className={`w-6 h-6 rounded-full ${c.preview} transition-transform ${form.color === c.value ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'}`} />
                ))}
              </div>
            </div>
            {/* Aperçu */}
            <div className="flex items-center gap-2 p-3 rounded border border-border bg-surface/50">
              {iconPreview
                ? <img src={iconPreview} alt="" className="w-6 h-6 object-contain" />
                : <span className="text-lg">{form.icon}</span>
              }
              <span className={`text-sm font-semibold ${form.color}`}>{form.name || 'Nom du badge'}</span>
              {form.season && <span className="text-xs text-muted">· {form.season}</span>}
              {form.description && <span className="text-xs text-muted italic truncate">· {form.description}</span>}
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={submitting}
                className="px-4 py-2 rounded bg-gold hover:bg-gold-light text-bg text-xs font-semibold transition-colors disabled:opacity-50">
                {submitting ? 'Création...' : 'Créer'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setError('') }}
                className="px-4 py-2 rounded border border-border text-muted hover:text-text text-xs transition-colors">
                Annuler
              </button>
            </div>
          </form>
        )}

        {/* Liste des badges */}
        {badges.length === 0 ? (
          <p className="text-center py-8 text-muted text-sm">Aucun badge créé pour l'instant.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {badges.map(b => (
              <div key={b.id} className="flex items-center gap-3 p-3 rounded border border-border bg-card">
                <BadgeIcon badge={b} size={32} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${b.color}`}>{b.name}</p>
                  <p className="text-xs text-muted truncate">{b.season && `${b.season} · `}{b.description || 'Aucune description'}</p>
                </div>
                <button onClick={() => handleDelete(b.id)} className="text-muted hover:text-red-400 transition-colors flex-shrink-0">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Attribution par joueur */}
      <div>
        <p className="text-xs text-muted uppercase tracking-widest mb-3">Attribuer des badges</p>
        <div className="rounded border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface/40">
                <th className="text-left px-4 py-2.5 text-[10px] font-medium text-muted uppercase tracking-widest">Joueur</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-medium text-muted uppercase tracking-widest">Badges attribués</th>
                <th className="text-right px-4 py-2.5 text-[10px] font-medium text-muted uppercase tracking-widest">Ajouter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {users.map((u, i) => {
                const ubs = userBadges[u.id]
                return (
                  <tr key={u.id} className={i % 2 === 0 ? 'bg-card/40' : ''}
                    onMouseEnter={() => loadUserBadges(u.id)}>
                    <td className="px-4 py-3 text-sm text-text font-medium">{u.username}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {ubs === undefined && <span className="text-xs text-muted/40">—</span>}
                        {ubs?.length === 0 && <span className="text-xs text-muted/40">Aucun badge</span>}
                        {ubs?.map(ub => (
                          <button key={ub.badge.id} onClick={() => handleRevoke(u.id, ub.badge.id)}
                            title={`Retirer ${ub.badge.name}`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-border bg-surface hover:border-red-400/40 hover:bg-red-400/5 transition-colors group">
                            <BadgeIcon badge={ub.badge} size={16} />
                            <span className={`text-[11px] font-medium ${ub.badge.color} group-hover:text-red-400 transition-colors`}>{ub.badge.name}</span>
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {badges.length > 0 && (
                        <div className="flex items-center justify-end gap-1.5">
                          <select
                            value={selectedUserId === u.id ? selectedBadge?.id ?? '' : ''}
                            onChange={e => { setSelectedUserId(u.id); setSelectedBadge(badges.find(b => b.id === e.target.value) ?? null) }}
                            className="text-[10px] bg-surface border border-border rounded px-1.5 py-1 text-muted focus:outline-none focus:border-gold/40"
                          >
                            <option value="">Choisir...</option>
                            {badges
                              .filter(b => !ubs?.some(ub => ub.badge.id === b.id))
                              .map(b => <option key={b.id} value={b.id}>{b.icon} {b.name}</option>)}
                          </select>
                          <button
                            disabled={assigning || selectedUserId !== u.id || !selectedBadge}
                            onClick={() => selectedBadge && handleAssign(u.id, selectedBadge.id).then(() => { setSelectedBadge(null); setSelectedUserId('') })}
                            className="px-2 py-1 rounded bg-gold/20 hover:bg-gold/30 text-gold text-[10px] font-semibold transition-colors disabled:opacity-30">
                            <Plus size={11} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Engagement ────────────────────────────────────────────────────────────────

const EMOJI_MAP: Record<string, string> = {
  fire: '🔥', heart: '❤️', gg: '👏', surprised: '😮',
}

interface ReactionStat {
  id: string
  title: string
  slug: string
  views: number
  total: number
  counts: Record<string, number>
}

function EngagementTab() {
  const [stats, setStats] = useState<ReactionStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authFetch(`${API_BASE}/admin/reactions-stats`)
      .then(r => r.json()).then(setStats).catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const totalViews = stats.reduce((s, a) => s + a.views, 0)
  const totalReactions = stats.reduce((s, a) => s + a.total, 0)
  const topEmojis = Object.entries(
    stats.reduce((acc, a) => {
      Object.entries(a.counts).forEach(([e, n]) => { acc[e] = (acc[e] ?? 0) + n })
      return acc
    }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1])

  if (loading) return <p className="text-muted text-xs py-8 text-center">Chargement...</p>

  return (
    <div className="space-y-6">
      {/* Résumé global */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded border border-gold/30 bg-gold/5">
          <p className="text-xs text-muted uppercase tracking-widest mb-2">Vues totales</p>
          <p className="font-heading font-bold text-2xl text-gold-light">{totalViews}</p>
        </div>
        <div className="p-4 rounded border border-border bg-card">
          <p className="text-xs text-muted uppercase tracking-widest mb-2">Réactions</p>
          <p className="font-heading font-bold text-2xl text-gold-light">{totalReactions}</p>
        </div>
        {topEmojis.map(([emoji, count]) => (
          <div key={emoji} className="p-4 rounded border border-border bg-card">
            <p className="text-xs text-muted uppercase tracking-widest mb-2">{EMOJI_MAP[emoji]}</p>
            <p className="font-heading font-bold text-2xl text-text">{count}</p>
          </div>
        ))}
      </div>

      {/* Classement des articles */}
      <div>
        <p className="text-xs text-muted uppercase tracking-widest mb-3">Articles par engagement</p>
        {stats.length === 0 ? (
          <p className="text-center py-10 text-muted text-sm">Aucune réaction enregistrée pour l'instant.</p>
        ) : (
          <div className="rounded border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface/40">
                  <th className="text-left px-4 py-2.5 text-[10px] font-medium text-muted uppercase tracking-widest">#</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-medium text-muted uppercase tracking-widest">Article</th>
                  <th className="text-right px-4 py-2.5 text-[10px] font-medium text-muted uppercase tracking-widest">Vues</th>
                  <th className="text-center px-3 py-2.5 text-[10px] font-medium text-muted uppercase tracking-widest">🔥</th>
                  <th className="text-center px-3 py-2.5 text-[10px] font-medium text-muted uppercase tracking-widest">❤️</th>
                  <th className="text-center px-3 py-2.5 text-[10px] font-medium text-muted uppercase tracking-widest">👏</th>
                  <th className="text-center px-3 py-2.5 text-[10px] font-medium text-muted uppercase tracking-widest">😮</th>
                  <th className="text-right px-4 py-2.5 text-[10px] font-medium text-muted uppercase tracking-widest">Réactions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {stats.map((a, i) => (
                  <tr key={a.id} className={i % 2 === 0 ? 'bg-card/40' : ''}>
                    <td className="px-4 py-3 text-xs text-muted font-mono">{i + 1}</td>
                    <td className="px-4 py-3">
                      <Link to={`/news/${a.slug}`} target="_blank"
                        className="text-sm text-text hover:text-gold transition-colors line-clamp-1">
                        {a.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-gold-light">{a.views}</td>
                    <td className="px-3 py-3 text-center text-sm text-muted">{a.counts.fire || '—'}</td>
                    <td className="px-3 py-3 text-center text-sm text-muted">{a.counts.heart || '—'}</td>
                    <td className="px-3 py-3 text-center text-sm text-muted">{a.counts.gg || '—'}</td>
                    <td className="px-3 py-3 text-center text-sm text-muted">{a.counts.surprised || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-semibold text-text">{a.total || '—'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Users ─────────────────────────────────────────────────────────────────────

const GRADE_OPTIONS = [
  { value: '', label: '— Aucun grade —' },
  ...Object.entries(GRADES).map(([k, v]) => ({ value: k, label: v.label })),
]

function UsersTab({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    authFetch(`${API_BASE}/admin/users`)
      .then(r => r.json()).then(setUsers).catch(() => {})
  }, [])

  async function toggleAdmin(u: User) {
    if (u.id === currentUserId) return
    const res = await authFetch(`${API_BASE}/admin/users/${u.id}/toggle-admin`, { method: 'PATCH' })
    if (res.ok) { const updated = await res.json(); setUsers(p => p.map(x => x.id === u.id ? updated : x)) }
  }

  async function setGrade(u: User, grade: string) {
    const res = await authFetch(`${API_BASE}/admin/users/${u.id}/grade`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grade: grade || null }),
    })
    if (res.ok) { const updated = await res.json(); setUsers(p => p.map(x => x.id === u.id ? updated : x)) }
  }

  return (
    <div>
      <p className="text-xs text-muted mb-4">{users.length} membre{users.length !== 1 ? 's' : ''} inscrits</p>
      <div className="rounded border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface/40">
              <th className="text-left px-4 py-2.5 text-[10px] font-medium text-muted uppercase tracking-widest">Joueur</th>
              <th className="text-left px-4 py-2.5 text-[10px] font-medium text-muted uppercase tracking-widest hidden md:table-cell">Email</th>
              <th className="text-left px-4 py-2.5 text-[10px] font-medium text-muted uppercase tracking-widest hidden sm:table-cell">Inscription</th>
              <th className="text-left px-4 py-2.5 text-[10px] font-medium text-muted uppercase tracking-widest">Grade</th>
              <th className="text-center px-4 py-2.5 text-[10px] font-medium text-muted uppercase tracking-widest">Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {users.map((u, i) => (
              <tr key={u.id} className={i % 2 === 0 ? 'bg-card/40' : ''}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold font-bold uppercase flex-shrink-0" style={{ fontSize: '9px' }}>
                      {u.username[0]}
                    </div>
                    <span className="text-sm text-text font-medium">{u.username}</span>
                    {u.id === currentUserId && <span className="text-[10px] text-muted">(vous)</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-muted hidden md:table-cell">{u.email}</td>
                <td className="px-4 py-3 text-xs text-muted hidden sm:table-cell">{fmt(u.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <GradeBadge grade={u.grade} />
                    <select
                      value={u.grade ?? ''}
                      onChange={e => setGrade(u, e.target.value)}
                      className="text-[10px] bg-surface border border-border rounded px-1.5 py-1 text-muted focus:outline-none focus:border-gold/40 transition-colors"
                    >
                      {GRADE_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => toggleAdmin(u)}
                    disabled={u.id === currentUserId}
                    className={`transition-colors ${u.id === currentUserId ? 'opacity-40 cursor-default' : 'hover:scale-110'}`}
                    title={u.is_admin ? 'Retirer admin' : 'Passer admin'}
                  >
                    {u.is_admin
                      ? <Shield size={15} className="text-gold mx-auto" />
                      : <ShieldOff size={15} className="text-muted mx-auto" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Dashboard principal ───────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview',    label: 'Vue d\'ensemble', icon: LayoutDashboard },
  { id: 'news',        label: 'News',            icon: Newspaper },
  { id: 'users',       label: 'Joueurs',         icon: Users },
  { id: 'badges',      label: 'Badges',          icon: Medal },
  { id: 'engagement',  label: 'Engagement',      icon: Flame },
]

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('overview')
  const [allUsers, setAllUsers] = useState<User[]>([])

  useEffect(() => {
    if (!loading && (!user || !user.is_admin)) navigate('/')
  }, [user, loading])

  useEffect(() => {
    if (user?.is_admin) {
      authFetch(`${API_BASE}/admin/users`)
        .then(r => r.json()).then(setAllUsers).catch(() => {})
    }
  }, [user])

  if (loading || !user) return null

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Crown size={14} className="text-gold" />
        <h1 className="font-heading text-sm font-semibold text-gold tracking-widest uppercase">Dashboard Admin</h1>
        <span className="ml-auto text-xs text-muted">{user.username}</span>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 mb-6 border-b border-border">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors -mb-px ${
              tab === id
                ? 'text-gold border-gold'
                : 'text-muted border-transparent hover:text-text'
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* Contenu */}
      {tab === 'overview'   && <Overview onTab={setTab} />}
      {tab === 'news'       && <NewsTab />}
      {tab === 'users'      && <UsersTab currentUserId={user.id} />}
      {tab === 'badges'     && <BadgesTab users={allUsers} />}
      {tab === 'engagement' && <EngagementTab />}
    </div>
  )
}
