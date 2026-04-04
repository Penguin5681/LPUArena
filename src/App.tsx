import { useState } from 'react'
import './App.css'

function App() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [focused, setFocused]   = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => e.preventDefault()

  return (
    <div className="page">
      {/* left editorial panel */}
      <aside className="panel-left" aria-hidden="true">
        <div className="panel-noise" />
        <div className="big-text">
          <span className="big-line">SIG</span>
          <span className="big-line indent">N</span>
          <span className="big-line">IN</span>
        </div>
        <div className="panel-meta">
          <span>EST. 2025</span>
          <span className="meta-dot" />
          <span>v1.0.0</span>
        </div>
        <div className="panel-ticker" aria-label="ticker">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="ticker-item">ACCESS GRANTED ◆ SECURE SESSION ◆ </span>
          ))}
        </div>
      </aside>

      {/* right form panel */}
      <main className="panel-right">
        {/* top bar */}
        <header className="top-bar">
          <div className="logo-mark">◈</div>
          <nav className="top-nav">
            <a href="#" className="nav-link">Help</a>
            <a href="#" className="nav-link">Register</a>
          </nav>
        </header>

        {/* form area */}
        <div className="form-wrap">
          <div className="form-eyebrow">AUTHENTICATION REQUIRED</div>
          <h1 className="form-title">
            Welcome<br />
            <em>back.</em>
          </h1>
          <p className="form-desc">
            Enter your credentials to continue.
          </p>

          <form onSubmit={handleSubmit} noValidate className="form">
            {/* email */}
            <div className={`field ${focused === 'email' ? 'is-focused' : ''} ${email ? 'has-value' : ''}`}>
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                autoComplete="email"
                spellCheck={false}
                placeholder="you@example.com"
              />
              <div className="field-line" />
            </div>

            {/* password */}
            <div className={`field ${focused === 'password' ? 'is-focused' : ''} ${password ? 'has-value' : ''}`}>
              <label htmlFor="password">Password</label>
              <div className="pass-row">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  autoComplete="current-password"
                  spellCheck={false}
                  placeholder="••••••••••"
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPass(s => !s)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                  tabIndex={0}
                >
                  {showPass ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
              <div className="field-line" />
            </div>

            <div className="form-actions">
              <a href="#" className="forgot">Forgot password?</a>
            </div>

            <button type="submit" className="submit-btn">
              <span>Sign In</span>
              <span className="btn-arrow">→</span>
            </button>
          </form>

          <p className="signup-cta">
            No account? <a href="#">Create one free</a>
          </p>
        </div>

        {/* bottom bar */}
        <footer className="bottom-bar">
          <span>© 2025 Corp. All rights reserved.</span>
          <div className="bottom-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </footer>
      </main>
    </div>
  )
}

function IconEye() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

function IconEyeOff() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

export default App
