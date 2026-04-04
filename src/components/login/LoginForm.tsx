import { useState } from 'react'
import './LoginForm.css'

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

function IconArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  )
}

export default function LoginForm() {
  const [regNo, setRegNo]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [focused, setFocused]   = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => e.preventDefault()

  return (
    <div className="lf">
      {/* eyebrow */}
      <div className="lf-eyebrow">
        <span className="lf-eyebrow-dot" />
        Authentication required
      </div>

      {/* heading */}
      <h1 className="lf-title">
        Welcome<br />
        <em>back.</em>
      </h1>

      <p className="lf-desc">Sign in to access your account.</p>

      {/* divider */}
      <div className="lf-rule" />

      <form onSubmit={handleSubmit} noValidate className="lf-form">

        {/* registration number field */}
        <div className={`lf-field ${focused === 'regNo' ? 'lf-field--focused' : ''}`}>
          <label htmlFor="regNo" className="lf-label">Registration Number</label>
          <div className="lf-input-wrapper">
            <input
              id="regNo"
              type="text"
              inputMode="numeric"
              maxLength={8}
              pattern="\d{8}"
              className="lf-input"
              value={regNo}
              onChange={e => setRegNo(e.target.value.replace(/\D/g, '').slice(0, 8))}
              onFocus={() => setFocused('regNo')}
              onBlur={() => setFocused(null)}
              autoComplete="username"
              spellCheck={false}
              placeholder="8-digit number"
            />
            <span className="lf-char-count">{regNo.length}/8</span>
            <div className="lf-underline" />
          </div>
        </div>

        {/* password field */}
        <div className={`lf-field ${focused === 'password' ? 'lf-field--focused' : ''}`}>
          <div className="lf-label-row">
            <label htmlFor="password" className="lf-label">Password</label>
            <a href="#" className="lf-forgot">Forgot?</a>
          </div>
          <div className="lf-input-wrapper">
            <input
              id="password"
              type={showPass ? 'text' : 'password'}
              className="lf-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused(null)}
              autoComplete="current-password"
              spellCheck={false}
              placeholder="Enter your password"
            />
            <button
              type="button"
              className="lf-eye"
              onClick={() => setShowPass(s => !s)}
              aria-label={showPass ? 'Hide password' : 'Show password'}
            >
              {showPass ? <IconEyeOff /> : <IconEye />}
            </button>
            <div className="lf-underline" />
          </div>
        </div>

        {/* submit */}
        <button type="submit" className="lf-submit">
          <span>Sign In</span>
          <span className="lf-submit-icon"><IconArrow /></span>
        </button>

      </form>
    </div>
  )
}