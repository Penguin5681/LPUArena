import { useEffect, useRef } from 'react'
import { logEvent } from '../lib/leaderboard'

const IS_PROD = import.meta.env.VITE_APP_ENV === 'production'

// Minimum ms between repeated out_of_focus logs (debounce)
const FOCUS_DEBOUNCE = 2000

export function useEventLogger() {
  const tabSwitchCount  = useRef(0)
  const copyPasteCount  = useRef(0)
  const lastFocusLog    = useRef(0)

  useEffect(() => {
    if (!IS_PROD) return

    // ── out_of_focus: window blur ──────────────────────────────
    const onBlur = () => {
      const now = Date.now()
      if (now - lastFocusLog.current < FOCUS_DEBOUNCE) return
      lastFocusLog.current = now
      tabSwitchCount.current += 1

      logEvent({
        eventType: 'out_of_focus',
        metadata:  { tabSwitchCount: tabSwitchCount.current },
      })
    }

    // ── copy_paste: paste event anywhere ──────────────────────
    const onPaste = () => {
      copyPasteCount.current += 1
      logEvent({
        eventType: 'copy_paste',
        metadata:  { pasteCount: copyPasteCount.current },
      })
    }

    // ── fullscreen_exit: custom event fired by useFullscreenEnforcement ──
    const onFullscreenExit = () => {
      logEvent({
        eventType: 'fullscreen_exit',
        metadata:  { timestamp: Date.now() },
      })
    }

    window.addEventListener('blur',             onBlur)
    document.addEventListener('paste',          onPaste,           true)
    document.addEventListener('fullscreen-exit', onFullscreenExit)

    return () => {
      window.removeEventListener('blur',             onBlur)
      document.removeEventListener('paste',          onPaste,           true)
      document.removeEventListener('fullscreen-exit', onFullscreenExit)
    }
  }, [])
}
