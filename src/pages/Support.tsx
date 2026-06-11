import { Crown, MessageCircle, ShoppingBag, Shield, Bug, HelpCircle, ExternalLink, Mail } from 'lucide-react'
import SEO from '../components/SEO'

const DISCORD_URL = 'https://discord.gg/SrbwjMCMbp'

const CATEGORIES = [
  {
    icon: ShoppingBag,
    title: 'Boutique & Grades',
    color: 'text-gold',
    border: 'border-gold/20',
    bg: 'bg-gold/5',
    desc: 'Grade non reçu, problème de paiement, remboursement.',
    ticket: 'ticket-boutique',
  },
  {
    icon: Shield,
    title: 'Contestation de sanction',
    color: 'text-red-400',
    border: 'border-red-500/20',
    bg: 'bg-red-500/5',
    desc: 'Ban ou mute que tu estimes injustifié.',
    ticket: 'ticket-sanction',
  },
  {
    icon: Bug,
    title: 'Signaler un bug',
    color: 'text-blue-400',
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/5',
    desc: 'Bug en jeu, problème sur le site ou la boutique.',
    ticket: 'ticket-bug',
  },
  {
    icon: HelpCircle,
    title: 'Aide générale',
    color: 'text-purple-400',
    border: 'border-purple-500/20',
    bg: 'bg-purple-500/5',
    desc: 'Questions sur le serveur, le lore, les commandes.',
    ticket: 'ticket-aide',
  },
]

const FAQ = [
  {
    q: 'Je n\'ai pas reçu mon grade après l\'achat.',
    a: 'Attends 5 minutes après le paiement — le grade est attribué automatiquement. Si rien après 10 minutes, ouvre un ticket "Boutique & Grades" avec ta preuve d\'achat.',
  },
  {
    q: 'Comment contester un ban ?',
    a: 'Ouvre un ticket "Contestation de sanction" sur le Discord. Précise ton pseudo, la date, et les raisons de ta contestation. Les décisions sont rendues sous 48h.',
  },
  {
    q: 'Mon vote n\'a pas été crédité.',
    a: 'Utilise la commande /vote claim en jeu. Si ça ne fonctionne toujours pas, ouvre un ticket en précisant le site de vote et ton pseudo exact.',
  },
  {
    q: 'Comment rejoindre le serveur ?',
    a: 'Connecte-toi sur Minecraft Java Edition et entre l\'adresse play.zenkar.fr dans "Multijoueur".',
  },
]

export default function Support() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <SEO
        title="Support"
        description="Besoin d'aide sur Zenkar ? Boutique, sanction, bug ou question générale — ouvre un ticket Discord ou consulte la FAQ."
        canonical="/support"
      />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Crown size={14} className="text-gold" />
            <h1 className="font-heading text-sm font-semibold text-gold tracking-widest uppercase">Support</h1>
          </div>
        </div>
        <div className="h-px mb-6" style={{ background: 'linear-gradient(to right, rgba(201,168,76,0.5), transparent)' }} />
        <p className="text-muted text-sm leading-relaxed max-w-2xl">
          Le support Zenkar passe par Discord. Choisis la catégorie qui correspond à ton problème, puis ouvre un ticket — un membre du staff te répondra dès que possible.
        </p>
      </div>

      {/* Catégories */}
      <div className="mb-8">
        <p className="text-[10px] text-muted uppercase tracking-widest mb-4">Choisir une catégorie</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CATEGORIES.map(({ icon: Icon, title, color, border, bg, desc }) => (
            <a
              key={title}
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-start gap-4 p-5 rounded border ${border} ${bg} hover:border-opacity-60 transition-all group`}
            >
              <div className={`w-9 h-9 rounded flex items-center justify-center flex-shrink-0 border ${border} bg-card`}>
                <Icon size={16} className={color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold mb-1 ${color} group-hover:opacity-90 transition-opacity`}>{title}</p>
                <p className="text-xs text-muted leading-relaxed">{desc}</p>
              </div>
              <ExternalLink size={12} className="text-muted/40 flex-shrink-0 mt-1" />
            </a>
          ))}
        </div>
      </div>

      {/* CTA Discord */}
      <div className="mb-8 p-5 rounded border border-indigo-500/25 bg-indigo-500/5 flex flex-col sm:flex-row items-center gap-4">
        <MessageCircle size={28} className="text-indigo-400 flex-shrink-0" />
        <div className="flex-1 text-center sm:text-left">
          <p className="text-sm font-semibold text-text mb-0.5">Discord Zenkar</p>
          <p className="text-xs text-muted">Rejoins notre serveur et ouvre un ticket dans le salon #support.</p>
        </div>
        <a
          href={DISCORD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
        >
          Ouvrir le Discord
          <ExternalLink size={12} />
        </a>
      </div>

      {/* FAQ */}
      <div className="mb-8">
        <p className="text-[10px] text-muted uppercase tracking-widest mb-4">Questions fréquentes</p>
        <div className="space-y-2">
          {FAQ.map(({ q, a }) => (
            <div key={q} className="rounded border border-border bg-card overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-surface/30">
                <p className="text-sm font-medium text-text">{q}</p>
              </div>
              <div className="px-5 py-3">
                <p className="text-xs text-muted leading-relaxed">{a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact mail */}
      <div className="flex items-start gap-3 p-4 rounded border border-border bg-card">
        <Mail size={14} className="text-muted flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted leading-relaxed">
          Pour les demandes formelles (RGPD, partenariats, presse), contacte-nous par e-mail :{' '}
          <a href="mailto:contact@zenkar.fr" className="text-gold hover:text-gold-light transition-colors">
            contact@zenkar.fr
          </a>
        </p>
      </div>
    </div>
  )
}
