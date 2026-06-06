import { createContext, useContext, useEffect, useReducer, useCallback, useRef } from 'react'
import { MCU_TITLES } from '../data/mcu'
import { supabase, supabaseEnabled } from '../lib/supabase'
import { useAuth } from './AuthContext'

// ── localStorage keys ────────────────────────────────────────────────────────
const LS_PROGRESS = 'mq_progress'   // { [titleId]: { watched, rating, note, watchedAt, updatedAt } }
const LS_SETTINGS = 'mq_settings'   // { activePath, theme, streak, lastWatchedDate, ... }
const LS_ACHIEVEMENTS = 'mq_achievements' // { [achievementId]: unlockedAt }
const LS_WATCH_HISTORY = 'mq_watch_history' // [{ titleId, date }]

// ── Helpers ──────────────────────────────────────────────────────────────────
const readLS = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}
const writeLS = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}

function initialProgress() { return readLS(LS_PROGRESS, {}) }
function initialSettings() {
  return {
    activePath: 'all',
    theme: 'dark',
    streakCount: 0,
    longestStreak: 0,
    lastWatchedDate: null,
    onboardingComplete: false,
    showCountdown: true,
    paceTargetDate: '2026-07-25',
    ...readLS(LS_SETTINGS, {}),
  }
}

// ── Reducer ──────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'SET_PROGRESS':
      return { ...state, progress: action.payload }
    case 'UPDATE_TITLE': {
      const progress = { ...state.progress, [action.id]: { ...state.progress[action.id], ...action.data } }
      writeLS(LS_PROGRESS, progress)
      return { ...state, progress }
    }
    case 'SET_SETTINGS': {
      const settings = { ...state.settings, ...action.payload }
      writeLS(LS_SETTINGS, settings)
      return { ...state, settings }
    }
    case 'UNLOCK_ACHIEVEMENT': {
      const achievements = { ...state.achievements, [action.id]: action.unlockedAt }
      writeLS(LS_ACHIEVEMENTS, achievements)
      return { ...state, achievements }
    }
    case 'SET_ACHIEVEMENTS':
      return { ...state, achievements: action.payload }
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts.slice(-2), action.toast] }
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) }
    case 'SET_SYNCING':
      return { ...state, syncing: action.payload }
    case 'SET_ONLINE':
      return { ...state, online: action.payload }
    default:
      return state
  }
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const { user, isGuest } = useAuth()
  const [state, dispatch] = useReducer(reducer, null, () => ({
    progress:     initialProgress(),
    settings:     initialSettings(),
    achievements: readLS(LS_ACHIEVEMENTS, {}),
    toasts:       [],
    syncing:      false,
    online:       navigator.onLine,
  }))

  const syncQueued = useRef(false)

  // ── Online/Offline detection ─────────────────────────────────────────────
  useEffect(() => {
    const on  = () => { dispatch({ type: 'SET_ONLINE', payload: true  }); flushSync() }
    const off = () => dispatch({ type: 'SET_ONLINE', payload: false })
    window.addEventListener('online',  on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync from Supabase on sign-in ────────────────────────────────────────
  useEffect(() => {
    if (user && supabaseEnabled) syncFromSupabase()
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Theme application ────────────────────────────────────────────────────
  useEffect(() => {
    const root = document.documentElement
    if (state.settings.theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
  }, [state.settings.theme])

  // ── Supabase sync ────────────────────────────────────────────────────────
  async function syncFromSupabase() {
    if (!supabaseEnabled || !user) return
    dispatch({ type: 'SET_SYNCING', payload: true })
    try {
      const [{ data: prog }, { data: ach }, { data: settings }] = await Promise.all([
        supabase.from('progress').select('*').eq('user_id', user.id),
        supabase.from('achievements_unlocked').select('*').eq('user_id', user.id),
        supabase.from('user_settings').select('*').eq('user_id', user.id).maybeSingle(),
      ])

      // Merge progress: Supabase wins on conflict by updated_at
      const local = readLS(LS_PROGRESS, {})
      const merged = { ...local }
      for (const row of prog ?? []) {
        const loc = local[row.title_id]
        if (!loc || new Date(row.updated_at) >= new Date(loc.updatedAt ?? 0)) {
          merged[row.title_id] = {
            watched:   row.watched,
            rating:    row.rating,
            note:      row.note,
            watchedAt: row.watched_at,
            updatedAt: row.updated_at,
          }
        }
      }
      writeLS(LS_PROGRESS, merged)
      dispatch({ type: 'SET_PROGRESS', payload: merged })

      // Merge achievements
      const achMap = {}
      for (const row of ach ?? []) achMap[row.achievement_id] = row.unlocked_at
      writeLS(LS_ACHIEVEMENTS, achMap)
      dispatch({ type: 'SET_ACHIEVEMENTS', payload: achMap })

      // Apply remote settings if available
      if (settings) {
        dispatch({ type: 'SET_SETTINGS', payload: {
          activePath:       settings.active_path,
          streakCount:      settings.streak_count,
          longestStreak:    settings.longest_streak,
          lastWatchedDate:  settings.last_watched_date,
          onboardingComplete: settings.onboarding_complete,
          showCountdown:    settings.show_countdown,
          paceTargetDate:   settings.pace_target_date,
        }})
      }
    } catch (err) {
      console.error('Sync error:', err)
    } finally {
      dispatch({ type: 'SET_SYNCING', payload: false })
    }
  }

  async function flushSync() {
    // Re-push any progress that may have been written offline
    if (syncQueued.current && user && supabaseEnabled) {
      syncQueued.current = false
      await syncFromSupabase()
    }
  }

  // ── Public API ────────────────────────────────────────────────────────────

  const updateTitle = useCallback(async (titleId, data) => {
    const now = new Date().toISOString()
    const payload = { ...data, updatedAt: now }
    dispatch({ type: 'UPDATE_TITLE', id: titleId, data: payload })

    if (supabaseEnabled && user) {
      if (!state.online) { syncQueued.current = true; return }
      try {
        await supabase.from('progress').upsert({
          user_id:   user.id,
          title_id:  titleId,
          watched:   payload.watched ?? state.progress[titleId]?.watched ?? false,
          rating:    payload.rating  ?? state.progress[titleId]?.rating  ?? null,
          note:      payload.note    ?? state.progress[titleId]?.note    ?? null,
          watched_at: payload.watchedAt ?? now,
          updated_at: now,
        }, { onConflict: 'user_id,title_id' })
      } catch {
        syncQueued.current = true
      }
    }
  }, [user, state.online, state.progress])

  const unlockAchievement = useCallback(async (achievementId) => {
    if (state.achievements[achievementId]) return // already unlocked
    const now = new Date().toISOString()
    dispatch({ type: 'UNLOCK_ACHIEVEMENT', id: achievementId, unlockedAt: now })
    if (supabaseEnabled && user) {
      try {
        await supabase.from('achievements_unlocked').upsert({
          user_id: user.id, achievement_id: achievementId, unlocked_at: now,
        }, { onConflict: 'user_id,achievement_id' })
      } catch {}
    }
  }, [user, state.achievements])

  const updateSettings = useCallback(async (patch) => {
    dispatch({ type: 'SET_SETTINGS', payload: patch })
    if (supabaseEnabled && user) {
      try {
        await supabase.from('user_settings').upsert({
          user_id:             user.id,
          active_path:         patch.activePath,
          theme:               patch.theme,
          streak_count:        patch.streakCount,
          longest_streak:      patch.longestStreak,
          last_watched_date:   patch.lastWatchedDate,
          onboarding_complete: patch.onboardingComplete,
          show_countdown:      patch.showCountdown,
          pace_target_date:    patch.paceTargetDate,
          updated_at:          new Date().toISOString(),
        }, { onConflict: 'user_id' })
      } catch {}
    }
  }, [user])

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random()
    dispatch({ type: 'ADD_TOAST', toast: { id, ...toast } })
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', id }), toast.duration ?? 3500)
    return id
  }, [])

  const removeToast = useCallback((id) => {
    dispatch({ type: 'REMOVE_TOAST', id })
  }, [])

  // Derived stats
  const watchedIds = Object.entries(state.progress)
    .filter(([, v]) => v.watched)
    .map(([k]) => k)

  const watchedSet = new Set(watchedIds)

  const hoursWatched = MCU_TITLES
    .filter((t) => watchedSet.has(t.id))
    .reduce((sum, t) => sum + t.runtime, 0)

  const ratings = Object.entries(state.progress)
    .filter(([, v]) => v.rating)
    .map(([, v]) => v.rating)

  const avgRating = ratings.length
    ? Math.round((ratings.reduce((s, r) => s + r, 0) / ratings.length) * 10) / 10
    : null

  const value = {
    ...state,
    watchedSet,
    watchedIds,
    hoursWatched,
    avgRating,
    ratingsCount: ratings.length,
    // actions
    updateTitle,
    unlockAchievement,
    updateSettings,
    addToast,
    removeToast,
    syncFromSupabase,
    isGuest,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
