import { useEffect } from 'react'
import { useSecurityLayer } from './useSecurityLayer'
import { useFullscreenEnforcement } from './useFullscreenEnforcement'
import { useEventLogger } from './useEventLogger'
import './SecurityShell.css'

interface Props {
  children: React.ReactNode
}

export default function SecurityShell({ children }: Props) {
  useSecurityLayer()
  useFullscreenEnforcement()
  useEventLogger()

  // ── blur content when window loses focus (alt-tab / screen share) ──
  useEffect(() => {
    const onBlur  = () => document.body.classList.add('sec-blurred')
    const onFocus = () => document.body.classList.remove('sec-blurred')

    window.addEventListener('blur',  onBlur)
    window.addEventListener('focus', onFocus)
    return () => {
      window.removeEventListener('blur',  onBlur)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  return (
    <div className="sec-shell">
      {children}
    </div>
  )
}
