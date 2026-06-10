import { Shield, Crown, Sparkles, Star, Gem } from 'lucide-react'

export type Grade = 'pionnier' | 'veteran' | 'conquerant' | 'legende' | 'vip' | 'fondateur'

const GRADES: Record<Grade, {
  label: string
  icon: typeof Crown
  text: string
  border: string
  bg: string
}> = {
  pionnier:   { label: 'Pionnier',   icon: Shield,   text: 'text-emerald-400', border: 'border-emerald-400/30', bg: 'bg-emerald-400/10' },
  veteran:    { label: 'Vétéran',    icon: Crown,    text: 'text-blue-400',    border: 'border-blue-400/30',    bg: 'bg-blue-400/10'    },
  conquerant: { label: 'Conquérant', icon: Crown,    text: 'text-gold',        border: 'border-gold/30',        bg: 'bg-gold/10'        },
  legende:    { label: 'Légende',    icon: Sparkles, text: 'text-purple-400',  border: 'border-purple-400/30',  bg: 'bg-purple-400/10'  },
  vip:        { label: 'VIP',        icon: Star,     text: 'text-cyan-400',    border: 'border-cyan-400/30',    bg: 'bg-cyan-400/10'    },
  fondateur:  { label: 'Fondateur', icon: Gem,      text: 'text-rose-400',    border: 'border-rose-400/40',    bg: 'bg-rose-400/10'    },
}

interface GradeBadgeProps {
  grade: string | null | undefined
  size?: 'sm' | 'md'
}

export default function GradeBadge({ grade, size = 'sm' }: GradeBadgeProps) {
  if (!grade || !(grade in GRADES)) return null
  const g = GRADES[grade as Grade]
  const Icon = g.icon
  const iconSize = size === 'md' ? 12 : 10
  const textCls = size === 'md' ? 'text-xs' : 'text-[10px]'
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm border ${g.border} ${g.bg} ${g.text} ${textCls} font-medium`}>
      <Icon size={iconSize} />
      {g.label}
    </span>
  )
}

export { GRADES }
