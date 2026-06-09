import { Link } from 'react-router-dom'
import { Crown } from 'lucide-react'

const COL_JOUER = [
  { label: 'Accueil', to: '/' },
  { label: 'Modes de jeu', to: '/modes' },
  { label: 'Classements (bientôt)', to: '/classements' },
  { label: 'Carte dynamique (bientôt)', to: '/carte' },
]

const COL_COMMUNAUTE = [
  { label: 'Forum (bientôt)', to: '/forum' },
  { label: 'Discord', href: '#' },
  { label: 'Règles', to: '/regles' },
  { label: 'Wiki (bientôt)', to: '/wiki' },
]

const COL_SUPPORT = [
  { label: 'Boutique', href: 'https://shop.zenkar.fr' },
  { label: 'Aide', to: '/support' },
  { label: 'Contact', to: '/contact' },
  { label: 'Mentions légales', to: '/mentions-legales' },
]

function FooterLink({ item }: { item: { label: string; to?: string; href?: string } }) {
  const cls = 'text-sm text-muted hover:text-text transition-colors'
  if (item.href)
    return <a href={item.href} target="_blank" rel="noopener noreferrer" className={cls}>{item.label}</a>
  return <Link to={item.to!} className={cls}>{item.label}</Link>
}

export default function Footer() {
  return (
    <footer className="border-t border-border mt-16 bg-card">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Crown size={16} className="text-gold" />
              <span className="font-heading font-bold text-gold-light tracking-widest">ZENKAR</span>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              Serveur Minecraft communautaire français — SMP semi-RP médiéval.
              <br />Saison 1 en cours.
            </p>
          </div>

          {/* Jouer */}
          <div>
            <h4 className="font-heading text-xs font-semibold text-gold tracking-widest uppercase mb-4">Jouer</h4>
            <ul className="space-y-2.5">
              {COL_JOUER.map(item => (
                <li key={item.label}><FooterLink item={item} /></li>
              ))}
            </ul>
          </div>

          {/* Communauté */}
          <div>
            <h4 className="font-heading text-xs font-semibold text-gold tracking-widest uppercase mb-4">Communauté</h4>
            <ul className="space-y-2.5">
              {COL_COMMUNAUTE.map(item => (
                <li key={item.label}><FooterLink item={item} /></li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-heading text-xs font-semibold text-gold tracking-widest uppercase mb-4">Support</h4>
            <ul className="space-y-2.5">
              {COL_SUPPORT.map(item => (
                <li key={item.label}><FooterLink item={item} /></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-muted">
          <p>© 2026 Zenkar. Tous droits réservés.</p>
          <p>Zenkar n'est pas affilié à Mojang Studios.</p>
        </div>
      </div>
    </footer>
  )
}
