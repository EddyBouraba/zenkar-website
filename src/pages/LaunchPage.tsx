import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import heroImage from '../assets/hero-image.jpg'

const DiscordIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.04.035.052a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
)

export default function LaunchPage() {
  const [copied, setCopied] = useState(false)

  function copyIP() {
    navigator.clipboard.writeText('play.zenkar.fr')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">

      {/* Background */}
      <img
        src={heroImage}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover object-[70%_25%] scale-105"
        style={{ filter: 'blur(2px)' }}
      />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(9,8,12,0.55) 0%, rgba(9,8,12,0.85) 60%, rgba(9,8,12,1) 100%)' }} />

      {/* Shimmer line */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.6), transparent)' }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl mx-auto">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/30 bg-gold/10 text-gold text-xs font-medium tracking-widest uppercase mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          Bientôt disponible
        </div>

        {/* Logo */}
        <h1
          className="font-heading font-black text-gold leading-none mb-4"
          style={{
            fontSize: 'clamp(64px, 14vw, 120px)',
            textShadow: '0 0 80px rgba(201,168,76,0.5), 0 0 160px rgba(201,168,76,0.2)',
            letterSpacing: '0.12em',
          }}
        >
          ZENKAR
        </h1>

        {/* Tagline */}
        <p className="font-heading italic text-muted text-base sm:text-lg mb-2 tracking-wide">
          Bâtis la civilisation — Forge ta légende.
        </p>
        <p className="text-muted/60 text-sm mb-10 max-w-md leading-relaxed">
          Serveur Minecraft Survival SMP français. Fonde ta guilde, bâtis une civilisation, domine le royaume. Saison 1 — Les Fondateurs.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm">
          <a
            href="https://discord.gg/SrbwjMCMbp"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2.5 py-3 rounded border border-indigo-500/40 bg-indigo-600/15 hover:bg-indigo-600/30 text-indigo-300 text-sm font-semibold transition-colors"
          >
            <DiscordIcon />
            Rejoindre le Discord
          </a>
          <button
            onClick={copyIP}
            className="w-full flex items-center justify-center gap-2 py-3 rounded border border-gold/30 bg-gold/10 hover:bg-gold/20 text-gold-light text-sm font-mono font-medium transition-colors"
          >
            <span>play.zenkar.fr</span>
            {copied ? <Check size={13} className="text-gold" /> : <Copy size={13} className="text-gold/60" />}
          </button>
        </div>

        {/* Staff link */}
        <a
          href="/connexion"
          className="mt-10 text-xs text-muted/40 hover:text-muted transition-colors"
        >
          Accès staff →
        </a>
      </div>

      {/* Bottom shimmer */}
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.3), transparent)' }} />
    </div>
  )
}
