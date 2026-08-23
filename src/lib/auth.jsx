import { createContext, useContext, useEffect, useState } from 'react'

/**
 * MOCK AUTHENTICATION -- placeholder only.
 *
 * This stores a "session" in localStorage on this browser. It does NOT
 * verify passwords against any server, does NOT hash or protect
 * credentials, and provides no real security. It exists so the app's UI
 * and flow (login screen -> gated app) are wired up and ready to swap
 * for a real provider (Supabase Auth, Firebase Auth, your own API, etc.)
 * later -- see README.md "Adding real authentication".
 */

const STORAGE_KEY = 'jewelcalc.mockSession.v1'
const AuthContext = createContext(null)

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => loadSession())

  useEffect(() => {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [session])

  const signIn = (email) => {
    setSession({ email, mode: 'account', signedInAt: new Date().toISOString() })
  }

  const continueAsGuest = () => {
    setSession({ email: null, mode: 'guest', signedInAt: new Date().toISOString() })
  }

  const signOut = () => setSession(null)

  return (
    <AuthContext.Provider value={{ session, signIn, continueAsGuest, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
