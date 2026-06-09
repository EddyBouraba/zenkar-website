import { useState, useEffect } from 'react'
import { fetchStats } from '../lib/api'
import type { ServerStats } from '../lib/api'

const MOCK: ServerStats = {
  players_online: 0,
  max_players: 100,
  version: '1.21.x',
  status: 'online',
  tps: 20,
}

export function useServerStats() {
  const [stats, setStats] = useState<ServerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchStats()
      .then(setStats)
      .catch(() => { setStats(MOCK); setError(true) })
      .finally(() => setLoading(false))
  }, [])

  return { stats, loading, error }
}
