import { useEffect, useRef } from 'react'
import {
  apiGetSessionToken,
  getSessionToken,
  saveSessionToken,
  clearToken,
  clearSessionToken,
} from '../lib/auth'

const POLL_INTERVAL = 5_000 // 10 seconds

/**
 * Polls /api/auth/session-token every 10s.
 * On first call, stores the token locally.
 * On subsequent calls, compares with stored value.
 * If they differ (another device logged in), calls onSessionInvalid.
 */
export function useSessionGuard(
  isAuthenticated: boolean,
  onSessionInvalid: () => void,
) {
  const onInvalidRef = useRef(onSessionInvalid)
  onInvalidRef.current = onSessionInvalid

  useEffect(() => {
    if (!isAuthenticated) return

    let cancelled = false

    const check = async () => {
      try {
        const { sessionToken } = await apiGetSessionToken()
        if (cancelled) return

        const stored = getSessionToken()

        if (!stored) {
          // first time — store it
          saveSessionToken(sessionToken)
          return
        }

        if (stored !== sessionToken) {
          // mismatch — another device has logged in
          clearToken()
          clearSessionToken()
          onInvalidRef.current()
        }
      } catch (e) {
        if (cancelled) return
        // 401 from server means session is already invalid
        const msg = e instanceof Error ? e.message : ''
        if (
          msg.includes('Unauthorized') ||
          msg.includes('Session expired') ||
          msg.includes('Invalid or expired token')
        ) {
          clearToken()
          clearSessionToken()
          onInvalidRef.current()
        }
        // other errors (network) — silently ignore, try again next poll
      }
    }

    check()
    const id = setInterval(check, POLL_INTERVAL)

    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [isAuthenticated])
}
