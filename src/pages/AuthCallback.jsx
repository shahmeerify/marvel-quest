import { useEffect } from 'react'
import { supabase, supabaseEnabled } from '../lib/supabase'

export default function AuthCallback() {
  useEffect(() => {
    async function finish() {
      if (!supabaseEnabled) { window.location.replace('/home'); return }
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          const name = session.user?.user_metadata?.full_name ?? session.user?.email ?? 'back'
          sessionStorage.setItem('mq_welcome', name)
        }
      } catch {}
      window.location.replace('/home')
    }
    finish()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-accent-red/20 border border-accent-red/30 flex items-center justify-center mx-auto animate-pulse">
          <span className="text-accent-red text-xl">M</span>
        </div>
        <p className="text-sm text-muted">Signing you in…</p>
      </div>
    </div>
  )
}
