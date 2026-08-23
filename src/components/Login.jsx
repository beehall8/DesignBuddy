import { useState } from 'react'
import { useAuth } from '../lib/auth.jsx'

export default function Login() {
  const { signIn, continueAsGuest } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email.trim()) return
    signIn(email.trim())
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-gem" aria-hidden="true">◆</span>
          <h1>JewelCalc</h1>
        </div>
        <p className="auth-subtitle">Metal weight &amp; cost calculator for jewelry design</p>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === 'signin' ? 'active' : ''}
            onClick={() => setMode('signin')}
          >
            Sign in
          </button>
          <button
            type="button"
            className={mode === 'signup' ? 'active' : ''}
            onClick={() => setMode('signup')}
          >
            Create account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@studio.com"
              autoComplete="email"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />
          </label>
          <button type="submit" className="btn-primary">
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <button type="button" className="btn-secondary" onClick={continueAsGuest}>
          Continue as guest
        </button>

        <p className="auth-note">
          This is a placeholder login for the app preview — no account is actually created and
          nothing is sent to a server. Swap in real authentication before going live (see
          README.md).
        </p>
      </div>
    </div>
  )
}
