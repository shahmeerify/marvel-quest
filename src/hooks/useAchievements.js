import { useCallback } from 'react'
import { useApp } from '../context/AppContext'
import { ACHIEVEMENTS } from '../data/achievements'
import { MCU_TITLES } from '../data/mcu'

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function isWeekend(date) {
  const d = new Date(date).getDay()
  return d === 0 || d === 6
}

function getWeekendKey(date) {
  const d = new Date(date)
  const day = d.getDay()
  // Normalize to Saturday
  const sat = new Date(d)
  sat.setDate(d.getDate() - (day === 0 ? 1 : day - 6))
  return sat.toISOString().slice(0, 10)
}

export function useAchievements() {
  const { progress, achievements, watchedSet, settings, unlockAchievement, addToast } = useApp()

  const triggerUnlock = useCallback((achievement) => {
    unlockAchievement(achievement.id)
    addToast({
      type: 'achievement',
      message: `🏆 Achievement Unlocked: ${achievement.name}!`,
      duration: 5000,
    })
  }, [unlockAchievement, addToast])

  const checkAll = useCallback(() => {
    const watchedTitles = MCU_TITLES.filter((t) => watchedSet.has(t.id))
    const watchedCount  = watchedTitles.length

    // Group watched_at timestamps by calendar day
    const byDay = {}
    for (const [id, p] of Object.entries(progress)) {
      if (!p.watched || !p.watchedAt) continue
      const d = new Date(p.watchedAt).toISOString().slice(0, 10)
      byDay[d] = (byDay[d] ?? 0) + 1
    }

    // Weekend buckets
    const byWeekend = {}
    for (const [id, p] of Object.entries(progress)) {
      if (!p.watched || !p.watchedAt) continue
      const d = new Date(p.watchedAt)
      if (isWeekend(d)) {
        const wk = getWeekendKey(d)
        byWeekend[wk] = (byWeekend[wk] ?? 0) + 1
      }
    }

    const maxDailyCount   = Math.max(0, ...Object.values(byDay))
    const maxWeekendCount = Math.max(0, ...Object.values(byWeekend))

    const ratingsCount = Object.values(progress).filter((p) => p.rating).length

    for (const ach of ACHIEVEMENTS) {
      if (achievements[ach.id]) continue // already unlocked

      let unlocked = false

      switch (ach.type) {
        case 'watched_count':
          unlocked = watchedCount >= ach.value
          break

        case 'phase_complete': {
          const phase = ach.value
          const all = MCU_TITLES.filter((t) => t.phase === phase)
          unlocked = all.length > 0 && all.every((t) => watchedSet.has(t.id))
          break
        }

        case 'phases_complete': {
          unlocked = ach.value.every((phase) => {
            const all = MCU_TITLES.filter((t) => t.phase === phase)
            return all.length > 0 && all.every((t) => watchedSet.has(t.id))
          })
          break
        }

        case 'path_complete': {
          if (ach.value === 'all') {
            unlocked = MCU_TITLES.every((t) => watchedSet.has(t.id))
          } else if (ach.value === 'spider') {
            unlocked = MCU_TITLES.filter((t) => t.isSpiderManPath).every((t) => watchedSet.has(t.id))
          } else if (ach.value === 'essential') {
            unlocked = MCU_TITLES.filter((t) => t.isEssential).every((t) => watchedSet.has(t.id))
          }
          break
        }

        case 'spider_path_before_date': {
          const spiderDone = MCU_TITLES.filter((t) => t.isSpiderManPath).every((t) => watchedSet.has(t.id))
          unlocked = spiderDone && new Date() < new Date(ach.value)
          break
        }

        case 'all_watched':
          unlocked = ach.value.every((id) => watchedSet.has(id))
          break

        case 'daily_count':
          unlocked = maxDailyCount >= ach.value
          break

        case 'hour_range': {
          unlocked = Object.keys(progress).some((id) => {
            const p = progress[id]
            if (!p.watched || !p.watchedAt) return false
            const h = new Date(p.watchedAt).getHours()
            return h >= ach.value.min && h <= ach.value.max
          })
          break
        }

        case 'weekend_count':
          unlocked = maxWeekendCount >= ach.value
          break

        case 'phase_no_gaps': {
          // Check if any full phase has been watched with no gaps (all titles watched)
          const phases = [...new Set(MCU_TITLES.map((t) => t.phase))]
          unlocked = phases.some((phase) => {
            const all = MCU_TITLES.filter((t) => t.phase === phase)
            return all.length >= 3 && all.every((t) => watchedSet.has(t.id))
          })
          break
        }

        case 'streak':
          unlocked = (settings.streakCount ?? 0) >= ach.value
          break

        case 'ratings_count':
          unlocked = ratingsCount >= ach.value
          break
      }

      if (unlocked) triggerUnlock(ach)
    }
  }, [progress, achievements, watchedSet, settings, triggerUnlock])

  return { checkAll }
}
