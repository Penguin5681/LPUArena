import './App.css'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from './context/AuthContext'
import LeftPanel     from './components/login/LeftPanel'
import TopBar        from './components/login/TopBar'
import LoginForm     from './components/login/LoginForm'
import SignupForm    from './components/signup/SignupForm'
import BottomBar     from './components/login/BottomBar'
import SecurityShell from './security/SecurityShell'
import Dashboard     from './dashboard/Dashboard'

const IS_PROD = import.meta.env.VITE_APP_ENV === 'production'

export default function App() {
  const { user, loading } = useAuth()

  const [page, setPage]           = useState<'login' | 'signup'>('login')
  const [animating, setAnimating] = useState(false)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [visible, setVisible]     = useState<'login' | 'signup'>('login')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const navigate = (target: 'login' | 'signup') => {
    if (animating || target === visible) return
    if (timerRef.current) clearTimeout(timerRef.current)
    setDirection(target === 'signup' ? 'forward' : 'back')
    setPage(target)
    setAnimating(true)
    timerRef.current = setTimeout(() => {
      setVisible(target)
      setAnimating(false)
    }, 420)
  }

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  // ── loading splash ──
  if (loading) {
    return (
      <div className="auth-loading">
        <span className="auth-loading-mark">◈</span>
      </div>
    )
  }

  // ── authenticated ──
  if (user) {
    const content = <Dashboard />
    return IS_PROD ? <SecurityShell>{content}</SecurityShell> : content
  }

  // ── unauthenticated ──
  return (
    <div className="page">
      <LeftPanel page={page} />
      <main className="panel-right">
        <TopBar page={page} onNavigate={navigate} />

        <div className="form-stage">
          <div className={[
            'form-slot',
            page !== 'login' && animating   ? `exit-${direction}`  : '',
            page === 'login' && animating    ? `enter-${direction}` : '',
            visible === 'login' && !animating ? 'settled' : '',
            visible !== 'login' && !animating ? 'hidden'  : '',
          ].filter(Boolean).join(' ')}>
            <LoginForm onSignup={() => navigate('signup')} />
          </div>

          <div className={[
            'form-slot',
            page === 'signup' && animating   ? `enter-${direction}` : '',
            page !== 'signup' && animating   ? `exit-${direction}`  : '',
            visible === 'signup' && !animating ? 'settled' : '',
            visible !== 'signup' && !animating ? 'hidden'  : '',
          ].filter(Boolean).join(' ')}>
            <SignupForm onLogin={() => navigate('login')} />
          </div>
        </div>

        <BottomBar />
      </main>
    </div>
  )
}
