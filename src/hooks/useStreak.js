import { useCallback } from 'react'
import { useApp } from '../context/AppContext'

function toDateStr(date) {
  return new Date(date).toISOString().slice(0, 10)
}

function daysBetween(a, b) {
  const ms = Math.abs(new Date(b) - new Date(a))
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}

export function useStreak() {
  const { settings, updateSettings, addToast } = useApp()

  const recordWatch = useCallback(() => {
    const today = toDateStr(new Date())
    const last = settings.lastWatchedDate

    let { streakCount = 0, longestStreak = 0 } = settings

    if (last === today) return // already counted today

    const gap = last ? daysBetween(last, today) : null

    if (gap === 1) {
      // Consecutive day — extend streak
      streakCount += 1
    } else if (gap === null || gap > 1) {
      // First watch ever, or streak broken
      streakCount = 1
    }

    if (streakCount > longestStreak) longestStreak = streakCount

    updateSettings({ streakCount, longestStreak, lastWatchedDate: today })

    if (streakCount > 1) {
      addToast({ type: 'info', message: `🔥 ${streakCount}-day streak! Keep going!`, duration: 4000 })
    }
  }, [settings, updateSettings, addToast])

  return { recordWatch }
}
