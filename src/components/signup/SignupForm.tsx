import { useState } from 'react'
import './SignupForm.css'
import { useAuth } from '../../context/AuthContext'
import { apiSignup } from '../../lib/auth'

function IconEye() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

function IconEyeOff() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
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

interface Props { onLogin: () => void }

export default function SignupForm({ onLogin }: Props) {
  const { login } = useAuth()

  const [form, setForm] = useState({
    name: '', email: '', regNo: '', password: '', confirm: ''
  })
  const [showPass, setShowPass]         = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [focused, setFocused]           = useState<string | null>(null)
  const [error, setError]               = useState<string | null>(null)
  const [submitting, setSubmitting]     = useState(false)

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = key === 'regNo'
      ? e.target.value.replace(/\D/g, '').slice(0, 8)
      : e.target.value
    setForm(f => ({ ...f, [key]: val }))
  }

  const passwordMatch    = form.confirm.length > 0 && form.password === form.confirm
  const passwordMismatch = form.confirm.length > 0 && form.password !== form.confirm

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setError(null)

    // client-side guards
    if (form.regNo.length !== 8)       return setError('Registration number must be exactly 8 digits.')
    if (form.password.length < 6)      return setError('Password must be at least 6 characters.')
    if (form.password !== form.confirm) return setError("Passwords don't match.")

    setSubmitting(true)
    try {
      const res = await apiSignup({
        name: form.name,
        email: form.email,
        registrationNumber: form.regNo,
        password: form.password,
      })
      // auto-login after successful signup
      login(res.token, res.user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed')
    } finally {
      setSubmitting(false)
    }
  }

  const field = (id: string, label: string, node: React.ReactNode) => (
    <div className={`sf-field ${focused === id ? 'sf-field--focused' : ''}`}>
      <label htmlFor={id} className="sf-label">{label}</label>
      {node}
    </div>
  )

  return (
    <div className="sf">
      <div className="sf-eyebrow">
        <span className="sf-eyebrow-dot" />
        Create your account
      </div>

      <h1 className="sf-title">
        Join<br />
        <em>today.</em>
      </h1>

      <p className="sf-desc">Fill in your details to get started.</p>

      <div className="sf-rule" />

      <form onSubmit={handleSubmit} noValidate className="sf-form">

        {/* name + email */}
        <div className="sf-row">
          {field('sf-name', 'Full Name',
            <div className="sf-input-wrapper">
              <input id="sf-name" type="text" className="sf-input"
                value={form.name} onChange={set('name')}
                onFocus={() => setFocused('sf-name')} onBlur={() => setFocused(null)}
                autoComplete="name" placeholder="John Doe" spellCheck={false}
                disabled={submitting} required />
              <div className="sf-underline" />
            </div>
          )}
          {field('sf-email', 'Email Address',
            <div className="sf-input-wrapper">
              <input id="sf-email" type="email" className="sf-input"
                value={form.email} onChange={set('email')}
                onFocus={() => setFocused('sf-email')} onBlur={() => setFocused(null)}
                autoComplete="email" placeholder="you@example.com" spellCheck={false}
                disabled={submitting} required />
              <div className="sf-underline" />
            </div>
          )}
        </div>

        {/* registration number */}
        {field('sf-regNo', 'Registration Number',
          <div className="sf-input-wrapper">
            <input id="sf-regNo" type="text" inputMode="numeric"
              maxLength={8} pattern="\d{8}" className="sf-input"
              value={form.regNo} onChange={set('regNo')}
              onFocus={() => setFocused('sf-regNo')} onBlur={() => setFocused(null)}
              autoComplete="off" placeholder="8-digit number" spellCheck={false}
              disabled={submitting} required />
            <span className={`sf-count ${form.regNo.length === 8 ? 'sf-count--done' : ''}`}>
              {form.regNo.length}/8
            </span>
            <div className="sf-underline" />
          </div>
        )}

        {/* password + confirm */}
        <div className="sf-row">
          {field('sf-password', 'Password',
            <div className="sf-input-wrapper">
              <input id="sf-password" type={showPass ? 'text' : 'password'} className="sf-input"
                value={form.password} onChange={set('password')}
                onFocus={() => setFocused('sf-password')} onBlur={() => setFocused(null)}
                autoComplete="new-password" placeholder="Min. 6 characters" spellCheck={false}
                disabled={submitting} required />
              <button type="button" className="sf-eye"
                onClick={() => setShowPass(s => !s)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
                disabled={submitting}>
                {showPass ? <IconEyeOff /> : <IconEye />}
              </button>
              <div className="sf-underline" />
            </div>
          )}
          <div className={[
            'sf-field',
            focused === 'sf-confirm' ? 'sf-field--focused' : '',
            passwordMismatch ? 'sf-field--error' : '',
            passwordMatch    ? 'sf-field--ok'    : '',
          ].filter(Boolean).join(' ')}>
            <label htmlFor="sf-confirm" className="sf-label">Confirm Password</label>
            <div className="sf-input-wrapper">
              <input id="sf-confirm" type={showConfirm ? 'text' : 'password'} className="sf-input"
                value={form.confirm} onChange={set('confirm')}
                onFocus={() => setFocused('sf-confirm')} onBlur={() => setFocused(null)}
                autoComplete="new-password" placeholder="Repeat password" spellCheck={false}
                disabled={submitting} required />
              <button type="button" className="sf-eye"
                onClick={() => setShowConfirm(s => !s)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                disabled={submitting}>
                {showConfirm ? <IconEyeOff /> : <IconEye />}
              </button>
              <div className="sf-underline" />
            </div>
            {passwordMismatch && <span className="sf-error-msg">Passwords don't match</span>}
            {passwordMatch    && <span className="sf-ok-msg">Looks good</span>}
          </div>
        </div>

        {/* api error */}
        {error && <p className="sf-error" role="alert">{error}</p>}

        <button type="submit" className="sf-submit" disabled={submitting}>
          <span>{submitting ? 'Creating account…' : 'Create Account'}</span>
          {!submitting && <span className="sf-submit-icon"><IconArrow /></span>}
          {submitting  && <span className="sf-spinner" aria-hidden="true" />}
        </button>

      </form>

      <p className="sf-switch">
        Already have an account?{' '}
        <button className="sf-switch-btn" onClick={onLogin} disabled={submitting}>Sign in</button>
      </p>
    </div>
  )
}
