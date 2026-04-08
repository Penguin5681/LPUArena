import { useEffect, useRef, useCallback } from 'react'
import { logEvent } from '../lib/leaderboard'

const IS_PROD = import.meta.env.VITE_APP_ENV === 'production'

export function useEventLogger() {
  const copyPasteCount  = useRef(0)
  const fullscreenCount = useRef(0)

  const fire = useCallback(async (
    eventType: 'copy_paste' | 'fullscreen_exit',
    metadata: Record<string, unknown>,
  ) => {
    // fire-and-forget — log the event silently, no UI feedback
    logEvent({ eventType, metadata })
  }, [])

  const reportPaste = useCallback(() => {
    if (!IS_PROD) return
    copyPasteCount.current += 1
    fire('copy_paste', {
      pasteCount: copyPasteCount.current,
      source: 'monaco',
    })
  }, [fire])

  const reportBurst = useCallback((charsDelta: number) => {
    if (!IS_PROD) return
    copyPasteCount.current += 1
    fire('copy_paste', {
      pasteCount: copyPasteCount.current,
      source:     'burst',
      charsDelta,
      burst:      true,
    })
  }, [fire])

  useEffect(() => {
    if (!IS_PROD) return

    const onPaste = () => {
      copyPasteCount.current += 1
      fire('copy_paste', {
        pasteCount: copyPasteCount.current,
        source: 'document',
      })
    }

    const onFullscreenExit = () => {
      fullscreenCount.current += 1
      fire('fullscreen_exit', {
        count: fullscreenCount.current,
      })
    }

    document.addEventListener('paste',           onPaste,           true)
    document.addEventListener('fullscreen-exit', onFullscreenExit)

    return () => {
      document.removeEventListener('paste',           onPaste,           true)
      document.removeEventListener('fullscreen-exit', onFullscreenExit)
    }
  }, [fire])

  return { reportPaste, reportBurst }
}
