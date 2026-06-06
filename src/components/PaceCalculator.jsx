import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { MCU_TITLES } from '../data/mcu'

export default function PaceCalculator() {
  const { watchedSet, settings, updateSettings } = useApp()
  const [targetDate, setTargetDate] = useState(settings.paceTargetDate ?? '2026-07-25')

  const unwatched = MCU_TITLES.filter((t) => !watchedSet.has(t.id))
  const hoursLeft = unwatched.reduce((s, t) => s + t.runtime, 0)
  const daysLeft  = Math.max(
    1,
    Math.ceil((new Date(targetDate) - Date.now()) / 86400000)
  )

  const titlesPerDay = (unwatched.length / daysLeft).toFixed(1)
  const hoursPerDay  = (hoursLeft / daysLeft).toFixed(1)

  const finished   = unwatched.length === 0
  const onTrack    = parseFloat(hoursPerDay) <= 2.5

  const handleChange = (e) => {
    setTargetDate(e.target.value)
    updateSettings({ paceTargetDate: e.target.value })
  }

  return (
    <div className="bg-bg-surface rounded-2xl border border-white/8 p-5 space-y-4">
      <h3 className="font-heading text-lg text-white tracking-wide">🎯 Pace Calculator</h3>

      <div>
        <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Target finish date</label>
        <input
          type="date"
          value={targetDate}
          onChange={handleChange}
          min={new Date().toISOString().slice(0, 10)}
          max="2026-07-31"
          className="w-full bg-bg-elevated border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-red/50 transition-colors"
        />
      </div>

      {finished ? (
        <div className="text-center p-4 bg-success/10 rounded-xl border border-success/20">
          <p className="text-2xl mb-1">🕷️</p>
          <p className="font-heading text-xl text-success">You're Ready!</p>
          <p className="text-sm text-muted">All titles watched. See you July 31!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-bg-elevated rounded-xl p-3 text-center">
              <p className="font-heading text-2xl text-white">{titlesPerDay}</p>
              <p className="text-xs text-muted">Titles / day</p>
            </div>
            <div className="bg-bg-elevated rounded-xl p-3 text-center">
              <p className="font-heading text-2xl text-white">{hoursPerDay}h</p>
              <p className="text-xs text-muted">Hours / day</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 p-3 rounded-xl text-sm
            ${onTrack ? 'bg-success/10 border border-success/20 text-success' : 'bg-warning/10 border border-warning/20 text-warning'}`}>
            <span>{onTrack ? '🎉' : '⚡'}</span>
            <span>
              {onTrack
                ? `You're on track! ${daysLeft} days to go.`
                : `${unwatched.length} titles left in ${daysLeft} days — pick up the pace!`}
            </span>
          </div>
        </>
      )}
    </div>
  )
}
