import { Crown, Wrench, ExternalLink, Copy, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function MaintenancePage() {
  const [copied, setCopied] = useState(false)

  function copyIP() {
    navigator.clipboard.writeText('play.zenkar.fr')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 relative overflow-hidden">

      {/* Subtle background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(201,168,76,0.04) 0%, transparent 70%)' }}
      />

      <div className="relative text-center max-w-md w-full">

        {/* Icon */}
        <div className="w-16 h-16 rounded border border-gold/30 bg-gold/8 flex items-center justify-center mx-auto mb-8">
          <Wrench size={26} className="text-gold/70" />
        </div>

        {/* Branding */}
        <div className="flex items-center justify-center gap-2.5 mb-1">
          <Crown size={18} className="text-gold" />
          <h1
            className="font-heading font-black text-gold tracking-widest"
            style={{ fontSize: '28px', textShadow: '0 0 40px rgba(201,168,76,0.3)' }}
          >
            ZENKAR
          </h1>
        </div>
        <p className="text-muted/60 text-xs font-heading italic mb-10">Skyblock Medieval Fantasy</p>

        {/* Maintenance card */}
        <div className="p-6 rounded border border-border bg-card mb-6 text-left">
          <p className="font-heading text-xs font-semibold text-gold uppercase tracking-widest mb-3">
            Site en maintenance
          </p>
          <p className="text-muted text-sm leading-relaxed">
            Nous préparons quelque chose d'exceptionnel. Le site sera de retour très bientôt.
            En attendant, le serveur Minecraft reste accessible.
          </p>
        </div>

        {/* IP */}
        <button
          onClick={copyIP}
          className="flex items-center gap-2 px-4 py-2.5 rounded border border-gold/25 bg-gold/5 hover:border-gold/50 hover:bg-gold/10 transition-colors mx-auto mb-8"
        >
          <span className="text-sm font-mono text-gold-light tracking-wide">play.zenkar.fr</span>
          {copied
            ? <Check size={13} className="text-gold" />
            : <Copy size={13} className="text-gold/50" />}
        </button>

        {/* Discord */}
        <a
          href="https://discord.gg/SrbwjMCMbp"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded text-sm font-medium text-white transition-colors mb-16"
          style={{ background: '#5865F2' }}
        >
          Rejoindre le Discord
          <ExternalLink size={13} />
        </a>

        {/* Admin access — visible but discreet */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
          <Link
            to="/connexion"
            className="text-[11px] text-muted/25 hover:text-muted/50 transition-colors"
          >
            Accès staff
          </Link>
        </div>

      </div>

      {/* Bottom copyright */}
      <p className="absolute bottom-6 text-[10px] text-muted/20">
        © 2026 Zenkar. Tous droits réservés.
      </p>

    </div>
  )
}
