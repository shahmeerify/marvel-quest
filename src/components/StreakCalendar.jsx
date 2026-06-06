import { useMemo } from 'react'
import { useApp } from '../context/AppContext'

export default function StreakCalendar() {
  const { progress } = useApp()

  // Build a set of dates that had at least one watch
  const watchedDates = useMemo(() => {
    const s = new Set()
    for (const p of Object.values(progress)) {
      if (p.watched && p.watchedAt) s.add(p.watchedAt.slice(0, 10))
    }
    return s
  }, [progress])

  // Last 30 days
  const days = useMemo(() => {
    const result = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const str = d.toISOString().slice(0, 10)
      result.push({ str, hasWatch: watchedDates.has(str), dayLabel: d.getDate() })
    }
    return result
  }, [watchedDates])

  return (
    <div className="bg-bg-surface rounded-2xl border border-white/8 p-5">
      <h3 className="font-heading text-lg text-white tracking-wide mb-3">📅 Last 30 Days</h3>
      <div className="grid grid-cols-10 gap-1">
        {days.map(({ str, hasWatch, dayLabel }) => (
          <div
            key={str}
            title={str}
            className={`aspect-square rounded-md transition-colors ${hasWatch ? 'bg-success' : 'bg-white/8'}`}
          />
        ))}
      </div>
      <div className="flex items-center justify-end gap-2 mt-2 text-xs text-muted">
        <div className="w-3 h-3 rounded-sm bg-white/8" /> No watch
        <div className="w-3 h-3 rounded-sm bg-success" /> Watched
      </div>
    </div>
  )
}
