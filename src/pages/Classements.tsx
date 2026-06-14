import { useState, useEffect } from 'react'
import { Crown, Coins, Clock, Swords, Landmark, RefreshCw, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { API_BASE } from '../lib/api'
import SEO from '../components/SEO'

// ── Types ─────────────────────────────────────────────────────────────────────

interface LbPlayer {
  uuid: string
  username: string
  money: number
  playtime_ticks: number
  kills: number
  deaths: number
  kdr: number
  jobs: Record<string, { level: number; xp: number }>
  last_synced: string
}

interface LbGuild {
  id: string
  name: string
  tier_level: number
  tier_name: string
  members_count: number
  max_members: number
  leader_name: string
  balance: number
  last_synced: string
}

type Tab = 'money' | 'playtime' | 'kills' | 'guilds'

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtMoney(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M $`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k $`
  return `${Math.floor(n)} $`
}

function fmtPlaytime(ticks: number) {
  const secs  = Math.floor(ticks / 20)
  const mins  = Math.floor(secs / 60)
  const hours = Math.floor(mins / 60)
  const days  = Math.floor(hours / 24)
  if (days > 0)  return `${days}j ${hours % 24}h`
  if (hours > 0) return `${hours}h ${mins % 60}m`
  return `${mins}m`
}

function fmtSyncDate(iso: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const TIER_COLORS: Record<number, string> = {
  1: 'text-text border-border',
  2: 'text-green-400 border-green-500/30',
  3: 'text-blue-400 border-blue-500/30',
  4: 'text-purple-400 border-purple-500/30',
  5: 'text-gold border-gold/40',
}

const RANK_STYLE: Record<number, string> = {
  1: 'text-gold font-bold text-base',
  2: 'text-text/70 font-semibold',
  3: 'text-amber-600 font-semibold',
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ title, right }: { title: string; right?: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <Crown size={14} className="text-gold" />
          <h1 className="font-heading text-sm font-semibold text-gold tracking-widest uppercase">{title}</h1>
        </div>
        {right && <span className="text-xs text-muted">{right}</span>}
      </div>
      <div className="h-px" style={{ background: 'linear-gradient(to right, rgba(201,168,76,0.5), transparent)' }} />
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="space-y-1.5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 rounded border border-border bg-card animate-pulse" />
      ))}
    </div>
  )
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: typeof Crown }[] = [
  { id: 'money',   label: 'Argent',       icon: Coins    },
  { id: 'playtime',label: 'Temps de jeu', icon: Clock    },
  { id: 'kills',   label: 'Kills PvP',    icon: Swords   },
  { id: 'guilds',  label: 'Guildes',      icon: Landmark },
]

// ── Players table ─────────────────────────────────────────────────────────────

function PlayersTable({ players, tab }: { players: LbPlayer[]; tab: Tab }) {
  if (players.length === 0) {
    return (
      <div className="text-center py-16 text-muted text-sm">
        Aucune donnée pour l'instant — la synchronisation a lieu toutes les 30 minutes.
      </div>
    )
  }

  return (
    <div className="rounded border border-border overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-surface/40">
            <th className="text-left px-4 py-2.5 text-[10px] font-medium text-muted uppercase tracking-widest w-10">#</th>
            <th className="text-left px-4 py-2.5 text-[10px] font-medium text-muted uppercase tracking-widest">Joueur</th>
            {tab === 'money' && (
              <th className="text-right px-4 py-2.5 text-[10px] font-medium text-muted uppercase tracking-widest">Argent</th>
            )}
            {tab === 'playtime' && (
              <th className="text-right px-4 py-2.5 text-[10px] font-medium text-muted uppercase tracking-widest">Temps de jeu</th>
            )}
            {tab === 'kills' && (
              <>
                <th className="text-right px-4 py-2.5 text-[10px] font-medium text-muted uppercase tracking-widest">Kills</th>
                <th className="text-right px-4 py-2.5 text-[10px] font-medium text-muted uppercase tracking-widest hidden sm:table-cell">Morts</th>
                <th className="text-right px-4 py-2.5 text-[10px] font-medium text-muted uppercase tracking-widest">K/D</th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {players.map((p, i) => {
            const rank = i + 1
            return (
              <tr key={p.uuid} className={i % 2 === 0 ? 'bg-card/40' : ''}>
                <td className="px-4 py-3">
                  <span className={`font-mono text-sm ${RANK_STYLE[rank] ?? 'text-muted'}`}>
                    {rank === 1 ? '👑' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-text font-medium">{p.username}</span>
                </td>
                {tab === 'money' && (
                  <td className="px-4 py-3 text-right">
                    <span className="font-heading font-bold text-gold-light text-sm">{fmtMoney(p.money)}</span>
                  </td>
                )}
                {tab === 'playtime' && (
                  <td className="px-4 py-3 text-right">
                    <span className="font-heading font-bold text-blue-400 text-sm">{fmtPlaytime(p.playtime_ticks)}</span>
                  </td>
                )}
                {tab === 'kills' && (
                  <>
                    <td className="px-4 py-3 text-right">
                      <span className="font-heading font-bold text-red-400 text-sm">{p.kills}</span>
                    </td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell">
                      <span className="text-sm text-muted">{p.deaths}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-semibold ${p.kdr >= 2 ? 'text-green-400' : p.kdr >= 1 ? 'text-text' : 'text-red-400/70'}`}>
                        {p.kdr.toFixed(2)}
                      </span>
                    </td>
                  </>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Guilds table ──────────────────────────────────────────────────────────────

function GuildsTable({ guilds }: { guilds: LbGuild[] }) {
  if (guilds.length === 0) {
    return (
      <div className="text-center py-16 text-muted text-sm">
        Aucune guilde pour l'instant — crée la tienne sur le serveur !
      </div>
    )
  }

  return (
    <div className="rounded border border-border overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-surface/40">
            <th className="text-left px-4 py-2.5 text-[10px] font-medium text-muted uppercase tracking-widest w-10">#</th>
            <th className="text-left px-4 py-2.5 text-[10px] font-medium text-muted uppercase tracking-widest">Guilde</th>
            <th className="text-left px-4 py-2.5 text-[10px] font-medium text-muted uppercase tracking-widest hidden md:table-cell">Chef</th>
            <th className="text-center px-4 py-2.5 text-[10px] font-medium text-muted uppercase tracking-widest">Membres</th>
            <th className="text-right px-4 py-2.5 text-[10px] font-medium text-muted uppercase tracking-widest hidden sm:table-cell">Trésor</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {guilds.map((g, i) => {
            const rank = i + 1
            const tierCls = TIER_COLORS[g.tier_level] ?? TIER_COLORS[1]
            return (
              <tr key={g.id} className={i % 2 === 0 ? 'bg-card/40' : ''}>
                <td className="px-4 py-3">
                  <span className={`font-mono text-sm ${RANK_STYLE[rank] ?? 'text-muted'}`}>
                    {rank === 1 ? '👑' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm text-text font-semibold">{g.name}</span>
                    <span className={`text-[10px] font-medium border px-1.5 py-0.5 rounded font-heading ${tierCls}`}>
                      {g.tier_name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted hidden md:table-cell">{g.leader_name}</td>
                <td className="px-4 py-3 text-center">
                  <span className="text-sm text-text font-medium">{g.members_count}</span>
                  <span className="text-xs text-muted">/{g.max_members}</span>
                </td>
                <td className="px-4 py-3 text-right hidden sm:table-cell">
                  <span className="text-sm font-heading font-bold text-gold-light">{fmtMoney(g.balance)}</span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Gate (non connecté) ───────────────────────────────────────────────────────

function LoginGate() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
      <div className="w-14 h-14 rounded-full border border-gold/25 bg-gold/10 flex items-center justify-center">
        <Lock size={22} className="text-gold" />
      </div>
      <div>
        <p className="text-text font-semibold mb-1">Accès réservé aux membres</p>
        <p className="text-sm text-muted">Connecte-toi pour consulter les classements.</p>
      </div>
      <Link
        to="/connexion"
        className="px-5 py-2.5 rounded bg-gold hover:bg-gold-light text-bg text-sm font-semibold transition-colors"
      >
        Se connecter
      </Link>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Classements() {
  const { user, loading: authLoading } = useAuth()
  const [tab, setTab] = useState<Tab>('money')
  const [players, setPlayers] = useState<LbPlayer[]>([])
  const [guilds, setGuilds] = useState<LbGuild[]>([])
  const [lastSynced, setLastSynced] = useState<string | null>(null)
  const [dataLoading, setDataLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    if (tab === 'guilds') {
      setDataLoading(true)
      fetch(`${API_BASE}/leaderboard/guilds`)
        .then(r => r.json())
        .then(d => { setGuilds(d.guilds ?? []); setLastSynced(d.last_synced) })
        .catch(() => {})
        .finally(() => setDataLoading(false))
    } else {
      setDataLoading(true)
      fetch(`${API_BASE}/leaderboard/players?tab=${tab}&limit=25`)
        .then(r => r.json())
        .then(d => { setPlayers(d.players ?? []); setLastSynced(d.last_synced) })
        .catch(() => {})
        .finally(() => setDataLoading(false))
    }
  }, [tab, user])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SEO
        title="Classements"
        description="Classements des meilleurs joueurs de Zenkar — argent, temps de jeu, kills PvP et guildes."
        canonical="/classements"
      />

      <SectionHeader
        title="Classements"
        right={lastSynced ? (
          <span className="flex items-center gap-1.5 text-muted">
            <RefreshCw size={10} />
            Sync {fmtSyncDate(lastSynced)}
          </span>
        ) as any : undefined}
      />

      {authLoading ? null : !user ? (
        <LoginGate />
      ) : (
        <>
          {/* Tabs */}
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

          {/* Content */}
          {dataLoading ? (
            <Skeleton rows={10} />
          ) : tab === 'guilds' ? (
            <GuildsTable guilds={guilds} />
          ) : (
            <PlayersTable players={players} tab={tab} />
          )}
        </>
      )}
    </div>
  )
}
