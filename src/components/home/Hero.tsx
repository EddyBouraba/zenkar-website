import { useState } from 'react'
import { Copy, Check, Users } from 'lucide-react'
import heroImage from '../../assets/hero-image.jpg'
import { useServerStats } from '../../hooks/useServerStats'

export default function Hero() {
  const [copied, setCopied] = useState(false)
  const { stats } = useServerStats()

  function copyIP() {
    navigator.clipboard.writeText('play.zenkar.fr')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="relative overflow-hidden">
      <img
        src={heroImage}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover object-[70%_25%]"
      />
      <div className="absolute inset-0 bg-bg/55" />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, rgba(9,8,12,0.1) 0%, rgba(9,8,12,0.8) 100%)' }}
      />

      <div className="relative max-w-7xl mx-auto px-6 py-20 flex flex-col sm:flex-row items-center justify-between gap-10">

        {/* Left: branding */}
        <div>
          <h1
            className="font-heading font-black text-gold tracking-widest leading-none"
            style={{
              fontSize: 'clamp(52px, 8vw, 88px)',
              textShadow: '0 0 60px rgba(201,168,76,0.45)',
            }}
          >
            ZENKAR
          </h1>
          <p className="text-muted text-sm mt-3 font-heading italic">
            Bâtis la civilisation — Forge ta légende.
          </p>
        </div>

        {/* Right: CTA */}
        <div className="flex flex-col items-start sm:items-end gap-3 flex-shrink-0">
          <a
            href="minecraft://connect/play.zenkar.fr"
            className="flex items-center gap-2 px-8 py-3.5 rounded font-heading font-bold text-sm text-bg tracking-widest uppercase transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: 'linear-gradient(135deg, #c9a84c, #e8c56d)',
              boxShadow: '0 4px 20px rgba(201,168,76,0.35)',
            }}
          >
            ▶ Jouer Maintenant
          </a>

          <div className="flex items-center gap-3">
            <button
              onClick={copyIP}
              className="flex items-center gap-2 px-4 py-2 rounded border border-gold/30 bg-bg/70 hover:border-gold/60 backdrop-blur-sm transition-colors"
            >
              <span className="text-sm font-mono text-gold-light font-medium tracking-wide">play.zenkar.fr</span>
              {copied
                ? <Check size={13} className="text-gold" />
                : <Copy size={13} className="text-gold/60 hover:text-gold" />}
            </button>
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <Users size={12} />
              <span>{stats?.players_online ?? 0} joueurs</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
