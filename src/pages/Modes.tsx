import {
  Crown, TrendingUp, Hammer, Scroll, Shield, Target, Sparkles, Flame,
  Leaf, Wrench, Droplets, Users, ShoppingBag, Landmark,
  TreePine, Pickaxe, Fish,
} from 'lucide-react'

function SectionHeader({ title, right }: { title: string; right?: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <Crown size={14} className="text-gold" />
          <h2 className="font-heading text-sm font-semibold text-gold tracking-widest uppercase">{title}</h2>
        </div>
        {right && <span className="text-xs text-muted">{right}</span>}
      </div>
      <div className="h-px" style={{ background: 'linear-gradient(to right, rgba(201,168,76,0.5), transparent)' }} />
    </div>
  )
}

const JOBS = [
  { icon: Pickaxe,  name: 'Mineur',       color: 'text-stone-300',   bg: 'bg-stone-400/20',   desc: 'Extrayez minerais et pierres. La base de toute économie de ressources.' },
  { icon: TreePine, name: 'Bûcheron',     color: 'text-green-300',   bg: 'bg-green-400/20',   desc: 'Récoltez le bois des forêts. Indispensable pour construction et artisanat.' },
  { icon: Target,   name: 'Chasseur',     color: 'text-red-300',     bg: 'bg-red-400/20',     desc: "Éliminez des mobs hostiles et neutres. Sources de ressources rares et d'argent." },
  { icon: Fish,     name: 'Pêcheur',      color: 'text-blue-300',    bg: 'bg-blue-400/20',    desc: 'Pêchez poissons et trésors cachés. Métier calme, très rentable au haut niveau.' },
  { icon: Leaf,     name: 'Fermier',      color: 'text-lime-300',    bg: 'bg-lime-400/20',    desc: "Cultivez blé, canne à sucre, pommes de terre. Base de l'économie alimentaire." },
  { icon: Wrench,   name: 'Artisan',      color: 'text-orange-300',  bg: 'bg-orange-400/20',  desc: 'Craftez équipements et objets finis. Transformez les ressources brutes en valeur.' },
  { icon: Hammer,   name: 'Constructeur', color: 'text-amber-300',   bg: 'bg-amber-400/20',   desc: 'Posez des blocs, bâtissez des villes. Chaque bloc placé génère des revenus.' },
  { icon: Sparkles, name: 'Enchanteur',   color: 'text-purple-300',  bg: 'bg-purple-400/20',  desc: 'Enchantez armes, armures et outils. Les objets puissants valent cher sur le marché.' },
  { icon: Flame,    name: 'Forgeron',     color: 'text-yellow-300',  bg: 'bg-yellow-400/20',  desc: "Fondez minerais et forgez l'équipement. Synergie parfaite avec le Mineur." },
]

const GUILD_TIERS = [
  { name: 'Campement',  cost: '1 000 $',   members: 10, vaults: 0, bank: '5 000 $',   desc: 'Point de départ. Revendiquez votre territoire et recrutez vos premiers membres.' },
  { name: 'Fort',       cost: '5 000 $',   members: 20, vaults: 1, bank: '15 000 $',  desc: 'Première évolution. Coffre partagé débloqué. Étendez vos frontières.' },
  { name: 'Village',    cost: '15 000 $',  members: 35, vaults: 2, bank: '30 000 $',  desc: 'Communauté établie. Warp public disponible pour attirer commerçants et visiteurs.' },
  { name: 'Bastion',    cost: '40 000 $',  members: 50, vaults: 3, bank: '60 000 $',  desc: 'Puissance militaire reconnue. Déclaration de guerre possible.' },
  { name: 'Forteresse', cost: '100 000 $', members: 75, vaults: 5, bank: '150 000 $', desc: 'Sommet de la hiérarchie. Domination économique et territoriale totale.' },
]

const GUILD_COMMANDS = [
  { cmd: '/guild create <nom>',    desc: 'Créer une guilde (coût : 1 000 $)' },
  { cmd: '/guild invite <joueur>', desc: 'Inviter un joueur' },
  { cmd: '/guild upgrade',         desc: 'Passer au tier suivant' },
  { cmd: '/guild vault',           desc: 'Ouvrir les coffres partagés' },
  { cmd: '/guild ally <guilde>',   desc: 'Proposer une alliance' },
  { cmd: '/guild war <guilde>',    desc: 'Déclarer la guerre' },
]

const CLAIM_CHUNKS = [
  { grade: 'Joueur',     chunks: 16, color: 'text-text' },
  { grade: 'Pionnier',   chunks: 25, color: 'text-emerald-400' },
  { grade: 'Vétéran',    chunks: 36, color: 'text-blue-400' },
  { grade: 'Conquérant', chunks: 49, color: 'text-gold' },
  { grade: 'Légende',    chunks: 64, color: 'text-purple-400' },
]

export default function Modes() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Intro */}
      <div className="mb-10">
        <SectionHeader title="Modes & Systèmes" />
        <p className="text-muted text-sm leading-relaxed max-w-3xl">
          Zenkar est un SMP semi-RP médiéval avec des saisons de 8 à 12 mois. Le monde est reseté à chaque saison, mais vos grades Tebex et titres legacy restent à vie.
          Six systèmes interconnectés composent l'expérience de jeu.
        </p>
      </div>

      {/* ── Métiers ───────────────────────────────────────────────────── */}
      <section className="mb-14">
        <SectionHeader title="Métiers" right="9 métiers · max 2 simultanés" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
          {JOBS.map(({ icon: Icon, name, color, bg, desc }) => (
            <div key={name} className="flex items-start gap-3 p-4 rounded border border-border bg-card hover:border-gold/30 transition-colors">
              <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${bg}`}>
                <Icon size={16} className={color} />
              </div>
              <div>
                <p className="text-text text-sm font-semibold">{name}</p>
                <p className="text-muted text-xs leading-relaxed mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { value: '2 max',  label: 'métiers simultanés' },
            { value: '4.5×',   label: 'revenus au niveau 100' },
            { value: '−30%',   label: 'niveaux perdus si tu quittes' },
          ].map(({ value, label }) => (
            <div key={label} className="p-4 rounded border border-border bg-card text-center">
              <p className="font-heading font-bold text-gold text-lg">{value}</p>
              <p className="text-xs text-muted mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Villes & Guildes ──────────────────────────────────────────── */}
      <section className="mb-14">
        <SectionHeader title="Villes & Guildes" right="Lands + Guilds" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Commandes guildes */}
          <div>
            <p className="text-[10px] text-muted uppercase tracking-widest mb-3">Commandes principales</p>
            <div className="rounded border border-border overflow-hidden">
              {GUILD_COMMANDS.map((item, i) => (
                <div key={item.cmd}
                  className={`flex items-start gap-3 px-4 py-3 ${i !== GUILD_COMMANDS.length - 1 ? 'border-b border-border/50' : ''}`}>
                  <code className="text-[11px] text-gold font-mono flex-shrink-0 pt-px">{item.cmd}</code>
                  <span className="text-xs text-muted">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chunks par grade */}
          <div>
            <p className="text-[10px] text-muted uppercase tracking-widest mb-3">Chunks de claim par grade</p>
            <div className="rounded border border-border overflow-hidden">
              {CLAIM_CHUNKS.map((row, i) => (
                <div key={row.grade}
                  className={`flex items-center justify-between px-4 py-3 ${i % 2 === 0 ? 'bg-surface/30' : ''}`}>
                  <span className={`font-heading text-xs font-bold ${row.color}`}>{row.grade}</span>
                  <span className="text-xs text-text font-medium">{row.chunks} chunks</span>
                </div>
              ))}
              <div className="px-4 py-2 bg-surface/50 border-t border-border">
                <p className="text-[10px] text-muted">Coût d'entretien : 3 $ / chunk / semaine</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progression des guildes */}
        <p className="text-[10px] text-muted uppercase tracking-widest mb-3">Progression des guildes</p>
        <div className="rounded border border-border overflow-hidden">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-border bg-surface/40">
                <th className="text-left px-4 py-2.5 text-[10px] font-medium text-muted uppercase tracking-widest">Tier</th>
                <th className="text-center px-4 py-2.5 text-[10px] font-medium text-muted uppercase tracking-widest">Coût</th>
                <th className="text-center px-4 py-2.5 text-[10px] font-medium text-muted uppercase tracking-widest">Membres</th>
                <th className="text-center px-4 py-2.5 text-[10px] font-medium text-muted uppercase tracking-widest">Coffres</th>
                <th className="text-center px-4 py-2.5 text-[10px] font-medium text-muted uppercase tracking-widest hidden sm:table-cell">Caisse max</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-medium text-muted uppercase tracking-widest hidden lg:table-cell">Description</th>
              </tr>
            </thead>
            <tbody>
              {GUILD_TIERS.map((tier, i) => (
                <tr key={tier.name} className={i % 2 === 0 ? 'bg-card/40' : ''}>
                  <td className="px-4 py-3 font-heading text-sm font-bold text-gold">{tier.name}</td>
                  <td className="px-4 py-3 text-xs text-text text-center">{tier.cost}</td>
                  <td className="px-4 py-3 text-xs text-text text-center">{tier.members}</td>
                  <td className="px-4 py-3 text-xs text-text text-center">{tier.vaults === 0 ? '—' : tier.vaults}</td>
                  <td className="px-4 py-3 text-xs text-text text-center hidden sm:table-cell">{tier.bank}</td>
                  <td className="px-4 py-3 text-xs text-muted hidden lg:table-cell">{tier.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Économie ──────────────────────────────────────────────────── */}
      <section className="mb-14">
        <SectionHeader title="Économie" right="$ Zenkar" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: TrendingUp,  color: 'text-green-300',  bg: 'bg-green-400/20',  title: 'Revenus par métier',   desc: 'Gagnez des $ Zenkar en pratiquant vos métiers. Les revenus par action progressent avec votre niveau, jusqu\'à 4.5× au niveau 100.' },
            { icon: ShoppingBag, color: 'text-amber-300',  bg: 'bg-amber-400/20',  title: 'Boutiques joueurs',    desc: 'Créez votre propre boutique en jeu avec QuickShop. Vendez vos ressources aux autres joueurs en temps réel.' },
            { icon: Landmark,    color: 'text-blue-300',   bg: 'bg-blue-400/20',   title: 'Marché global (/ah)',   desc: 'Accédez au marché global. Enchérissez sur des items rares ou vendez au meilleur prix du serveur.' },
          ].map(({ icon: Icon, color, bg, title, desc }) => (
            <div key={title} className="p-5 rounded border border-border bg-card">
              <div className={`w-9 h-9 rounded flex items-center justify-center mb-3 ${bg}`}>
                <Icon size={18} className={color} />
              </div>
              <p className="text-text text-sm font-semibold mb-1.5">{title}</p>
              <p className="text-muted text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PvP & Arènes ──────────────────────────────────────────────── */}
      <section className="mb-14">
        <SectionHeader title="PvP & Arènes" right="PvP actif hors claims" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div className="space-y-3">
            {[
              { title: 'PvP actif en wilderness',  desc: 'Le PvP est actif partout dans le monde, sauf dans les claims personnels et de guilde. Un tag de combat t\'empêche de fuir dans un claim pendant un combat.' },
              { title: 'Système de drop',          desc: 'En arène, le vaincu perd 15 % de son argent en poche et lâche sa tête (cosmétique collectible).' },
              { title: 'Guerres de guildes',       desc: "Deux guildes peuvent se déclarer la guerre. Le PvP s'active alors entre leurs membres, y compris à l'intérieur de leurs claims respectifs." },
            ].map(({ title, desc }) => (
              <div key={title} className="p-4 rounded border border-border bg-card">
                <p className="text-text text-sm font-semibold mb-1">{title}</p>
                <p className="text-muted text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-[10px] text-muted uppercase tracking-widest mb-3">3 arènes thématiques</p>
            <div className="space-y-2">
              {[
                { icon: Droplets, name: 'Arène des Glaces', color: 'text-cyan-300',    bg: 'bg-cyan-400/20',    desc: 'Forêt enneigée. Structure centrale imposante et arbres denses — chaque recoin peut cacher une embuscade.' },
                { icon: Flame,    name: 'Arène du Nether',  color: 'text-orange-300',  bg: 'bg-orange-400/20',  desc: 'Plateformes de Netherrack, lave en contrebas. Risque permanent de chute.' },
                { icon: Sparkles, name: "Arène de l'End",   color: 'text-purple-300',  bg: 'bg-purple-400/20',  desc: 'Cristaux améthyste et ruines flottantes dans un ciel pourpre. Terrain accidenté aux multiples couverts — aucun répit possible.' },
              ].map(({ icon: Icon, name, color, bg, desc }) => (
                <div key={name} className="flex items-start gap-3 p-4 rounded border border-border bg-card">
                  <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${bg}`}>
                    <Icon size={16} className={color} />
                  </div>
                  <div>
                    <p className="text-text text-sm font-semibold">{name}</p>
                    <p className="text-muted text-xs leading-relaxed mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── RP & Lore ─────────────────────────────────────────────────── */}
      <section className="mb-14">
        <SectionHeader title="RP & Lore" right="Saisons 8–12 mois" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Scroll,  color: 'text-amber-300',  bg: 'bg-amber-400/20',  title: 'Saisons longues',    desc: 'Chaque saison dure 8 à 12 mois. Le monde est reseté mais grades et titres legacy restent permanents.' },
            { icon: Crown,   color: 'text-gold',        bg: 'bg-gold/20',        title: 'Titres legacy',      desc: 'Les joueurs actifs obtiennent "Vétéran Saison X". Un titre permanent affiché à côté de votre nom en jeu.' },
            { icon: Users,   color: 'text-indigo-300', bg: 'bg-indigo-400/20', title: 'Histoire partagée',  desc: "Le lore est construit par les joueurs. Vos guerres, alliances et trahisons font partie de l'histoire de Zenkar." },
          ].map(({ icon: Icon, color, bg, title, desc }) => (
            <div key={title} className="p-5 rounded border border-border bg-card">
              <div className={`w-9 h-9 rounded flex items-center justify-center mb-3 ${bg}`}>
                <Icon size={18} className={color} />
              </div>
              <p className="text-text text-sm font-semibold mb-1.5">{title}</p>
              <p className="text-muted text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Protection & Claim ────────────────────────────────────────── */}
      <section className="mb-8">
        <SectionHeader title="Protection & Claim" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: Shield, color: 'text-blue-300',  bg: 'bg-blue-400/20',  title: 'Anti-grief total',      desc: 'Aucun joueur ne peut détruire ou placer dans ton claim sans permission explicite. Logs complets pour rollback en cas de problème.' },
            { icon: Leaf,   color: 'text-green-300', bg: 'bg-green-400/20', title: '/fly dans ton claim',   desc: 'Les grades Conquérant et Légende peuvent voler dans leur propre claim et ceux qui leur font confiance. Désactivé en wilderness.' },
          ].map(({ icon: Icon, color, bg, title, desc }) => (
            <div key={title} className="p-5 rounded border border-border bg-card">
              <div className={`w-9 h-9 rounded flex items-center justify-center mb-3 ${bg}`}>
                <Icon size={18} className={color} />
              </div>
              <p className="text-text text-sm font-semibold mb-1.5">{title}</p>
              <p className="text-muted text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
