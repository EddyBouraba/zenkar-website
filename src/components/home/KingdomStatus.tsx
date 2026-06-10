import { useEffect, useState } from 'react'
import { Users, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { fetchStats, type ServerStats } from '../../lib/api'

const POLL_INTERVAL = 60_000

export default function KingdomStatus() {
  const [stats, setStats] = useState<ServerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  async function load() {
    try {
      const s = await fetchStats()
      setStats(s)
      setLastUpdate(new Date())
    } catch {
      // keep previous data on error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  const online = stats?.status === 'online'

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            {online
              ? <Wifi size={14} className="text-emerald-400" />
              : <WifiOff size={14} className="text-muted" />
            }
            <h2 className="font-heading text-sm font-semibold text-gold tracking-widest uppercase">
              État du Royaume
            </h2>
          </div>
          <button
            onClick={load}
            title="Actualiser"
            className="text-muted hover:text-gold transition-colors"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
        <div className="h-px" style={{ background: 'linear-gradient(to right, rgba(201,168,76,0.5), transparent)' }} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

        {/* Statut */}
        <div className="p-4 rounded border border-border/60 bg-card flex flex-col gap-2">
          <span className="text-[10px] text-muted uppercase tracking-widest">Statut</span>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${online ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]' : 'bg-red-500'}`} />
            <span className={`font-heading font-bold text-sm ${online ? 'text-emerald-400' : 'text-red-400'}`}>
              {loading ? '...' : online ? 'En ligne' : 'Hors ligne'}
            </span>
          </div>
        </div>

        {/* Joueurs */}
        <div className="p-4 rounded border border-border/60 bg-card flex flex-col gap-2">
          <span className="text-[10px] text-muted uppercase tracking-widest">Joueurs</span>
          <div className="flex items-center gap-2">
            <Users size={14} className="text-gold flex-shrink-0" />
            <span className="font-heading font-bold text-sm text-text">
              {loading ? '...' : `${stats?.players_online ?? 0} / ${stats?.max_players ?? 100}`}
            </span>
          </div>
        </div>

        {/* Version */}
        <div className="p-4 rounded border border-border/60 bg-card flex flex-col gap-2">
          <span className="text-[10px] text-muted uppercase tracking-widest">Version</span>
          <span className="font-heading font-bold text-sm text-text">
            {loading ? '...' : stats?.version ?? '—'}
          </span>
        </div>

        {/* TPS */}
        <div className="p-4 rounded border border-border/60 bg-card flex flex-col gap-2">
          <span className="text-[10px] text-muted uppercase tracking-widest">TPS</span>
          <span className={`font-heading font-bold text-sm ${
            !stats || stats.tps >= 18 ? 'text-emerald-400'
            : stats.tps >= 14 ? 'text-amber-400'
            : 'text-red-400'
          }`}>
            {loading ? '...' : stats ? `${stats.tps.toFixed(1)} / 20` : '—'}
          </span>
        </div>

      </div>

      {lastUpdate && (
        <p className="text-[10px] text-muted/50 mt-3 text-right">
          Mis à jour à {lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </p>
      )}

    </section>
  )
}
