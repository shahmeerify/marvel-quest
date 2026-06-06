import { useState, useEffect } from 'react'

const TARGET = new Date('2026-07-31T00:00:00')

function pad(n) { return String(n).padStart(2, '0') }

function getTimeLeft() {
  const now  = Date.now()
  const diff = TARGET.getTime() - now
  if (diff <= 0) return null
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return { d, h, m, s }
}

export default function CountdownTimer({ compact = false }) {
  const [time, setTime] = useState(getTimeLeft)

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [])

  if (!time) return (
    <div className="text-center font-heading text-2xl text-accent-gold">
      🕷️ Spider-Man: Brand New Day is HERE!
    </div>
  )

  if (compact) {
    return (
      <div className="flex items-center gap-1 font-mono text-sm text-accent-red font-semibold">
        <span>{time.d}d</span>
        <span className="text-muted">:</span>
        <span>{pad(time.h)}h</span>
        <span className="text-muted">:</span>
        <span>{pad(time.m)}m</span>
        <span className="text-muted">:</span>
        <span>{pad(time.s)}s</span>
      </div>
    )
  }

  const units = [
    { label: 'Days',    value: time.d },
    { label: 'Hours',   value: pad(time.h) },
    { label: 'Minutes', value: pad(time.m) },
    { label: 'Seconds', value: pad(time.s) },
  ]

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      {units.map((u, i) => (
        <div key={u.label} className="flex items-center gap-2 sm:gap-4">
          <div className="text-center">
            <div className="font-heading text-3xl sm:text-5xl text-white tabular-nums leading-none">
              {u.value}
            </div>
            <div className="text-[10px] sm:text-xs text-muted uppercase tracking-widest mt-1">{u.label}</div>
          </div>
          {i < units.length - 1 && (
            <span className="font-heading text-2xl sm:text-4xl text-accent-red/60 mb-3">:</span>
          )}
        </div>
      ))}
    </div>
  )
}
