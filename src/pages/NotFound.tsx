import { Link } from 'react-router-dom'
import { Home, Newspaper, ShoppingBag } from 'lucide-react'
import SEO from '../components/SEO'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <SEO title="Page introuvable" description="Cette page n'existe pas sur Zenkar." noIndex />

      <div className="mb-6">
        <p className="font-heading text-8xl font-black text-gold/20 leading-none select-none">404</p>
      </div>

      <h1 className="font-heading text-xl font-bold text-gold-light mb-2">Page introuvable</h1>
      <p className="text-muted text-sm max-w-sm leading-relaxed mb-8">
        Cette page n'existe pas ou a été déplacée. Retourne à l'accueil ou explore le serveur.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded bg-gold hover:bg-gold-light text-bg text-xs font-semibold transition-colors"
        >
          <Home size={13} />
          Accueil
        </Link>
        <Link
          to="/news"
          className="inline-flex items-center gap-2 px-4 py-2 rounded border border-border hover:border-gold/30 text-muted hover:text-text text-xs transition-colors"
        >
          <Newspaper size={13} />
          Actualités
        </Link>
        <Link
          to="/boutique"
          className="inline-flex items-center gap-2 px-4 py-2 rounded border border-border hover:border-gold/30 text-muted hover:text-text text-xs transition-colors"
        >
          <ShoppingBag size={13} />
          Boutique
        </Link>
      </div>

    </div>
  )
}
