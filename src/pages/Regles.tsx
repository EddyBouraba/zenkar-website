import { Crown, Shield, Sword, MessageSquare, Wrench, AlertTriangle, ChevronRight } from 'lucide-react'
import SEO from '../components/SEO'

const SECTIONS = [
  {
    icon: Shield,
    title: 'Comportement général',
    color: 'text-gold',
    rules: [
      'Le respect est obligatoire envers tous les joueurs et le staff, en tout temps.',
      'Le serveur est en français — parle français dans le chat public.',
      'Le harcèlement, la discrimination et les propos haineux sont interdits et entraînent un ban immédiat.',
      'Les insultes sont tolérées uniquement dans un cadre RP clairement établi entre les joueurs concernés.',
      'Le spam, la publicité pour d\'autres serveurs et les messages répétitifs sont interdits.',
      'Toute usurpation d\'identité (joueur ou staff) est interdite.',
    ],
  },
  {
    icon: Sword,
    title: 'Jeu & Interactions',
    color: 'text-red-400',
    rules: [
      'Le grief (destruction des constructions d\'autrui) est strictement interdit sur tout le serveur.',
      'Le vol d\'items hors des claims et zones de guilde n\'est pas interdit, mais nous encourageons une attitude de bonne foi envers la communauté.',
      'Le PvP est autorisé dans les zones prévues à cet effet — aucun PvP forcé hors de ces zones.',
      'L\'exploitation de bugs ou failles est interdite. Tout bug découvert doit être signalé au staff immédiatement.',
      'Les constructions à caractère offensant, obscène ou politique sont interdites.',
      'Les arnaques et escroqueries entre joueurs sont interdites.',
    ],
  },
  {
    icon: Wrench,
    title: 'Mods & Clients',
    color: 'text-blue-400',
    rules: [
      'Tout hack, cheat ou mod donnant un avantage déloyal est strictement interdit (kill aura, speed hack, x-ray…).',
      'Les clients d\'optimisation sont tolérés : Optifine, Sodium, Iris, Lithium et équivalents.',
      'Les mods cosmétiques (shaders, ressource packs) sont autorisés.',
      'Les macros et autoclickers sont interdits.',
      'En cas de doute sur un mod, demande au staff avant de l\'utiliser.',
    ],
  },
  {
    icon: MessageSquare,
    title: 'Semi-RP',
    color: 'text-purple-400',
    rules: [
      'Le serveur est en mode Semi-RP : le jeu de rôle est encouragé mais non obligatoire.',
      'Respecte les initiatives RP des autres joueurs — ne les brise pas volontairement (no-RP kill, grief de scénario).',
      'Les insultes et conflits dans le cadre du RP doivent rester dans le jeu, jamais personnels.',
      'Le lore du serveur doit être respecté lors des interactions RP officielles.',
    ],
  },
  {
    icon: Crown,
    title: 'Grades & Boutique',
    color: 'text-gold',
    rules: [
      'Zenkar est 100 % non pay-to-win — aucun grade n\'offre d\'avantage en combat ou en ressources.',
      'Les grades débloquent des fonctionnalités de jeu de rôle et de personnalisation uniquement.',
      'Tout achat est définitif et conservé d\'une saison à l\'autre.',
      'Le chargeback frauduleux (remboursement injustifié) entraîne un ban permanent.',
    ],
  },
  {
    icon: AlertTriangle,
    title: 'Sanctions',
    color: 'text-yellow-400',
    rules: [
      '1ʳᵉ infraction mineure : avertissement écrit.',
      '2ᵉ infraction ou infraction modérée : mute ou kick.',
      '3ᵉ infraction ou infraction grave : ban temporaire (1 à 30 jours selon la gravité).',
      'Infraction très grave (hack, harcèlement, chargeback…) : ban permanent sans avertissement préalable.',
      'Toute sanction peut être contestée sur le Discord en ouvrant un ticket.',
      'Le staff se réserve le droit d\'adapter les sanctions selon le contexte.',
    ],
  },
]

export default function Regles() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <SEO
        title="Règlement"
        description="Règlement officiel du serveur Zenkar : comportement, grief, vol, mods autorisés, Semi-RP et sanctions. À lire avant de rejoindre le serveur."
        canonical="/regles"
      />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Crown size={14} className="text-gold" />
            <h1 className="font-heading text-sm font-semibold text-gold tracking-widest uppercase">Règlement</h1>
          </div>
          <span className="text-xs text-muted">Dernière mise à jour : juin 2026</span>
        </div>
        <div className="h-px mb-6" style={{ background: 'linear-gradient(to right, rgba(201,168,76,0.5), transparent)' }} />
        <p className="text-muted text-sm leading-relaxed max-w-2xl">
          En rejoignant Zenkar, tu acceptes ce règlement. L'ignorance des règles ne constitue pas une excuse. Le staff se réserve le droit de modifier ce règlement à tout moment — les joueurs en seront informés.
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {SECTIONS.map(({ icon: Icon, title, color, rules }) => (
          <div key={title} className="rounded border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border bg-surface/40">
              <Icon size={14} className={color} />
              <h2 className="font-heading text-xs font-semibold text-text tracking-widest uppercase">{title}</h2>
            </div>
            <ul className="divide-y divide-border/40">
              {rules.map((rule, i) => (
                <li key={i} className="flex items-start gap-3 px-5 py-3">
                  <ChevronRight size={12} className="text-gold/50 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted leading-relaxed">{rule}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-8 p-4 rounded border border-border bg-card flex items-start gap-3">
        <AlertTriangle size={14} className="text-yellow-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted leading-relaxed">
          Pour toute question concernant ce règlement ou pour contester une sanction, ouvre un ticket sur le{' '}
          <a href="https://discord.gg/SrbwjMCMbp" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light transition-colors">
            Discord Zenkar
          </a>.
          Les décisions du staff sont finales après examen du dossier.
        </p>
      </div>

    </div>
  )
}
