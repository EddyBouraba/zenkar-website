import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Crown, User, Mail, Calendar, LogOut, Shield, Sword, Check, AlertCircle, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { API_BASE } from '../lib/api'

const DISCORD_SVG = (
  <svg width="14" height="11" viewBox="0 0 127.14 96.36" fill="currentColor">
    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
  </svg>
)

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function token() { return localStorage.getItem('token') ?? '' }

export default function Profile() {
  const { user: maybeUser, logout, login } = useAuth()
  const user = maybeUser!
  const navigate = useNavigate()

  const [mcInput, setMcInput] = useState('')
  const [mcLoading, setMcLoading] = useState(false)
  const [mcError, setMcError] = useState('')
  const [mcSuccess, setMcSuccess] = useState('')

  function handleLogout() {
    logout()
    navigate('/')
  }

  async function linkMinecraft(e: React.FormEvent) {
    e.preventDefault()
    setMcError(''); setMcSuccess(''); setMcLoading(true)
    try {
      const res = await fetch(`${API_BASE}/auth/minecraft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ username: mcInput.trim() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.detail ?? 'Erreur')
      await login(token())
      setMcSuccess(`Compte lié : ${json.minecraft_username}`)
      setMcInput('')
    } catch (err: any) {
      setMcError(err.message)
    } finally {
      setMcLoading(false)
    }
  }

  async function unlinkMinecraft() {
    setMcError(''); setMcSuccess(''); setMcLoading(true)
    try {
      const res = await fetch(`${API_BASE}/auth/minecraft`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` },
      })
      if (!res.ok) throw new Error('Erreur')
      await login(token())
      setMcSuccess('Compte Minecraft délié.')
    } catch (err: any) {
      setMcError(err.message)
    } finally {
      setMcLoading(false)
    }
  }

  const skinHeadUrl = user.minecraft_username
    ? `https://minotar.net/avatar/${user.minecraft_username}/40`
    : null

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">

      {/* En-tête profil */}
      <div className="flex items-center gap-4 mb-8">
        {user.discord_avatar ? (
          <img
            src={`https://cdn.discordapp.com/avatars/${user.discord_id}/${user.discord_avatar}.webp?size=80`}
            alt={user.username}
            className="w-16 h-16 rounded-full border-2 border-gold/30"
          />
        ) : skinHeadUrl ? (
          <img
            src={skinHeadUrl}
            alt={user.username}
            className="w-16 h-16 rounded border-2 border-gold/30"
            style={{ imageRendering: 'pixelated' }}
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gold/10 border-2 border-gold/30 flex items-center justify-center text-gold font-heading text-2xl font-bold uppercase">
            {user.username[0]}
          </div>
        )}
        <div>
          <h1 className="font-heading text-xl font-bold text-gold-light">{user.username}</h1>
          <p className="text-xs text-muted mt-0.5">Membre depuis le {formatDate(user.created_at)}</p>
        </div>
        <div className="ml-auto">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-gold/25 bg-gold/10 text-gold/80 text-xs">
            <Crown size={11} />
            Fondateur
          </span>
        </div>
      </div>

      {/* Infos du compte */}
      <div className="rounded border border-border bg-card divide-y divide-border mb-6">
        <div className="px-5 py-3 flex items-center gap-3">
          <User size={14} className="text-muted flex-shrink-0" />
          <span className="text-xs text-muted w-24">Pseudo</span>
          <span className="text-sm text-text">{user.username}</span>
        </div>
        <div className="px-5 py-3 flex items-center gap-3">
          <Mail size={14} className="text-muted flex-shrink-0" />
          <span className="text-xs text-muted w-24">Email</span>
          <span className="text-sm text-text">{user.email}</span>
        </div>
        <div className="px-5 py-3 flex items-center gap-3">
          <Calendar size={14} className="text-muted flex-shrink-0" />
          <span className="text-xs text-muted w-24">Inscription</span>
          <span className="text-sm text-text">{formatDate(user.created_at)}</span>
        </div>
        <div className="px-5 py-3 flex items-center gap-3">
          <Shield size={14} className="text-muted flex-shrink-0" />
          <span className="text-xs text-muted w-24">Rôle</span>
          <span className="text-sm text-text">{user.is_admin ? 'Admin' : 'Joueur'}</span>
        </div>
      </div>

      {/* Minecraft */}
      <div className="rounded border border-border bg-card p-5 mb-6">
        <h2 className="text-xs font-medium text-muted uppercase tracking-widest mb-4">Compte Minecraft</h2>

        {mcError && (
          <div className="flex items-center gap-2 p-2.5 rounded border border-red-500/30 bg-red-500/10 mb-3">
            <AlertCircle size={12} className="text-red-400 flex-shrink-0" />
            <p className="text-xs text-red-400">{mcError}</p>
          </div>
        )}
        {mcSuccess && (
          <div className="flex items-center gap-2 p-2.5 rounded border border-green-500/30 bg-green-500/10 mb-3">
            <Check size={12} className="text-green-400 flex-shrink-0" />
            <p className="text-xs text-green-400">{mcSuccess}</p>
          </div>
        )}

        {user.minecraft_username ? (
          <div className="flex items-center gap-3">
            {skinHeadUrl ? (
              <img
                src={skinHeadUrl}
                alt={user.minecraft_username}
                className="w-10 h-10 rounded border border-border"
                style={{ imageRendering: 'pixelated' }}
              />
            ) : (
              <div className="w-10 h-10 rounded border border-border bg-surface flex items-center justify-center">
                <Sword size={14} className="text-muted" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text font-medium">{user.minecraft_username}</p>
              <p className="text-xs text-muted font-mono truncate">{user.minecraft_uuid}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
              <button
                onClick={unlinkMinecraft}
                disabled={mcLoading}
                className="p-1.5 rounded text-muted hover:text-red-400 transition-colors disabled:opacity-40"
                title="Délier le compte Minecraft"
              >
                <X size={13} />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={linkMinecraft} className="flex items-center gap-2">
            <input
              value={mcInput}
              onChange={e => setMcInput(e.target.value)}
              placeholder="Ton pseudo Minecraft..."
              required
              className="flex-1 px-3 py-2 rounded border border-border bg-surface text-text text-sm placeholder:text-muted/40 focus:outline-none focus:border-gold/50"
            />
            <button
              type="submit"
              disabled={mcLoading || !mcInput.trim()}
              className="flex items-center gap-1.5 px-3 py-2 rounded border border-green-600/40 bg-green-600/10 hover:bg-green-600/20 text-green-400 text-xs font-medium transition-colors disabled:opacity-40 whitespace-nowrap"
            >
              <Sword size={12} />
              {mcLoading ? 'Vérification...' : 'Lier'}
            </button>
          </form>
        )}
      </div>

      {/* Discord */}
      <div className="rounded border border-border bg-card p-5 mb-6">
        <h2 className="text-xs font-medium text-muted uppercase tracking-widest mb-4">Compte Discord</h2>
        {user.discord_id ? (
          <div className="flex items-center gap-3">
            {user.discord_avatar ? (
              <img
                src={`https://cdn.discordapp.com/avatars/${user.discord_id}/${user.discord_avatar}.webp?size=40`}
                alt={user.discord_username ?? ''}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                {DISCORD_SVG}
              </div>
            )}
            <div>
              <p className="text-sm text-text">{user.discord_username}</p>
              <p className="text-xs text-muted">Compte lié</p>
            </div>
            <span className="ml-auto w-2 h-2 rounded-full bg-green-400" />
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">Aucun compte Discord lié</p>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded border border-indigo-500/40 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 text-xs font-medium transition-colors">
              {DISCORD_SVG}
              Lier Discord
            </button>
          </div>
        )}
      </div>

      {/* Déconnexion */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-2 rounded border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-sm transition-colors"
      >
        <LogOut size={14} />
        Se déconnecter
      </button>

    </div>
  )
}
