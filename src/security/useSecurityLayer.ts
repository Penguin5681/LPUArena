import { useEffect } from 'react'

// Keys that open DevTools across browsers
const BLOCKED_KEYS: Array<(e: KeyboardEvent) => boolean> = [
  e => e.key === 'F12',
  e => e.ctrlKey  && e.shiftKey && ['I','J','C','K'].includes(e.key.toUpperCase()),
  e => e.metaKey  && e.altKey   && ['I','J','C','K'].includes(e.key.toUpperCase()),
  e => e.ctrlKey  && e.key === 'U',   // view-source
  e => e.metaKey  && e.key === 'U',
  e => e.ctrlKey  && e.shiftKey && e.key === 'E', // Firefox network
  e => e.ctrlKey  && e.key === 'S',   // save page
  e => e.metaKey  && e.key === 'S',
  e => e.ctrlKey  && e.key === 'P',   // print (can expose DOM)
  e => e.metaKey  && e.key === 'P',
]

export function useSecurityLayer() {
  useEffect(() => {
    // ── block devtools keyboard shortcuts ──────────────────────
    const onKeyDown = (e: KeyboardEvent) => {
      if (BLOCKED_KEYS.some(fn => fn(e))) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    // ── block right-click context menu ─────────────────────────
    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }

    // ── block copy / cut ───────────────────────────────────────
    const onCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement
      // allow copy inside input / textarea / contenteditable
      if (isEditable(target)) return
      e.preventDefault()
      e.clipboardData?.setData('text/plain', '')
    }

    const onCut = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement
      if (isEditable(target)) return
      e.preventDefault()
    }

    // ── block drag (can be used to extract content) ────────────
    const onDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement
      if (isEditable(target)) return
      e.preventDefault()
    }

    // ── devtools detection via timing trick ────────────────────
    // Opening devtools causes a measurable lag in console.log timing.
    let devtoolsOpen = false
    const devtoolsCheck = setInterval(() => {
      const before = performance.now()
      console.log('%c', 'color:transparent;font-size:0') // intentional devtools probe
      const after = performance.now()
      if (after - before > 100 && !devtoolsOpen) {
        devtoolsOpen = true
        document.dispatchEvent(new CustomEvent('devtools-open'))
      } else if (after - before <= 100 && devtoolsOpen) {
        devtoolsOpen = false
      }
    }, 1500)

    // ── print screen / screenshot warning ─────────────────────
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        // clear clipboard on PrintScreen
        navigator.clipboard?.writeText('').catch(() => {})
      }
    }

    document.addEventListener('keydown',     onKeyDown,     true)
    document.addEventListener('keyup',       onKeyUp,       true)
    document.addEventListener('contextmenu', onContextMenu, true)
    document.addEventListener('copy',        onCopy,        true)
    document.addEventListener('cut',         onCut,         true)
    document.addEventListener('dragstart',   onDragStart,   true)

    return () => {
      document.removeEventListener('keydown',     onKeyDown,     true)
      document.removeEventListener('keyup',       onKeyUp,       true)
      document.removeEventListener('contextmenu', onContextMenu, true)
      document.removeEventListener('copy',        onCopy,        true)
      document.removeEventListener('cut',         onCut,         true)
      document.removeEventListener('dragstart',   onDragStart,   true)
      clearInterval(devtoolsCheck)
    }
  }, [])
}

function isEditable(el: HTMLElement): boolean {
  const tag = el.tagName.toLowerCase()
  return (
    tag === 'input' ||
    tag === 'textarea' ||
    el.isContentEditable ||
    !!el.closest('[contenteditable]') ||
    !!el.closest('input') ||
    !!el.closest('textarea')
  )
}
