import { Link } from 'react-router-dom'
import { Trophy, MessagesSquare, Map, BookOpen, HelpCircle, MessageCircle } from 'lucide-react'

const ICONS = { trophy: Trophy, forum: MessagesSquare, map: Map, wiki: BookOpen, help: HelpCircle }

interface Props {
  title: string
  subtitle: string
  icon: keyof typeof ICONS
}

export default function Placeholder({ title, subtitle, icon }: Props) {
  const Icon = ICONS[icon] ?? Trophy

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl border border-border bg-card flex items-center justify-center mx-auto mb-6">
          <Icon size={26} className="text-gold" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-gold-light mb-2">{title}</h1>
        <p className="text-sm font-medium text-muted mb-1">Bientôt disponible</p>
        <p className="text-sm text-muted/70 mb-8">{subtitle}</p>
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
        >
          <MessageCircle size={15} />
          Rejoindre le Discord pour être notifié
        </a>
        <div className="mt-5">
          <Link to="/" className="text-sm text-muted hover:text-gold transition-colors">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
