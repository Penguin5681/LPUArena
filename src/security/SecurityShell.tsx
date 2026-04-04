import { useEffect } from 'react'
import { useSecurityLayer } from './useSecurityLayer'
import './SecurityShell.css'

interface Props {
  children: React.ReactNode
}

export default function SecurityShell({ children }: Props) {
  useSecurityLayer()

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
