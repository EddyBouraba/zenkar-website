import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Crown, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { apiLogin, useAuth } from '../hooks/useAuth'

const DISCORD_SVG = (
  <svg width="18" height="14" viewBox="0 0 127.14 96.36" fill="currentColor">
    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
  </svg>
)

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { refreshUser } = useAuth()
  const from = (location.state as any)?.from ?? '/'
  const [showPwd, setShowPwd] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await apiLogin(email, password)
      await refreshUser()
      navigate(from, { replace: true })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Crown size={30} className="text-gold mx-auto mb-3" />
          <h1 className="font-heading text-2xl font-bold text-gold-light">Connexion</h1>
          <p className="text-muted text-sm mt-1">Bienvenue de retour sur Zenkar</p>
        </div>

        <div className="p-6 rounded border border-border bg-card">

          {/* Discord */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 py-2.5 rounded border border-indigo-500/40 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 text-sm font-medium transition-colors mb-6"
          >
            {DISCORD_SVG}
            Continuer avec Discord
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded border border-red-500/30 bg-red-500/10 mb-4">
              <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs text-muted mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="ton@email.com"
                required
                className="w-full px-3 py-2.5 rounded border border-border bg-surface text-text text-sm placeholder:text-muted/40 focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs text-muted">Mot de passe</label>
              </div>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2.5 pr-10 rounded border border-border bg-surface text-text text-sm placeholder:text-muted/40 focus:outline-none focus:border-gold/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors"
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded bg-gold hover:bg-gold-light text-bg font-medium text-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted mt-6">
          Pas encore de compte ?{' '}
          <Link to="/inscription" className="text-gold hover:text-gold-light transition-colors">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  )
}
