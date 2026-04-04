import './App.css'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from './context/AuthContext'
import LeftPanel  from './components/login/LeftPanel'
import TopBar     from './components/login/TopBar'
import LoginForm  from './components/login/LoginForm'
import SignupForm from './components/signup/SignupForm'
import BottomBar  from './components/login/BottomBar'

// ── minimal dashboard shown after auth ──────────────────────────
function Dashboard() {
  const { user, logout } = useAuth()
  return (
    <div className="dashboard">
      <p className="dashboard-greeting">Welcome, <strong>{user?.name}</strong></p>
      <p className="dashboard-email">{user?.email}</p>
      <button className="dashboard-logout" onClick={logout}>Sign out</button>
    </div>
  )
}

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
    return (
      <div className="page">
        <LeftPanel page="login" />
        <main className="panel-right">
          <TopBar page="login" onNavigate={() => {}} />
          <Dashboard />
          <BottomBar />
        </main>
      </div>
    )
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
