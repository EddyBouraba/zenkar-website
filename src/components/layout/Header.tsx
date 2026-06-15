import { Link, NavLink, useNavigate } from 'react-router-dom'
import { LogOut, LayoutDashboard } from 'lucide-react'
import { useServerStats } from '../../hooks/useServerStats'
import { useAuth } from '../../hooks/useAuth'

export default function Header() {
  const { stats } = useServerStats()
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

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
          Phase Bêta — Les Fondateurs
        </span>

        <div className="ml-auto flex items-center gap-3">
          {!loading && (
            user ? (
              <>
                {user.is_admin && (
                  <NavLink
                    to="/admin"
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm border border-gold/30 bg-gold/10 text-gold/80 hover:bg-gold/20 transition-colors"
                  >
                    <LayoutDashboard size={11} />
                    <span>Admin</span>
                  </NavLink>
                )}
                <NavLink to="/profil" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  {user.discord_avatar ? (
                    <img
                      src={`https://cdn.discordapp.com/avatars/${user.discord_id}/${user.discord_avatar}.webp?size=32`}
                      alt={user.username}
                      className="w-5 h-5 rounded-full"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold font-bold uppercase" style={{ fontSize: '9px' }}>
                      {user.username[0]}
                    </div>
                  )}
                  <span className="text-text font-medium">{user.username}</span>
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="text-muted hover:text-red-400 transition-colors"
                  title="Déconnexion"
                >
                  <LogOut size={13} />
                </button>
              </>
            ) : (
              <>
                <Link to="/connexion" className="text-muted hover:text-text transition-colors">
                  Connexion
                </Link>
                <Link
                  to="/inscription"
                  className="px-2.5 py-1 rounded-sm bg-gold hover:bg-gold-light text-bg font-semibold transition-colors"
                >
                  Inscription
                </Link>
              </>
            )
          )}
        </div>
      </div>
    </div>
  )
}
