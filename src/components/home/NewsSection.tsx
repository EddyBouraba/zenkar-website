import { Crown, ShoppingBag, Users, Server, MessageCircle, Play, AtSign, FileText, Twitch, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useNews } from '../../hooks/useNews'
import { useServerStats } from '../../hooks/useServerStats'
import { API_BASE } from '../../lib/api'

const CATEGORIES = {
  annonce:    { label: 'Annonce',      cls: 'text-gold bg-gold/10 border-gold/30',           bar: 'bg-gold/70' },
  event:      { label: 'Événement',   cls: 'text-purple-400 bg-purple-400/10 border-purple-400/30', bar: 'bg-purple-400/70' },
  update:     { label: 'Mise à jour', cls: 'text-blue-400 bg-blue-400/10 border-blue-400/30',        bar: 'bg-blue-400/70' },
  communaute: { label: 'Communauté',  cls: 'text-green-400 bg-green-400/10 border-green-400/30',     bar: 'bg-green-400/70' },
}


function fmt(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function SectionHeader({ title, right }: { title: string; right?: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <Crown size={14} className="text-gold" />
          <h2 className="font-heading text-sm font-semibold text-gold tracking-widest uppercase">{title}</h2>
        </div>
        {right && <span className="text-xs text-muted">{right}</span>}
      </div>
      <div className="h-px" style={{ background: 'linear-gradient(to right, rgba(201,168,76,0.5), transparent)' }} />
    </div>
  )
}

export default function NewsSection() {
  const { news, loading: newsLoading } = useNews()
  const { stats, loading: statsLoading } = useServerStats()

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Actualités */}
        <div className="lg:col-span-2">
          <SectionHeader title="Actualités" right={`Page 1 sur 1`} />

          <div className="space-y-3">
            {newsLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-32 rounded-xl bg-card border border-border animate-pulse" />
                ))
              : news.map(a => {
                  const cat = CATEGORIES[a.category]
                  return (
                    <Link
                      key={a.id}
                      to={`/news/${a.slug}`}
                      className="relative rounded border border-border bg-card overflow-hidden block
                                 hover:border-gold/30 transition-all duration-200 group"
                    >
                      {a.image_url && (
                        <div className="aspect-[3/1] overflow-hidden border-b border-border">
                          <img src={`${API_BASE}${a.image_url}`} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                      )}
                      <div className={`absolute left-0 ${a.image_url ? 'bottom-0 h-[60%]' : 'top-0 bottom-0'} w-0.5 ${cat.bar}`} />
                      <div className="px-5 py-4">
                        <div className="flex items-center gap-2 mb-2.5">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${cat.cls}`}>
                            {cat.label}
                          </span>
                          <span className="text-xs text-muted ml-auto">{fmt(a.created_at)}</span>
                        </div>
                        <h3 className="text-text font-semibold mb-1.5 group-hover:text-gold-light transition-colors text-sm">
                          {a.title}
                        </h3>
                        <p className="text-muted text-xs leading-relaxed mb-3 line-clamp-2">{a.excerpt}</p>
                        <span className="text-xs text-gold group-hover:text-gold-light transition-colors">
                          Lire la suite →
                        </span>
                      </div>
                    </Link>
                  )
                })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">

          {/* Soutenir */}
          <div className="p-5 rounded border border-gold/25 bg-card text-center"
            style={{ background: 'linear-gradient(135deg, #0f0d14 0%, #14110c 100%)' }}>
            <div className="w-10 h-10 rounded-full border border-gold/30 bg-gold/10 flex items-center justify-center mx-auto mb-3">
              <ShoppingBag size={18} className="text-gold" />
            </div>
            <h3 className="font-heading text-sm font-semibold text-gold-light mb-1">Soutenir Zenkar</h3>
            <p className="text-xs text-muted mb-4 leading-relaxed">
              Accède aux grades et cosmétiques exclusifs.
            </p>
            <a
              href="/boutique"
              className="block w-full py-2 rounded bg-gold hover:bg-gold-light text-bg text-xs font-medium transition-colors"
            >
              Ouvrir la boutique
            </a>
          </div>

          {/* Voter */}
          <div className="p-5 rounded border border-gold/25 bg-card text-center"
            style={{ background: 'linear-gradient(135deg, #0f0d14 0%, #110d14 100%)' }}>
            <div className="w-10 h-10 rounded-full border border-gold/30 bg-gold/10 flex items-center justify-center mx-auto mb-3">
              <Sparkles size={18} className="text-gold" />
            </div>
            <h3 className="font-heading text-sm font-semibold text-gold-light mb-1">Voter pour Zenkar</h3>
            <p className="text-xs text-muted mb-4 leading-relaxed">
              Chaque vote rapporte <span className="text-gold font-semibold">+100 Mystery Dust</span>.<br />
              4 sites disponibles.
            </p>
            <a
              href="/vote"
              className="block w-full py-2 rounded bg-gold hover:bg-gold-light text-bg text-xs font-medium transition-colors"
            >
              Voter maintenant
            </a>
          </div>

          {/* État du Royaume */}
          <div className="rounded border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Crown size={12} className="text-gold" />
                <span className="font-heading text-xs font-semibold text-gold tracking-widest uppercase">État du Royaume</span>
              </div>
            </div>
            {statsLoading ? (
              <div className="p-4 space-y-3">
                <div className="h-8 bg-surface rounded animate-pulse" />
                <div className="h-8 bg-surface rounded animate-pulse" />
              </div>
            ) : stats && (
              <div className="p-4 grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-muted mb-0.5">
                    <Users size={11} />
                    <span className="text-[10px] uppercase tracking-wider">Joueurs</span>
                  </div>
                  <p className="font-heading font-bold text-xl text-text">
                    {stats.players_online}
                    <span className="text-xs text-muted font-normal">/{stats.max_players}</span>
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-muted mb-0.5">
                    <Server size={11} />
                    <span className="text-[10px] uppercase tracking-wider">Version</span>
                  </div>
                  <p className="font-heading font-bold text-xl text-text">{stats.version}</p>
                </div>
                <div className="col-span-2 flex justify-center pt-1">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium ${
                    stats.status === 'online'
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${stats.status === 'online' ? 'bg-green-400' : 'bg-red-400'}`} />
                    {stats.status === 'online' ? 'En ligne' : 'Hors ligne'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Derniers sujets */}
          <div className="rounded border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Crown size={12} className="text-gold" />
                <span className="font-heading text-xs font-semibold text-gold tracking-widest uppercase">Derniers Sujets</span>
              </div>
            </div>
            <div className="px-4 py-6 flex flex-col items-center justify-center gap-2 text-center">
              <FileText size={18} className="text-muted/40" />
              <p className="text-xs text-muted">Forum bientôt disponible</p>
            </div>
          </div>

          {/* Communauté */}
          <div className="rounded border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Crown size={12} className="text-gold" />
                <span className="font-heading text-xs font-semibold text-gold tracking-widest uppercase">Communauté</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 p-3">
              {[
                { icon: MessageCircle, label: 'Discord',   color: 'text-indigo-400', border: 'border-indigo-500/30', bg: 'bg-indigo-500/10', href: 'https://discord.gg/SrbwjMCMbp' },
                { icon: Play,          label: 'YouTube',   color: 'text-red-400',    border: 'border-red-500/30',    bg: 'bg-red-500/10',    href: 'https://www.youtube.com/@zenkar_MC' },
                { icon: Twitch,        label: 'Twitch',    color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/10', href: '#' },
                { icon: AtSign,        label: 'Twitter',   color: 'text-sky-400',    border: 'border-sky-500/30',    bg: 'bg-sky-500/10',    href: 'https://x.com/ZenkarMC' },
              ].map(({ icon: Icon, label, color, border, bg, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 p-2.5 rounded border ${border} ${bg} text-xs text-text/80 hover:text-text transition-colors`}
                >
                  <Icon size={14} className={color} />
                  {label}
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
