import { Crown, Wrench, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 relative overflow-hidden">

      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(201,168,76,0.04) 0%, transparent 70%)' }}
      />

      <div className="relative text-center max-w-md w-full">

        <div className="w-16 h-16 rounded border border-gold/30 bg-gold/8 flex items-center justify-center mx-auto mb-8">
          <Wrench size={26} className="text-gold/70" />
        </div>

        <div className="flex items-center justify-center gap-2.5 mb-10">
          <Crown size={18} className="text-gold" />
          <h1
            className="font-heading font-black text-gold tracking-widest"
            style={{ fontSize: '28px', textShadow: '0 0 40px rgba(201,168,76,0.3)' }}
          >
            ZENKAR
          </h1>
        </div>

        <div className="p-6 rounded border border-border bg-card mb-8 text-left">
          <p className="font-heading text-xs font-semibold text-gold uppercase tracking-widest mb-3">
            Site en maintenance
          </p>
          <p className="text-muted text-sm leading-relaxed">
            Nous préparons quelque chose d'exceptionnel. Le site sera de retour très bientôt.
          </p>
        </div>

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

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
          <Link
            to="/connexion"
            className="text-[11px] text-muted/25 hover:text-muted/50 transition-colors"
          >
            Accès staff
          </Link>
        </div>

      </div>

      <p className="absolute bottom-6 text-[10px] text-muted/20">
        © 2026 Zenkar. Tous droits réservés.
      </p>

    </div>
  )
}
