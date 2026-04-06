import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { ToastProvider } from './context/ToastContext.tsx'
import ComingSoon from './pages/ComingSoon.tsx'

const IS_COMING_SOON = import.meta.env.VITE_COMING_SOON === 'true'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {IS_COMING_SOON
      ? <ComingSoon />
      : <ToastProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ToastProvider>
    }
  </StrictMode>,
)
