import { useEffect, useRef, useCallback } from 'react'
import { logEvent } from '../lib/leaderboard'

const IS_PROD = import.meta.env.VITE_APP_ENV === 'production'

const EVENT_TITLES: Record<string, string> = {
  copy_paste:      '🚨 PASTE ATTEMPT BLOCKED',
  fullscreen_exit: '🚨 FULLSCREEN VIOLATION',
  burst_typing:    '🚨 CODE INJECTION DETECTED',
}

const EVENT_MESSAGES: Record<string, (penalty: number, count: number, extra?: number) => string> = {
  copy_paste: (p, c) =>
    `Pasting external content is not allowed. This attempt has been logged and reported.\n−${p} point${p !== 1 ? 's' : ''} deducted. Penalty increases with each attempt. (Attempt #${c})`,
  fullscreen_exit: (p, c) =>
    `Exiting fullscreen during the exam is a violation. You have been flagged.\n−${p} point${p !== 1 ? 's' : ''} deducted from your leaderboard score. (Violation #${c})`,
  burst_typing: (p, c, chars) =>
    `A sudden insertion of ${chars} characters was detected and removed. This is flagged as a code injection attempt.\n−${p} point${p !== 1 ? 's' : ''} deducted. (Attempt #${c})`,
}

export function useEventLogger() {
  // const { push } = useToast()

  const copyPasteCount   = useRef(0)
  const fullscreenCount  = useRef(0)

  const fire = useCallback(async (
    eventType: 'copy_paste' | 'fullscreen_exit',
    count: number,
    metadata: Record<string, unknown>,
    extraForMessage?: number,
  ) => {
    const res = await logEvent({ eventType, metadata })
    const penalty = res?.penaltyPoints ?? 1

    const titleKey = metadata.burst ? 'burst_typing' : eventType
    push({
      kind:    'error',
      title:   EVENT_TITLES[titleKey] ?? EVENT_TITLES[eventType],
      message: EVENT_MESSAGES[titleKey]
        ? EVENT_MESSAGES[titleKey](penalty, count, extraForMessage)
        : EVENT_MESSAGES[eventType](penalty, count),
    })
  }, [push])

  // Exposed so Monaco can call it directly — paste blocked
  const reportPaste = useCallback(() => {
    if (!IS_PROD) return
    copyPasteCount.current += 1
    fire('copy_paste', copyPasteCount.current, {
      pasteCount: copyPasteCount.current,
      source: 'monaco',
    })
  }, [fire])

  // Burst injection — large delta in a single onChange
  const reportBurst = useCallback((charsDelta: number) => {
    if (!IS_PROD) return
    copyPasteCount.current += 1
    fire('copy_paste', copyPasteCount.current, {
      pasteCount:  copyPasteCount.current,
      source:      'burst',
      charsDelta,
      burst:       true,
    }, charsDelta)
  }, [fire])

  useEffect(() => {
    if (!IS_PROD) return

    // ── copy_paste: document-level (outside Monaco) ────────────
    const onPaste = () => {
      copyPasteCount.current += 1
      fire('copy_paste', copyPasteCount.current, {
        pasteCount: copyPasteCount.current,
        source: 'document',
      })
    }

    // ── fullscreen_exit ────────────────────────────────────────
    const onFullscreenExit = () => {
      fullscreenCount.current += 1
      fire('fullscreen_exit', fullscreenCount.current, {
        timestamp: Date.now(),
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
