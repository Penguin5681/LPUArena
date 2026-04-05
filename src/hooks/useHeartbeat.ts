import { useEffect, useRef } from 'react'
import { sendHeartbeat } from '../lib/leaderboard'

const INTERVAL_MS = 30_000 // ping every 30 seconds

export function useHeartbeat(page: string) {
  const pageRef = useRef(page)
  pageRef.current = page

  useEffect(() => {
    const ping = () => {
      sendHeartbeat(pageRef.current, !document.hidden)
    }

    // fire immediately on mount, then on interval
    ping()
    const id = setInterval(ping, INTERVAL_MS)

    // also ping when tab becomes visible again
    const onVisibility = () => { if (!document.hidden) ping() }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, []) // page changes are handled via ref — no re-subscribe needed
}
