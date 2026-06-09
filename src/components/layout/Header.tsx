import { Link } from 'react-router-dom'
import { useServerStats } from '../../hooks/useServerStats'

export default function Header() {
  const { stats } = useServerStats()

  return (
    <div className="bg-card border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 h-10 flex items-center gap-3 text-xs">

        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 animate-pulse ${
            stats?.status !== 'offline' ? 'bg-green-400' : 'bg-red-400'
          }`} />
          <span className="text-muted">
            {stats ? `${stats.players_online} joueurs en ligne` : '—'}
          </span>
        </div>

        <div className="h-3 w-px bg-border" />

        <span className="hidden sm:inline-flex px-2 py-0.5 rounded-sm border border-gold/25 bg-gold/10 text-gold/80">
          Saison 1 — Les Fondateurs
        </span>

        <div className="ml-auto flex items-center gap-3">
          <Link to="/connexion" className="text-muted hover:text-text transition-colors">
            Connexion
          </Link>
          <Link
            to="/inscription"
            className="px-2.5 py-1 rounded-sm bg-gold hover:bg-gold-light text-bg font-semibold transition-colors"
          >
            Inscription
          </Link>
        </div>
      </div>
    </div>
  )
}
