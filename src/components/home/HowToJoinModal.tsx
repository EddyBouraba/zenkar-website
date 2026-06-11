import { useState, useEffect } from 'react'
import { X, Copy, Check, Monitor, LayoutGrid, Keyboard, Crown } from 'lucide-react'

const STEPS = [
  {
    num: '1',
    icon: Monitor,
    color: 'text-emerald-400',
    accent: 'border-emerald-400/25',
    bg: 'bg-emerald-400/5',
    title: 'Lance Minecraft Java',
    desc: 'Ouvre Minecraft Java Edition 1.21.x — le launcher officiel ou Prism Launcher fonctionnent.',
  },
  {
    num: '2',
    icon: LayoutGrid,
    color: 'text-blue-400',
    accent: 'border-blue-400/25',
    bg: 'bg-blue-400/5',
    title: 'Va dans Multijoueur',
    desc: 'Sur l\'écran titre, clique sur "Multijoueur" puis sur "Ajouter un serveur".',
    ui: ['Solo', 'Multijoueur ◀', 'Minecraft Realms'],
  },
  {
    num: '3',
    icon: Keyboard,
    color: 'text-gold',
    accent: 'border-gold/25',
    bg: 'bg-gold/5',
    title: 'Entre l\'adresse du serveur',
    desc: 'Dans le champ "Adresse du serveur", copie-colle ou tape exactement :',
    ip: true,
  },
  {
    num: '4',
    icon: Crown,
    color: 'text-rose-400',
    accent: 'border-rose-400/25',
    bg: 'bg-rose-400/5',
    title: 'Connecte-toi et forge ta légende',
    desc: 'Clique sur "Connecter". Bienvenue sur Zenkar — le monde t\'attend.',
  },
]

interface Props { onClose: () => void }

export default function HowToJoinModal({ onClose }: Props) {
  const [visible, setVisible] = useState(false)
  const [copied, setCopied] = useState(false)
  const [btnCopied, setBtnCopied] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  function close() {
    setVisible(false)
    setTimeout(onClose, 250)
  }

  function copyInline() {
    navigator.clipboard.writeText('play.zenkar.fr')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function copyBtn() {
    navigator.clipboard.writeText('play.zenkar.fr')
    setBtnCopied(true)
    setTimeout(() => setBtnCopied(false), 2000)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: visible ? 'rgba(9,8,12,0.75)' : 'rgba(9,8,12,0)',
        backdropFilter: visible ? 'blur(4px)' : 'none',
        transition: 'background 0.25s, backdrop-filter 0.25s',
      }}
      onClick={e => e.target === e.currentTarget && close()}
    >
      <div
        className="w-full max-w-md bg-card border border-border rounded-xl overflow-hidden"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(12px)',
          transition: 'opacity 0.25s, transform 0.25s',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Crown size={13} className="text-gold" />
            <h2 className="font-heading text-xs font-semibold text-gold tracking-widest uppercase">
              Rejoindre Zenkar
            </h2>
          </div>
          <button onClick={close} className="text-muted hover:text-text transition-colors p-0.5">
            <X size={15} />
          </button>
        </div>

        {/* Steps */}
        <div className="px-5 pt-5 pb-2 space-y-0">
          {STEPS.map(({ num, icon: Icon, color, accent, bg, title, desc, ip, ui }, i) => (
            <div key={num} className="flex gap-3">
              {/* Timeline */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full border ${accent} ${bg} flex items-center justify-center flex-shrink-0 text-[11px] font-bold ${color} transition-all`}
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'scale(1)' : 'scale(0.6)',
                    transition: `opacity 0.35s ${i * 80 + 100}ms, transform 0.35s ${i * 80 + 100}ms`,
                  }}
                >
                  {num}
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-px flex-1 my-1" style={{ background: 'var(--color-border, #2a2438)', minHeight: 16 }} />
                )}
              </div>

              {/* Content */}
              <div
                className={`flex-1 mb-${i < STEPS.length - 1 ? '3' : '0'} pb-4`}
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateX(0)' : 'translateX(-8px)',
                  transition: `opacity 0.35s ${i * 80 + 120}ms, transform 0.35s ${i * 80 + 120}ms`,
                }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon size={12} className={color} />
                  <p className={`text-sm font-semibold ${color}`}>{title}</p>
                </div>
                <p className="text-xs text-muted leading-relaxed">{desc}</p>

                {/* Fake Minecraft menu */}
                {ui && (
                  <div className="mt-2 rounded border border-blue-400/15 bg-blue-400/5 px-3 py-2 space-y-1">
                    {ui.map(item => (
                      <p key={item} className={`text-[11px] font-mono ${item.includes('◀') ? 'text-blue-300 font-bold' : 'text-muted/60'}`}>
                        {item}
                      </p>
                    ))}
                  </div>
                )}

                {/* IP copy inline */}
                {ip && (
                  <button
                    onClick={copyInline}
                    className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded border border-gold/30 bg-bg/60 hover:border-gold/60 transition-colors group"
                  >
                    <span className="font-mono text-sm text-gold-light font-semibold tracking-wide">play.zenkar.fr</span>
                    {copied
                      ? <Check size={12} className="text-gold" />
                      : <Copy size={12} className="text-gold/50 group-hover:text-gold transition-colors" />}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className="px-5 pb-5"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(8px)',
            transition: `opacity 0.35s ${STEPS.length * 80 + 150}ms, transform 0.35s ${STEPS.length * 80 + 150}ms`,
          }}
        >
          <button
            onClick={copyBtn}
            className="w-full py-3 rounded font-heading font-bold text-sm text-bg tracking-widest uppercase transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #c9a84c, #e8c56d)',
              boxShadow: '0 4px 20px rgba(201,168,76,0.30)',
            }}
          >
            {btnCopied ? '✓  IP copiée !' : 'Copier  play.zenkar.fr'}
          </button>
        </div>
      </div>
    </div>
  )
}
