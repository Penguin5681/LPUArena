import { createContext, useContext, useState, useCallback, useRef } from 'react'
import './ToastContext.css'

export type ToastKind = 'warning' | 'error' | 'info'

export interface Toast {
  id:      number
  kind:    ToastKind
  title:   string
  message: string
}

interface ToastCtx {
  push: (t: Omit<Toast, 'id'>) => void
}

const Ctx = createContext<ToastCtx | null>(null)

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useToast must be inside <ToastProvider>')
  return ctx
}

const AUTO_DISMISS = 6000 // ms

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counter = useRef(0)

  const dismiss = useCallback((id: number) => {
    setToasts(t => t.filter(x => x.id !== id))
  }, [])

  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = ++counter.current
    setToasts(prev => [...prev, { ...t, id }])
    setTimeout(() => dismiss(id), AUTO_DISMISS)
  }, [dismiss])

  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="toast-stack" aria-live="assertive" aria-atomic="false">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast--${t.kind}`} role="alert">
            <div className="toast-icon" aria-hidden="true">
              {t.kind === 'warning' && '⚠'}
              {t.kind === 'error'   && '✕'}
              {t.kind === 'info'    && 'ℹ'}
            </div>
            <div className="toast-body">
              <div className="toast-title">{t.title}</div>
              <div className="toast-msg">{t.message}</div>
            </div>
            <button
              className="toast-close"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
            >✕</button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}
