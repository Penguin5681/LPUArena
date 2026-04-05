import { useEffect, useRef, useCallback } from 'react'
import { logEvent } from '../lib/leaderboard'
import { useToast } from '../context/ToastContext'

const IS_PROD = import.meta.env.VITE_APP_ENV === 'production'
const FOCUS_DEBOUNCE = 2000

const EVENT_TITLES: Record<string, string> = {
  out_of_focus:    '🚨 TAB SWITCH DETECTED',
  copy_paste:      '🚨 PASTE ATTEMPT BLOCKED',
  fullscreen_exit: '🚨 FULLSCREEN VIOLATION',
  burst_typing:    '🚨 CODE INJECTION DETECTED',
}

const EVENT_MESSAGES: Record<string, (penalty: number, count: number, extra?: number) => string> = {
  out_of_focus: (p, c) =>
    `Leaving the exam window is strictly prohibited. This incident has been recorded.\n−${p} point${p !== 1 ? 's' : ''} deducted from your leaderboard score. (Violation #${c})`,
  copy_paste: (p, c) =>
    `Pasting external content is not allowed. This attempt has been logged and reported.\n−${p} point${p !== 1 ? 's' : ''} deducted. Penalty increases with each attempt. (Attempt #${c})`,
  fullscreen_exit: (p, c) =>
    `Exiting fullscreen during the exam is a violation. You have been flagged.\n−${p} point${p !== 1 ? 's' : ''} deducted from your leaderboard score. (Violation #${c})`,
  burst_typing: (p, c, chars) =>
    `A sudden insertion of ${chars} characters was detected and removed. This is flagged as a code injection attempt.\n−${p} point${p !== 1 ? 's' : ''} deducted. (Attempt #${c})`,
}

export function useEventLogger() {
  const { push } = useToast()

  const tabSwitchCount   = useRef(0)
  const copyPasteCount   = useRef(0)
  const fullscreenCount  = useRef(0)
  const lastFocusLog     = useRef(0)

  const fire = useCallback(async (
    eventType: 'out_of_focus' | 'copy_paste' | 'fullscreen_exit',
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

    // ── out_of_focus ───────────────────────────────────────────
    const onBlur = () => {
      const now = Date.now()
      if (now - lastFocusLog.current < FOCUS_DEBOUNCE) return
      lastFocusLog.current = now
      tabSwitchCount.current += 1
      fire('out_of_focus', tabSwitchCount.current, {
        tabSwitchCount: tabSwitchCount.current,
      })
    }

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

    window.addEventListener('blur',              onBlur)
    document.addEventListener('paste',           onPaste,           true)
    document.addEventListener('fullscreen-exit', onFullscreenExit)

    return () => {
      window.removeEventListener('blur',              onBlur)
      document.removeEventListener('paste',           onPaste,           true)
      document.removeEventListener('fullscreen-exit', onFullscreenExit)
    }
  }, [fire])

  return { reportPaste, reportBurst }
}
