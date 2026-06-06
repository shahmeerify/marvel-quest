import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'

const PAGE = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 } }

function ToggleSwitch({ value, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-accent-red' : 'bg-white/20'}`}
    >
      <motion.div
        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow"
        animate={{ x: value ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  )
}

function SettingRow({ label, description, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-white/6 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-white">{label}</p>
        {description && <p className="text-xs text-muted mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

export default function Settings() {
  const { user, isGuest, signInWithGoogle, signInWithEmail, signOut, supabaseEnabled } = useAuth()
  const { settings, updateSettings, syncFromSupabase, syncing, progress, achievements, addToast } = useApp()
  const [emailInput, setEmailInput]     = useState('')
  const [emailSent, setEmailSent]       = useState(false)
  const [resetInput, setResetInput]     = useState('')
  const [showReset, setShowReset]       = useState(false)
  const [lastSync] = useState(() => new Date().toLocaleTimeString())
  const fileRef = useRef(null)

  const handleEmailSignIn = async () => {
    if (!emailInput.includes('@')) return
    await signInWithEmail(emailInput)
    setEmailSent(true)
  }

  const handleExport = () => {
    const data = { progress, achievements, settings, exportedAt: new Date().toISOString(), version: '1.0.0' }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'mcu-progress.json'; a.click()
    URL.revokeObjectURL(url)
    addToast({ type: 'success', message: '✓ Progress exported!' })
  }

  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (data.progress) {
          localStorage.setItem('mq_progress', JSON.stringify(data.progress))
        }
        if (data.settings) {
          localStorage.setItem('mq_settings', JSON.stringify(data.settings))
        }
        if (data.achievements) {
          localStorage.setItem('mq_achievements', JSON.stringify(data.achievements))
        }
        addToast({ type: 'success', message: '✓ Progress imported — refresh to apply' })
        setTimeout(() => window.location.reload(), 1500)
      } catch {
        addToast({ type: 'error', message: '✗ Invalid file — could not import' })
      }
    }
    reader.readAsText(file)
  }

  const handleReset = () => {
    if (resetInput !== 'RESET') return
    localStorage.removeItem('mq_progress')
    localStorage.removeItem('mq_settings')
    localStorage.removeItem('mq_achievements')
    localStorage.removeItem('mq_watch_history')
    localStorage.removeItem('mq_tmdb_cache')
    addToast({ type: 'success', message: '✓ All progress reset' })
    setTimeout(() => window.location.reload(), 1000)
  }

  return (
    <motion.div {...PAGE} transition={{ duration: 0.2 }} className="space-y-5 pb-24 lg:pb-8">
      <h1 className="font-heading text-3xl text-white tracking-wider">Settings</h1>

      {/* Account */}
      <section className="bg-bg-surface rounded-2xl border border-white/8 p-5">
        <h2 className="font-heading text-lg text-white tracking-wide mb-4">Account</h2>

        {isGuest ? (
          <div className="space-y-4">
            {supabaseEnabled ? (
              <>
                <p className="text-sm text-muted">Sign in to sync progress across all your devices.</p>
                <button onClick={signInWithGoogle} className="w-full flex items-center justify-center gap-2 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-semibold hover:bg-white/90 transition-colors">
                  <span>G</span> Continue with Google
                </button>
<div className="flex gap-2 mt-2">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 bg-bg-elevated border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent-red/50"
                  />
                  <button onClick={handleEmailSignIn} className="px-4 py-2 bg-accent-red text-white rounded-xl text-sm font-medium hover:bg-accent-darkred transition-colors">
                    {emailSent ? '✓ Sent!' : 'Send Link'}
                  </button>
                </div>
                {emailSent && <p className="text-xs text-success">Check your email for a magic sign-in link.</p>}
              </>
            ) : (
              <p className="text-sm text-muted">
                Add <code className="text-accent-red text-xs">VITE_SUPABASE_URL</code> and{' '}
                <code className="text-accent-red text-xs">VITE_SUPABASE_ANON_KEY</code> to enable cloud sync.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent-red/20 border border-accent-red/40 flex items-center justify-center font-bold text-accent-red">
                {(user?.email?.[0] ?? '?').toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-white text-sm">
                  {user?.user_metadata?.full_name ?? 'Signed In'}
                </p>
                <p className="text-xs text-muted">{user?.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => syncFromSupabase()}
                disabled={syncing}
                className="flex-1 py-2 bg-white/8 text-muted rounded-xl text-sm hover:bg-white/12 hover:text-white transition-colors"
              >
                {syncing ? 'Syncing…' : '↺ Sync Now'}
              </button>
              <button
                onClick={signOut}
                className="px-4 py-2 bg-accent-red/15 text-accent-red rounded-xl text-sm hover:bg-accent-red/25 transition-colors border border-accent-red/20"
              >
                Sign Out
              </button>
            </div>
            <p className="text-xs text-muted">Last synced: {lastSync}</p>
          </div>
        )}
      </section>

      {/* Preferences */}
      <section className="bg-bg-surface rounded-2xl border border-white/8 px-5 py-1">
        <h2 className="font-heading text-lg text-white tracking-wide py-4 border-b border-white/6">Preferences</h2>
        <SettingRow label="Dark Mode" description="Toggle dark/light theme">
          <ToggleSwitch
            value={settings.theme === 'dark'}
            onChange={(v) => updateSettings({ theme: v ? 'dark' : 'light' })}
          />
        </SettingRow>
        <SettingRow label="Show Countdown" description="Brand New Day timer on Home">
          <ToggleSwitch
            value={settings.showCountdown !== false}
            onChange={(v) => updateSettings({ showCountdown: v })}
          />
        </SettingRow>
        <SettingRow label="Active Path">
          <select
            value={settings.activePath ?? 'all'}
            onChange={(e) => updateSettings({ activePath: e.target.value })}
            className="bg-bg-elevated border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
          >
            <option value="spider">🕷️ Spider-Man</option>
            <option value="essential">⭐ Essential</option>
            <option value="all">🎬 All</option>
          </select>
        </SettingRow>
      </section>

      {/* Data */}
      <section className="bg-bg-surface rounded-2xl border border-white/8 px-5 py-1">
        <h2 className="font-heading text-lg text-white tracking-wide py-4 border-b border-white/6">Data</h2>
        <SettingRow label="Export Progress" description="Download as JSON">
          <button onClick={handleExport} className="px-3 py-1.5 bg-white/8 text-muted rounded-xl text-xs hover:bg-white/12 hover:text-white transition-colors">
            Export
          </button>
        </SettingRow>
        <SettingRow label="Import Progress" description="Merge from JSON file">
          <button onClick={() => fileRef.current?.click()} className="px-3 py-1.5 bg-white/8 text-muted rounded-xl text-xs hover:bg-white/12 hover:text-white transition-colors">
            Import
          </button>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
        </SettingRow>
        <SettingRow label="Reset All Progress" description="Wipe all watched data">
          {!showReset ? (
            <button onClick={() => setShowReset(true)} className="px-3 py-1.5 bg-accent-red/15 text-accent-red rounded-xl text-xs border border-accent-red/20 hover:bg-accent-red/25 transition-colors">
              Reset
            </button>
          ) : (
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={resetInput}
                onChange={(e) => setResetInput(e.target.value)}
                placeholder='Type "RESET"'
                className="w-24 bg-bg-elevated border border-accent-red/30 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
              />
              <button
                onClick={handleReset}
                disabled={resetInput !== 'RESET'}
                className="px-3 py-1 bg-accent-red text-white rounded-lg text-xs font-medium disabled:opacity-40 transition-opacity"
              >
                Confirm
              </button>
              <button onClick={() => { setShowReset(false); setResetInput('') }} className="text-muted hover:text-white text-xs">
                Cancel
              </button>
            </div>
          )}
        </SettingRow>
      </section>

      {/* About */}
      <section className="bg-bg-surface rounded-2xl border border-white/8 px-5 py-1">
        <h2 className="font-heading text-lg text-white tracking-wide py-4 border-b border-white/6">About</h2>
        <SettingRow label="Version">
          <span className="text-xs text-muted">1.0.0</span>
        </SettingRow>
        <SettingRow label="Data Source">
          <span className="text-xs text-muted">Digital Spy 2026</span>
        </SettingRow>
        <SettingRow label="Built With">
          <span className="text-xs text-muted">React · Supabase · Tailwind · Framer</span>
        </SettingRow>
      </section>
    </motion.div>
  )
}
