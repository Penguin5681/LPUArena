import { useSecurityLayer } from './useSecurityLayer'
import { useFullscreenEnforcement } from './useFullscreenEnforcement'
import { useEventLogger } from './useEventLogger'
import { SecurityContext } from './SecurityContext'
import './SecurityShell.css'

export default function SecurityShell({ children }: { children: React.ReactNode }) {
  useSecurityLayer()
  useFullscreenEnforcement()
  const { reportPaste, reportBurst } = useEventLogger()

  return (
    <SecurityContext.Provider value={{ reportPaste, reportBurst }}>
      <div className="sec-shell">
        {children}
      </div>
    </SecurityContext.Provider>
  )
}
