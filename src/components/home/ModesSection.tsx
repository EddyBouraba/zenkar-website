import { Crown, Landmark, TrendingUp, Hammer, Swords, Scroll, Shield } from 'lucide-react'

const MODES = [
  { icon: Landmark,   title: 'Guildes',             iconColor: 'text-amber-300',  iconBg: 'bg-amber-400/20',  desc: 'Fonde ta guilde, recrute des membres, progresse de Campement à Forteresse. La puissance est collective.' },
  { icon: TrendingUp, title: 'Économie Vivante',    iconColor: 'text-green-300',  iconBg: 'bg-green-400/20',  desc: '9 métiers, marché global, boutiques joueurs. Tu ne peux pas tout faire seul — spécialise-toi.' },
  { icon: Hammer,     title: 'Forge & Artisanat',   iconColor: 'text-orange-300', iconBg: 'bg-orange-400/20', desc: 'Minerais récoltés, équipement forgé, objets craftés. La progression passe par les métiers.' },
  { icon: Swords,     title: 'Tournois PvP',        iconColor: 'text-red-300',    iconBg: 'bg-red-400/20',    desc: 'PvP actif en wilderness. Arènes dédiées et guerres de guildes pour les plus ambitieux.' },
  { icon: Scroll,     title: 'RP & Lore',           iconColor: 'text-purple-300', iconBg: 'bg-purple-400/20', desc: 'Saisons longues, titres legacy, histoire construite par les joueurs eux-mêmes.' },
  { icon: Shield,     title: 'Protection Claim',    iconColor: 'text-blue-300',   iconBg: 'bg-blue-400/20',   desc: 'Tes constructions sont sacrées. Aucun griefing possible dans ton territoire.' },
]

export default function ModesSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-12">

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Crown size={14} className="text-gold" />
            <h2 className="font-heading text-sm font-semibold text-gold tracking-widest uppercase">
              Modes & Systèmes
            </h2>
          </div>
          <span className="text-xs text-muted">6 modes</span>
        </div>
        <div className="h-px" style={{ background: 'linear-gradient(to right, rgba(201,168,76,0.5), transparent)' }} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODES.map(({ icon: Icon, title, iconColor, iconBg, desc }) => (
          <div
            key={title}
            className="p-6 rounded border border-border bg-card hover:border-gold/30 transition-all duration-200 group cursor-default"
          >
            <div className={`w-10 h-10 rounded flex items-center justify-center mb-4 ${iconBg}`}>
              <Icon size={20} className={iconColor} />
            </div>
            <h3 className="text-text font-semibold text-sm mb-2 group-hover:text-gold-light transition-colors">
              {title}
            </h3>
            <p className="text-muted text-xs leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

    </section>
  )
}
