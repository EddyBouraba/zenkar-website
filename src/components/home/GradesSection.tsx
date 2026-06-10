import { Check, Minus, Crown, Shield, Sparkles } from 'lucide-react'

const GRADES = [
  { id: 'pionnier',   name: 'Pionnier',   price: '4,99 €', iconColor: 'text-emerald-400', colBg: '',          border: 'border-emerald-400/20', popular: false, link: 'https://zenkar-server.tebex.io/category/3336199' },
  { id: 'veteran',    name: 'Vétéran',    price: '12 €',   iconColor: 'text-blue-400',    colBg: '',          border: 'border-blue-400/20',    popular: false, link: 'https://zenkar-server.tebex.io/category/3336199' },
  { id: 'conquerant', name: 'Conquérant', price: '20 €',   iconColor: 'text-gold',        colBg: '',          border: 'border-gold/20',        popular: true,  link: 'https://zenkar-server.tebex.io/category/3336199' },
  { id: 'legende',    name: 'Légende',    price: '35 €',   iconColor: 'text-purple-400',  colBg: '',          border: 'border-purple-400/20',  popular: false, link: 'https://zenkar-server.tebex.io/category/3336199' },
]

const GRADE_ICONS: Record<string, typeof Crown> = {
  pionnier:   Shield,
  veteran:    Crown,
  conquerant: Crown,
  legende:    Sparkles,
}

type Val = boolean | string

const ROWS: { label: string; values: Val[] }[] = [
  { label: 'Homes',              values: ['3',   '5',    '8',   '15'] },
  { label: '/back',              values: [true,  true,   true,  true] },
  { label: '/hat & /workbench',  values: [true,  true,   true,  true] },
  { label: '/enderchest',        values: [false, true,   true,  true] },
  { label: '/nick & /tpahere',   values: [false, true,   true,  true] },
  { label: '/fly (claim)',       values: [false, false,  true,  true] },
  { label: '/anvil portable',    values: [false, false,  true,  true] },
  { label: '/feed',              values: [false, false,  false, true] },
  { label: 'Mystery Dust /vote', values: ['1.5×','2×',  '3×',  '4×'] },
  { label: 'Préfixe chat',       values: [true,  true,   true,  true] },
]

function Cell({ v, popular }: { v: Val; popular: boolean }) {
  if (v === true)  return <Check size={14} className={popular ? 'text-gold-light mx-auto' : 'text-gold/70 mx-auto'} />
  if (v === false) return <Minus size={12} className="text-muted/30 mx-auto" />
  return <span className={`text-xs font-medium ${popular ? 'text-gold-light' : 'text-text'}`}>{v}</span>
}

export default function GradesSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-12">

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Crown size={14} className="text-gold" />
            <h2 className="font-heading text-sm font-semibold text-gold tracking-widest uppercase">Grades</h2>
          </div>
          <span className="text-xs text-muted">Achat unique — jamais d'abonnement</span>
        </div>
        <div className="h-px" style={{ background: 'linear-gradient(to right, rgba(201,168,76,0.5), transparent)' }} />
      </div>

      <div className="rounded border border-border/60 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/60">
              <th className="text-left py-4 px-5 text-[10px] font-medium text-muted uppercase tracking-widest w-44">
                Avantages
              </th>
              {GRADES.map(g => {
                const Icon = GRADE_ICONS[g.id] ?? Crown
                return (
                  <th key={g.id} className={`py-4 px-3 text-center ${g.colBg}`}>
                    <div className={`w-10 h-10 rounded border ${g.border} flex items-center justify-center mx-auto mb-2 ${g.popular ? 'bg-gold/10' : 'bg-surface'}`}>
                      <Icon size={18} className={g.iconColor} />
                    </div>
                    <p className={`font-heading font-bold text-sm ${g.iconColor}`}>{g.name}</p>
                    <p className="text-text font-bold text-lg mt-0.5">{g.price}</p>
                    <a
                      href={g.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2.5 block py-1.5 rounded text-xs font-semibold transition-colors bg-gold hover:bg-gold-light text-bg"
                    >
                      Acheter
                    </a>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => (
              <tr key={row.label} className={i % 2 === 0 ? 'bg-surface/20' : ''}>
                <td className="py-3 px-5 text-xs text-muted">{row.label}</td>
                {row.values.map((v, j) => (
                  <td key={j} className={`py-3 px-3 text-center ${GRADES[j].colBg}`}>
                    <Cell v={v} popular={GRADES[j].popular} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted text-center mt-4">
        Aucun avantage pay-to-win. Les grades accélèrent uniquement le confort de jeu. Grade conservé à chaque saison.
      </p>
    </section>
  )
}
