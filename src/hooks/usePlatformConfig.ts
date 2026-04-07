import { useEffect, useState } from 'react'
import { getPlatformConfig } from '../lib/leaderboard'

const POLL_INTERVAL = 10_000 // 10 seconds

export type ConfigState = 'loading' | 'coming-soon' | 'live'

export function usePlatformConfig(): ConfigState {
  const [state, setState] = useState<ConfigState>('loading')

  useEffect(() => {
    let cancelled = false

    const check = async () => {
      const config = await getPlatformConfig()
      if (cancelled) return

      if (config === null) {
        // API unreachable — keep current state, don't flip to live
        return
      }

      setState(config.isComingSoon ? 'coming-soon' : 'live')
    }

    check()
    const id = setInterval(check, POLL_INTERVAL)

    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  return state
}
