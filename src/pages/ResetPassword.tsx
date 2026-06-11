import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Crown, Eye, EyeOff, AlertCircle, Check } from 'lucide-react'
import { API_BASE } from '../lib/api'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail ?? 'Erreur serveur')
      setDone(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <Crown size={30} className="text-gold mx-auto mb-3" />
          <p className="text-sm text-muted mb-4">Lien invalide ou manquant.</p>
          <Link to="/mot-de-passe-oublie" className="text-gold hover:text-gold-light text-sm transition-colors">
            Faire une nouvelle demande
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Crown size={30} className="text-gold mx-auto mb-3" />
          <h1 className="font-heading text-2xl font-bold text-gold-light">Nouveau mot de passe</h1>
          <p className="text-muted text-sm mt-1">Choisis un nouveau mot de passe pour ton compte</p>
        </div>

        <div className="p-6 rounded border border-border bg-card">
          {done ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/25 flex items-center justify-center">
                <Check size={20} className="text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-text mb-1">Mot de passe mis à jour !</p>
                <p className="text-xs text-muted">Tu peux maintenant te connecter avec ton nouveau mot de passe.</p>
              </div>
              <Link
                to="/connexion"
                className="mt-2 w-full py-2.5 rounded bg-gold hover:bg-gold-light text-bg font-medium text-sm transition-colors text-center block"
              >
                Se connecter
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-center gap-2 p-3 rounded border border-red-500/30 bg-red-500/10 mb-4">
                  <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-xs text-muted mb-1.5">Nouveau mot de passe</label>
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      minLength={8}
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
                  <p className="text-[11px] text-muted/60 mt-1">8 caractères minimum</p>
                </div>

                <div>
                  <label className="block text-xs text-muted mb-1.5">Confirmer le mot de passe</label>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    required
                    className="w-full px-3 py-2.5 rounded border border-border bg-surface text-text text-sm placeholder:text-muted/40 focus:outline-none focus:border-gold/50 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded bg-gold hover:bg-gold-light text-bg font-medium text-sm transition-colors disabled:opacity-50"
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer le nouveau mot de passe'}
                </button>
              </form>
            </>
          )}
        </div>

        {!done && (
          <p className="text-center text-sm text-muted mt-6">
            <Link to="/connexion" className="text-gold hover:text-gold-light transition-colors">
              ← Retour à la connexion
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
