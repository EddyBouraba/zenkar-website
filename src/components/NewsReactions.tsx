import { useEffect, useRef, useState } from 'react'
import { SmilePlus } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { fetchReactions, toggleReaction, type ReactionEmoji, type ReactionsResponse } from '../lib/api'

const REACTIONS: { emoji: ReactionEmoji; icon: string; label: string }[] = [
  { emoji: 'fire',      icon: '🔥', label: 'Feu'     },
  { emoji: 'heart',     icon: '❤️', label: 'Cœur'    },
  { emoji: 'gg',        icon: '👏', label: 'GG'      },
  { emoji: 'surprised', icon: '😮', label: 'Surpris' },
]


interface Props {
  newsId: string
}

export default function NewsReactions({ newsId }: Props) {
  const { user } = useAuth()
  const [data, setData] = useState<ReactionsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState<ReactionEmoji | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchReactions(newsId)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [newsId])

  // fermer le picker au clic extérieur
  useEffect(() => {
    if (!pickerOpen) return
    function onClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [pickerOpen])

  async function handleReact(emoji: ReactionEmoji) {
    if (!user || pending) return
    setPickerOpen(false)
    setPending(emoji)
    try {
      const updated = await toggleReaction(newsId, emoji)
      setData(updated)
    } catch {
      // silently ignore
    } finally {
      setPending(null)
    }
  }

  if (loading || !data) return null

  const activeReactions = REACTIONS.filter(r => data.counts[r.emoji] > 0)

  return (
    <div className="flex items-center gap-1.5 flex-wrap">

      {/* Badges des réactions existantes */}
      {activeReactions.map(({ emoji, icon }) => {
        const count = data.counts[emoji]
        const active = data.user_reaction === emoji
        return (
          <button
            key={emoji}
            onClick={() => handleReact(emoji)}
            disabled={!user || pending !== null}
            title={user ? (active ? 'Retirer ma réaction' : 'Réagir') : 'Connecte-toi pour réagir'}
            className={[
              'inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium transition-all select-none',
              active
                ? 'border-gold/60 bg-gold/10 text-gold-light'
                : 'border-border bg-surface text-muted hover:border-gold/40 hover:bg-gold/5 hover:text-text',
              pending === emoji ? 'opacity-50' : '',
              !user ? 'cursor-default' : 'cursor-pointer',
            ].join(' ')}
          >
            <span className="text-sm leading-none">{icon}</span>
            <span>{count}</span>
          </button>
        )
      })}

      {/* Bouton picker */}
      {user && (
        <div className="relative" ref={pickerRef}>
          <button
            onClick={() => setPickerOpen(v => !v)}
            title="Ajouter une réaction"
            className={[
              'inline-flex items-center justify-center w-8 h-7 rounded-full border text-xs transition-all',
              pickerOpen
                ? 'border-gold/60 bg-gold/10 text-gold-light'
                : 'border-border bg-surface text-muted hover:border-gold/40 hover:bg-gold/5 hover:text-text',
            ].join(' ')}
          >
            <SmilePlus size={14} />
          </button>

          {/* Picker dropdown */}
          {pickerOpen && (
            <div className="absolute bottom-full left-0 mb-2 z-50">
              <div className="flex items-center gap-1 p-1.5 rounded-xl border border-border bg-surface shadow-lg">
                {REACTIONS.map(({ emoji, icon, label }) => {
                  const active = data.user_reaction === emoji
                  return (
                    <button
                      key={emoji}
                      onClick={() => handleReact(emoji)}
                      title={label}
                      className={[
                        'relative flex items-center justify-center w-9 h-9 rounded-lg text-xl transition-all hover:scale-125',
                        active ? 'bg-gold/15' : 'hover:bg-white/5',
                      ].join(' ')}
                    >
                      {icon}
                      {active && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-gold border border-surface" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Message si non connecté et aucune réaction */}
      {!user && activeReactions.length === 0 && (
        <span className="text-xs text-muted/50 italic">Aucune réaction pour l'instant</span>
      )}
    </div>
  )
}
