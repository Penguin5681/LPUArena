import './App.css'
import { useState, useEffect, useRef } from 'react'
import LeftPanel  from './components/login/LeftPanel'
import TopBar     from './components/login/TopBar'
import LoginForm  from './components/login/LoginForm'
import SignupForm from './components/signup/SignupForm'
import BottomBar  from './components/login/BottomBar'

export default function App() {
  const [page, setPage]         = useState<'login' | 'signup'>('login')
  const [animating, setAnimating] = useState(false)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  // visible = what's currently shown; next = what's coming in
  const [visible, setVisible]   = useState<'login' | 'signup'>('login')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const navigate = (target: 'login' | 'signup') => {
    if (animating || target === visible) return
    if (timerRef.current) clearTimeout(timerRef.current)

    setDirection(target === 'signup' ? 'forward' : 'back')
    setPage(target)       // mount the incoming form immediately
    setAnimating(true)

    timerRef.current = setTimeout(() => {
      setVisible(target)  // after animation, mark it as the settled view
      setAnimating(false)
    }, 420)
  }

  // cleanup on unmount
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  return (
    <div className="page">
      <LeftPanel page={page} />
      <main className="panel-right">
        <TopBar page={page} onNavigate={navigate} />

        <div className="form-stage">
          {/* login — exits left when going forward, enters from left when coming back */}
          <div className={[
            'form-slot',
            page !== 'login' && animating  ? `exit-${direction}`  : '',
            page === 'login' && animating   ? `enter-${direction}` : '',
            visible === 'login' && !animating ? 'settled' : '',
            visible !== 'login' && !animating ? 'hidden'  : '',
          ].filter(Boolean).join(' ')}>
            <LoginForm onSignup={() => navigate('signup')} />
          </div>

          {/* signup — enters from right when going forward, exits right when going back */}
          <div className={[
            'form-slot',
            page === 'signup' && animating  ? `enter-${direction}` : '',
            page !== 'signup' && animating  ? `exit-${direction}`  : '',
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
