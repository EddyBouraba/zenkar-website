import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Crown, AlertCircle, Check } from 'lucide-react'
import { API_BASE } from '../lib/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail ?? 'Erreur serveur')
      }
      setDone(true)
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
          <h1 className="font-heading text-2xl font-bold text-gold-light">Mot de passe oublié</h1>
          <p className="text-muted text-sm mt-1">Entre ton email pour recevoir un lien de réinitialisation</p>
        </div>

        <div className="p-6 rounded border border-border bg-card">
          {done ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/25 flex items-center justify-center">
                <Check size={20} className="text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-text mb-1">Email envoyé !</p>
                <p className="text-xs text-muted leading-relaxed">
                  Si l'adresse <span className="text-text font-mono">{email}</span> est associée à un compte,
                  tu recevras un lien valable <strong className="text-text">1 heure</strong>.
                </p>
                <p className="text-xs text-muted mt-2">Pense à vérifier tes spams.</p>
              </div>
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
                  <label className="block text-xs text-muted mb-1.5">Adresse email</label>
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded bg-gold hover:bg-gold-light text-bg font-medium text-sm transition-colors disabled:opacity-50"
                >
                  {loading ? 'Envoi...' : 'Envoyer le lien'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-muted mt-6">
          <Link to="/connexion" className="text-gold hover:text-gold-light transition-colors">
            ← Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  )
}
