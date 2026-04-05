import { createContext, useContext } from 'react'

interface SecurityCtx {
  reportPaste:  () => void
  reportBurst:  (charsDelta: number) => void
}

export const SecurityContext = createContext<SecurityCtx>({
  reportPaste:  () => {},
  reportBurst:  () => {},
})

// eslint-disable-next-line react-refresh/only-export-components
export function useSecurity() {
  return useContext(SecurityContext)
}
