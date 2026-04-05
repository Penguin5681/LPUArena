import { useEffect } from 'react'
import { useSecurityLayer } from './useSecurityLayer'
import { useFullscreenEnforcement } from './useFullscreenEnforcement'
import { useEventLogger } from './useEventLogger'
import { SecurityContext } from './SecurityContext'
import './SecurityShell.css'

export default function SecurityShell({ children }: { children: React.ReactNode }) {
  useSecurityLayer()
  useFullscreenEnforcement()
  const { reportPaste, reportBurst } = useEventLogger()

  // blur content when window loses focus
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
    <SecurityContext.Provider value={{ reportPaste, reportBurst }}>
      <div className="sec-shell">
        {children}
      </div>
    </SecurityContext.Provider>
  )
}
