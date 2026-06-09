import GradesSection from '../components/home/GradesSection'
import MysteryDustSection from '../components/home/MysteryDustSection'
import { Crown, ExternalLink } from 'lucide-react'

export default function Boutique() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="mb-8">
        <div className="mb-2.5">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <Crown size={14} className="text-gold" />
              <h1 className="font-heading text-sm font-semibold text-gold tracking-widest uppercase">Boutique</h1>
            </div>
            <a
              href="https://shop.zenkar.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-gold transition-colors"
            >
              Ouvrir la boutique
              <ExternalLink size={11} />
            </a>
          </div>
          <div className="h-px" style={{ background: 'linear-gradient(to right, rgba(201,168,76,0.5), transparent)' }} />
        </div>
        <p className="text-muted text-sm leading-relaxed max-w-2xl mt-4">
          Grades permanents à achat unique — jamais d'abonnement. Ils sont conservés à chaque nouvelle saison
          et n'offrent aucun avantage pay-to-win.
        </p>
      </div>

      <GradesSection />
      <MysteryDustSection />

    </div>
  )
}
