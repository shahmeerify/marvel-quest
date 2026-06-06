import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, supabaseEnabled } from '../lib/supabase'
import { useApp } from '../context/AppContext'

export default function AuthCallback() {
  const navigate = useNavigate()
  const { addToast } = useApp()

  useEffect(() => {
    if (!supabaseEnabled) { navigate('/home'); return }

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        addToast({ type: 'error', message: '✗ Sign-in failed. Please try again.' })
        navigate('/home')
        return
      }
      if (session) {
        const name = session.user?.user_metadata?.full_name ?? session.user?.email ?? 'back'
        addToast({ type: 'success', message: `✓ Welcome back, ${name}!` })
      }
      navigate('/home')
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
