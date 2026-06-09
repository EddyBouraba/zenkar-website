import { NavLink } from 'react-router-dom'
import { Search } from 'lucide-react'

const LINKS = [
  { to: '/',            label: 'Accueil',      end: true  },
  { to: '/modes',       label: 'Modes de jeu', end: false },
  { to: '/classements', label: 'Classements',  end: false },
  { to: '/forum',       label: 'Forums',        end: false },
  { to: '/regles',      label: 'Règles',        end: false },
  { to: '/support',     label: 'Support',       end: false },
  { to: '/boutique',    label: 'Boutique',      end: false },
  { to: '/vote',        label: 'Voter',         end: false },
]

export default function NavBar() {
  return (
    <nav className="bg-[#0c0a11] border-b border-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 flex items-center h-11">

        {LINKS.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `px-3 h-11 inline-flex items-center text-xs font-medium tracking-widest uppercase border-b-2 transition-colors ${
                isActive
                  ? 'text-gold border-gold'
                  : 'text-muted hover:text-text border-transparent'
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}

        <div className="ml-auto">
          <Search size={14} className="text-muted hover:text-text cursor-pointer transition-colors" />
        </div>
      </div>
    </nav>
  )
}
