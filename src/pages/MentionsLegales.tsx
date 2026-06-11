import { Crown, ChevronRight } from 'lucide-react'
import SEO from '../components/SEO'

const SECTIONS = [
  {
    title: 'Éditeur du site',
    items: [
      'Le site zenkar.fr est édité par Zenkar.',
      'Adresse e-mail : contact@zenkar.fr',
    ],
  },
  {
    title: 'Hébergement',
    items: [
      'Le site est hébergé sur un serveur privé (MiniPC) via Cloudflare Tunnel.',
      'Cloudflare, Inc. — 101 Townsend St, San Francisco, CA 94107, États-Unis.',
    ],
  },
  {
    title: 'Propriété intellectuelle',
    items: [
      'L\'ensemble du contenu présent sur zenkar.fr (textes, images, logos, graphismes) est la propriété exclusive de Zenkar, sauf mention contraire.',
      'Toute reproduction, distribution ou utilisation sans autorisation préalable est interdite.',
      'Zenkar n\'est pas affilié à Mojang Studios. « Minecraft » est une marque déposée de Mojang AB.',
    ],
  },
  {
    title: 'Données personnelles',
    items: [
      'Les données collectées (adresse e-mail, pseudo Minecraft) sont utilisées uniquement pour le fonctionnement du site et du serveur Minecraft.',
      'Aucune donnée n\'est revendue à des tiers.',
      'Conformément au RGPD, vous disposez d\'un droit d\'accès, de rectification et de suppression de vos données. Pour exercer ce droit, contactez : contact@zenkar.fr',
      'Les mots de passe sont stockés sous forme hachée et ne sont jamais lisibles.',
    ],
  },
  {
    title: 'Cookies',
    items: [
      'Le site utilise uniquement des cookies techniques nécessaires au fonctionnement (session d\'authentification).',
      'Aucun cookie publicitaire ou traceur tiers n\'est utilisé.',
    ],
  },
  {
    title: 'Limitation de responsabilité',
    items: [
      'Zenkar ne saurait être tenu responsable des dommages directs ou indirects liés à l\'utilisation du site ou du serveur.',
      'Le service est fourni « tel quel », sans garantie de disponibilité permanente.',
      'Les liens externes présents sur le site redirigent vers des sites tiers — Zenkar n\'est pas responsable de leur contenu.',
    ],
  },
  {
    title: 'Droit applicable',
    items: [
      'Les présentes mentions légales sont soumises au droit français.',
      'En cas de litige, les tribunaux français seront seuls compétents.',
    ],
  },
]

export default function MentionsLegales() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <SEO
        title="Mentions légales"
        description="Mentions légales du site zenkar.fr — éditeur, hébergement, données personnelles, propriété intellectuelle."
        canonical="/mentions-legales"
      />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Crown size={14} className="text-gold" />
            <h1 className="font-heading text-sm font-semibold text-gold tracking-widest uppercase">Mentions légales</h1>
          </div>
          <span className="text-xs text-muted">Dernière mise à jour : juin 2026</span>
        </div>
        <div className="h-px mb-6" style={{ background: 'linear-gradient(to right, rgba(201,168,76,0.5), transparent)' }} />
        <p className="text-muted text-sm leading-relaxed max-w-2xl">
          Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004 pour la confiance en l'économie numérique, vous trouverez ci-dessous les informations légales relatives au site zenkar.fr.
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {SECTIONS.map(({ title, items }) => (
          <div key={title} className="rounded border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border bg-surface/40">
              <h2 className="font-heading text-xs font-semibold text-gold tracking-widest uppercase">{title}</h2>
            </div>
            <ul className="divide-y divide-border/40">
              {items.map((item, i) => (
                <li key={i} className="flex items-start gap-3 px-5 py-3">
                  <ChevronRight size={12} className="text-gold/50 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted leading-relaxed">{item}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Contact */}
      <div className="mt-8 p-4 rounded border border-border bg-card">
        <p className="text-xs text-muted leading-relaxed">
          Pour toute question relative aux présentes mentions légales, contactez-nous à{' '}
          <a href="mailto:contact@zenkar.fr" className="text-gold hover:text-gold-light transition-colors">
            contact@zenkar.fr
          </a>.
        </p>
      </div>
    </div>
  )
}
