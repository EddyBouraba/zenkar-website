import { Sparkles, Crown } from 'lucide-react'

export default function MysteryDustSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-12 pb-16">

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Crown size={14} className="text-gold" />
            <h2 className="font-heading text-sm font-semibold text-gold tracking-widest uppercase">
              Mystery Dust
            </h2>
          </div>
        </div>
        <div className="h-px" style={{ background: 'linear-gradient(to right, rgba(201,168,76,0.5), transparent)' }} />
      </div>

      <div className="rounded border border-border/40 bg-card overflow-hidden">
        <div className="p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={14} className="text-gold" />
              <span className="text-xs font-heading tracking-widest uppercase text-gold">Mystery Dust</span>
            </div>
            <h3 className="font-heading text-2xl md:text-3xl font-bold text-gold-light mb-3 leading-tight">
              Les cosmétiques, accessibles à tous
            </h3>
            <p className="text-muted text-sm leading-relaxed">
              Vote, fais tes quêtes journalières, connecte-toi chaque jour : la Mystery Dust se farme
              sans débourser un sou. Les grades ne débloquent rien — ils raccourcissent simplement le chemin.
            </p>
          </div>

          <div className="flex-shrink-0">
            <a
              href="https://shop.zenkar.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded border border-gold/40 text-gold hover:bg-gold/10 text-sm font-medium transition-colors"
            >
              <Sparkles size={15} />
              Voir les cosmétiques
            </a>
          </div>

        </div>
      </div>
    </section>
  )
}
