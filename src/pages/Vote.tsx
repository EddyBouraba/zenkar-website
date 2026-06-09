import { Crown, Sparkles, ExternalLink, Check } from 'lucide-react'

const VOTE_SITES = [
  {
    name: 'Top-Serveurs.net',
    desc: 'Annuaire multi-jeux, forte visibilité sur la communauté française.',
    url: 'https://top-serveurs.net/minecraft/zenkar-serveur-rpg',
    cooldown: '2h',
  },
  {
    name: 'Serveur-Prive.net',
    desc: 'Référence pour les serveurs privés Minecraft en France.',
    url: 'https://serveur-prive.net/minecraft/zenkar',
    cooldown: '1h30',
  },
  {
    name: 'Minecraft-Server-List.com',
    desc: 'Classement international, audience anglophone incluse.',
    url: 'https://minecraft-server-list.com/server/520723/',
    cooldown: '3h30',
  },
  {
    name: 'Minecraft-MP.com',
    desc: 'Liste internationale avec classements actifs.',
    url: 'https://minecraft-mp.com/server/359080',
    cooldown: '8h',
  },
]

const STEPS = [
  { step: '1', label: 'Connecte-toi sur play.zenkar.fr' },
  { step: '2', label: 'Clique sur chaque lien de vote ci-dessous' },
  { step: '3', label: 'Entre ton pseudo Minecraft sur le site de vote' },
  { step: '4', label: 'Reçois 100 Mystery Dust automatiquement en jeu' },
]

export default function Vote() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Crown size={14} className="text-gold" />
            <h1 className="font-heading text-sm font-semibold text-gold tracking-widest uppercase">
              Voter pour Zenkar
            </h1>
          </div>
          <span className="text-xs text-muted">+100 Dust par vote · 4 sites</span>
        </div>
        <div className="h-px mb-6" style={{ background: 'linear-gradient(to right, rgba(201,168,76,0.5), transparent)' }} />
        <p className="text-muted text-sm leading-relaxed max-w-2xl">
          Voter aide Zenkar à monter dans les classements et attirer de nouveaux joueurs. En retour, chaque vote te rapporte de la Mystery Dust pour débloquer des cosmétiques.
        </p>
      </div>

      {/* Récompense */}
      <div className="rounded border border-gold/25 bg-card mb-8 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f0d14 0%, #14110c 100%)' }}>
        <div className="p-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-12 h-12 rounded flex items-center justify-center bg-gold/15 border border-gold/30">
              <Sparkles size={22} className="text-gold" />
            </div>
            <div>
              <p className="font-heading font-bold text-2xl text-gold-light">+100 Dust</p>
              <p className="text-xs text-muted">par vote · par site</p>
            </div>
          </div>
          <div className="h-px sm:h-10 sm:w-px bg-border/60 flex-shrink-0" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1 w-full">
            {STEPS.map(({ step, label }) => (
              <div key={step} className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-gold mt-0.5">
                  {step}
                </span>
                <p className="text-xs text-muted leading-snug">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sites de vote */}
      <div className="mb-4">
        <p className="text-[10px] text-muted uppercase tracking-widest mb-4">
          {VOTE_SITES.length} sites de vote disponibles
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {VOTE_SITES.map((site) => (
            <div
              key={site.name}
              className="flex flex-col p-5 rounded border border-border bg-card hover:border-gold/30 transition-colors group"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-text text-sm font-semibold group-hover:text-gold-light transition-colors leading-snug">
                  {site.name}
                </p>
                <span className="text-[10px] text-muted border border-border rounded px-1.5 py-0.5 flex-shrink-0">
                  /{site.cooldown}
                </span>
              </div>
              <p className="text-muted text-xs leading-relaxed mb-4 flex-1">{site.desc}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-gold/70">
                  <Sparkles size={11} />
                  <span>+100 Dust</span>
                </div>
                <a
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded bg-gold hover:bg-gold-light text-bg text-xs font-semibold transition-colors"
                >
                  Voter
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Note */}
      <div className="flex items-start gap-2 mt-6 p-4 rounded border border-border bg-card">
        <Check size={14} className="text-green-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted leading-relaxed">
          La Mystery Dust est créditée automatiquement dès que ton vote est enregistré. Si tu ne la reçois pas, utilise <span className="font-mono text-text">/vote claim</span> en jeu ou ouvre un ticket sur le Discord.
        </p>
      </div>

    </div>
  )
}
