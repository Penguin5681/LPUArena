import { useEffect, useRef } from 'react'

const IS_PROD = import.meta.env.VITE_APP_ENV === 'production'

// How long to wait before re-requesting fullscreen after the user exits (ms).
// A small delay avoids browser throttling on repeated requests.
const RETRY_DELAY = 800

export function useFullscreenEnforcement() {
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!IS_PROD) return

    // ── request fullscreen on the document element ─────────────
    function requestFullscreen() {
      const el = document.documentElement as HTMLElement & {
        mozRequestFullScreen?:    () => Promise<void>
        webkitRequestFullscreen?: () => Promise<void>
        msRequestFullscreen?:     () => Promise<void>
      }

      const fn =
        el.requestFullscreen        ??
        el.mozRequestFullScreen     ??
        el.webkitRequestFullscreen  ??
        el.msRequestFullscreen

      if (fn) fn.call(el).catch(() => {
        // Browser may reject if not triggered by a user gesture.
        // Schedule a retry — the next user interaction will re-trigger.
        scheduleRetry()
      })
    }

    function scheduleRetry() {
      if (retryTimer.current) clearTimeout(retryTimer.current)
      retryTimer.current = setTimeout(requestFullscreen, RETRY_DELAY)
    }

    // ── detect fullscreen exit and re-enter ────────────────────
    function onFullscreenChange() {
      const isFullscreen =
        document.fullscreenElement          ??
        // @ts-expect-error vendor prefix
        document.webkitFullscreenElement    ??
        // @ts-expect-error vendor prefix
        document.mozFullScreenElement       ??
        // @ts-expect-error vendor prefix
        document.msFullscreenElement

      if (!isFullscreen) {
        // notify event logger before re-entering
        document.dispatchEvent(new CustomEvent('fullscreen-exit'))
        scheduleRetry()
      }
    }

    // ── also re-request on any user interaction after a rejection ─
    function onUserGesture() {
      const isFullscreen =
        document.fullscreenElement          ??
        // @ts-expect-error vendor prefix
        document.webkitFullscreenElement    ??
        // @ts-expect-error vendor prefix
        document.mozFullScreenElement       ??
        // @ts-expect-error vendor prefix
        document.msFullscreenElement

      if (!isFullscreen) requestFullscreen()
    }

    // Enter fullscreen immediately
    requestFullscreen()

    document.addEventListener('fullscreenchange',       onFullscreenChange)
    document.addEventListener('webkitfullscreenchange', onFullscreenChange)
    document.addEventListener('mozfullscreenchange',    onFullscreenChange)
    document.addEventListener('MSFullscreenChange',     onFullscreenChange)

    // Re-request on click/keydown so the next gesture re-triggers it
    document.addEventListener('click',   onUserGesture, true)
    document.addEventListener('keydown', onUserGesture, true)

    return () => {
      if (retryTimer.current) clearTimeout(retryTimer.current)

      document.removeEventListener('fullscreenchange',       onFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange)
      document.removeEventListener('mozfullscreenchange',    onFullscreenChange)
      document.removeEventListener('MSFullscreenChange',     onFullscreenChange)

      document.removeEventListener('click',   onUserGesture, true)
      document.removeEventListener('keydown', onUserGesture, true)
    }
  }, [])
}
