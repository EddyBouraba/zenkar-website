import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Crown, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Turnstile } from '@marsidev/react-turnstile'
import type { TurnstileInstance } from '@marsidev/react-turnstile'
import { apiRegister, useAuth, ApiError } from '../hooks/useAuth'
import type { FieldErrors } from '../hooks/useAuth'

const DISCORD_SVG = (
  <svg width="18" height="14" viewBox="0 0 127.14 96.36" fill="currentColor">
    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
  </svg>
)

function pwdStrength(pwd: string) {
  return [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(pwd)).length
}

function getAge(dob: string) {
  if (!dob) return Infinity
  const b = new Date(dob), t = new Date()
  let a = t.getFullYear() - b.getFullYear()
  if (t.getMonth() - b.getMonth() < 0 || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) a--
  return a
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return (
    <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
      <AlertCircle size={11} className="flex-shrink-0" /> {msg}
    </p>
  )
}

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string

export default function Register() {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const turnstileRef = useRef<TurnstileInstance>(null)
  const [showPwd, setShowPwd] = useState(false)
  const [f, setF] = useState({ username: '', email: '', password: '', confirm: '', dob: '' })
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [apiError, setApiError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const update = (k: string, v: string) => {
    setF(p => ({ ...p, [k]: v }))
    setFieldErrors(p => ({ ...p, [k]: '' }))
  }

  const strength = pwdStrength(f.password)
  const strengthColors = ['bg-border', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']
  const strengthLabels = ['', 'Faible', 'Moyen', 'Fort', 'Très fort']

  const pwdMismatch = f.confirm.length > 0 && f.password !== f.confirm
  const ageError = f.dob !== '' && getAge(f.dob) < 13

  const hasErr = (k: string) => !!(fieldErrors[k])
  const inputCls = (err = false) =>
    `w-full px-3 py-2.5 rounded border bg-surface text-text text-sm placeholder:text-muted/40 focus:outline-none transition-colors ${
      err ? 'border-red-500/50 focus:border-red-500/70' : 'border-border focus:border-gold/50'
    }`

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Crown size={30} className="text-gold mx-auto mb-3" />
          <h1 className="font-heading text-2xl font-bold text-gold-light">Créer un compte</h1>
          <p className="text-muted text-sm mt-1">Rejoins Zenkar — Saison 1</p>
        </div>

        <div className="p-6 rounded border border-border bg-card">

          {/* Discord */}
          <a
            href={`${import.meta.env.VITE_API_URL}/auth/discord`}
            className="w-full flex items-center justify-center gap-3 py-2.5 rounded border border-indigo-500/40 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 text-sm font-medium transition-colors mb-6"
          >
            {DISCORD_SVG}
            Continuer avec Discord
          </a>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {apiError && (
            <div className="flex items-center gap-2 p-3 rounded border border-red-500/30 bg-red-500/10 mb-4">
              <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
              <p className="text-xs text-red-400">{apiError}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={async e => {
            e.preventDefault()
            if (pwdMismatch || ageError || !turnstileToken) return
            setApiError('')
            setFieldErrors({})
            setSubmitting(true)
            try {
              await apiRegister({
                username: f.username,
                email: f.email,
                password: f.password,
                date_of_birth: f.dob,
                turnstile_token: turnstileToken,
              })
              await refreshUser()
              navigate('/')
            } catch (err) {
              if (err instanceof ApiError) {
                setFieldErrors(err.fields)
                if (!Object.keys(err.fields).length) setApiError(err.message)
              } else {
                setApiError('Une erreur est survenue')
              }
              turnstileRef.current?.reset()
              setTurnstileToken(null)
            } finally {
              setSubmitting(false)
            }
          }}>

            {/* Username */}
            <div>
              <label className="block text-xs text-muted mb-1.5">Pseudo</label>
              <input
                type="text"
                value={f.username}
                onChange={e => update('username', e.target.value)}
                placeholder="TonPseudo"
                minLength={3}
                maxLength={20}
                className={inputCls(hasErr('username'))}
              />
              <FieldError msg={fieldErrors['username']} />
              {!fieldErrors['username'] && (
                <p className="text-xs text-muted mt-1">3–20 caractères · lettres, chiffres, underscore</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs text-muted mb-1.5">Email</label>
              <input
                type="email"
                value={f.email}
                onChange={e => update('email', e.target.value)}
                autoComplete="email"
                placeholder="ton@email.com"
                className={inputCls(hasErr('email'))}
              />
              <FieldError msg={fieldErrors['email']} />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs text-muted mb-1.5">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={f.password}
                  onChange={e => update('password', e.target.value)}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={inputCls(hasErr('password')) + ' pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors"
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {f.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? strengthColors[strength] : 'bg-border'}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted">{strengthLabels[strength]}</p>
                </div>
              )}
              <FieldError msg={fieldErrors['password']} />
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-xs text-muted mb-1.5">Confirmer le mot de passe</label>
              <input
                type="password"
                value={f.confirm}
                onChange={e => update('confirm', e.target.value)}
                autoComplete="new-password"
                placeholder="••••••••"
                className={inputCls(pwdMismatch)}
              />
              {pwdMismatch && (
                <FieldError msg="Les mots de passe ne correspondent pas" />
              )}
            </div>

            {/* Date of birth */}
            <div>
              <label className="block text-xs text-muted mb-1.5">Date de naissance</label>
              <input
                type="date"
                value={f.dob}
                onChange={e => update('dob', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className={inputCls(ageError || hasErr('date_of_birth')) + ' [color-scheme:dark]'}
              />
              {ageError
                ? <FieldError msg="Tu dois avoir au moins 13 ans pour t'inscrire." />
                : <FieldError msg={fieldErrors['date_of_birth']} />
              }
            </div>

            {/* Turnstile */}
            {SITE_KEY && (
              <Turnstile
                ref={turnstileRef}
                siteKey={SITE_KEY}
                onSuccess={setTurnstileToken}
                onExpire={() => setTurnstileToken(null)}
                onError={() => setTurnstileToken(null)}
                options={{ theme: 'dark', size: 'invisible' }}
              />
            )}

            <button
              type="submit"
              disabled={submitting || pwdMismatch || ageError || (!!SITE_KEY && !turnstileToken)}
              className="w-full py-2.5 rounded bg-gold hover:bg-gold-light text-bg font-medium text-sm transition-colors disabled:opacity-50"
            >
              {submitting ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted mt-6">
          Déjà un compte ?{' '}
          <Link to="/connexion" className="text-gold hover:text-gold-light transition-colors">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
