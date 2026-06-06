import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, supabaseEnabled } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabaseEnabled) { setLoading(false); return }

    // Load current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = useCallback(async () => {
    if (!supabaseEnabled) return
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }, [])

  const signInWithGithub = useCallback(async () => {
    if (!supabaseEnabled) return
    return supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }, [])

  const signInWithEmail = useCallback(async (email) => {
    if (!supabaseEnabled) return
    return supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
  }, [])

  const signOut = useCallback(async () => {
    if (!supabaseEnabled) return
    await supabase.auth.signOut()
  }, [])

  const value = {
    user,
    session,
    loading,
    isGuest: !user,
    supabaseEnabled,
    signInWithGoogle,
    signInWithGithub,
    signInWithEmail,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
