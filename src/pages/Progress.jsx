import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { MCU_TITLES, PHASES } from '../data/mcu'
import ProgressRing from '../components/ui/ProgressRing'
import DonutChart from '../components/ui/DonutChart'
import PaceCalculator from '../components/PaceCalculator'
import StreakCalendar from '../components/StreakCalendar'

const PAGE = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 } }

const PHASE_COLORS = ['#E23636','#f59e0b','#22c55e','#3b82f6','#a855f7','#ec4899','#14b8a6']

function PhaseRow({ phase, watchedSet }) {
  const titles    = MCU_TITLES.filter((t) => t.phase === phase)
  const watched   = titles.filter((t) => watchedSet.has(t.id)).length
  const pct       = Math.round((watched / Math.max(titles.length, 1)) * 100)
  const hours     = titles.filter((t) => watchedSet.has(t.id)).reduce((s, t) => s + t.runtime, 0)
  const color     = PHASE_COLORS[phase % PHASE_COLORS.length]

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-white">
          {phase === 0 ? 'Legacy' : `Phase ${phase}`}
        </span>
        <span className="text-muted text-xs">{watched}/{titles.length} · {Math.round(hours)}h</span>
      </div>
      <div className="h-2 rounded-full bg-white/8 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: 0.1 }}
        />
      </div>
    </div>
  )
}

export default function Progress() {
  const { watchedSet, hoursWatched, avgRating, ratingsCount, settings, progress } = useApp()

  const total       = MCU_TITLES.length
  const watched     = watchedSet.size
  const pct         = Math.round((watched / total) * 100)
  const hoursTotal  = MCU_TITLES.reduce((s, t) => s + t.runtime, 0)
  const hoursLeft   = Math.round(hoursTotal - hoursWatched)

  // Donut chart segments
  const moviesWatched  = MCU_TITLES.filter((t) => t.type === 'movie'   && watchedSet.has(t.id)).length
  const seriesWatched  = MCU_TITLES.filter((t) => t.type === 'series'  && watchedSet.has(t.id)).length
  const specialsWatched= MCU_TITLES.filter((t) => (t.type === 'special' || t.type === 'short') && watchedSet.has(t.id)).length
  const remaining      = total - watched

  const donutSegments = [
    { label: 'Movies',   value: moviesWatched,   color: '#E23636' },
    { label: 'Series',   value: seriesWatched,   color: '#a855f7' },
    { label: 'Specials', value: specialsWatched, color: '#f59e0b' },
    { label: 'Remaining',value: remaining,        color: 'rgba(255,255,255,0.08)' },
  ]

  // Rating distribution
  const dist = [0, 0, 0, 0, 0]
  for (const p of Object.values(progress)) {
    if (p.rating >= 1 && p.rating <= 5) dist[p.rating - 1]++
  }
  const maxDist = Math.max(...dist, 1)

  return (
    <motion.div {...PAGE} transition={{ duration: 0.2 }} className="space-y-5 pb-24 lg:pb-8">
      <h1 className="font-heading text-3xl text-white tracking-wider">Progress & Stats</h1>

      {/* Overall ring */}
      <div className="bg-bg-surface rounded-2xl border border-white/8 p-6 flex flex-col items-center gap-4">
        <ProgressRing percent={pct} size={180} stroke={16}>
          <div className="text-center">
            <p className="font-heading text-5xl text-white">{pct}%</p>
            <p className="text-xs text-muted">{watched} of {total}</p>
          </div>
        </ProgressRing>
        <div className="grid grid-cols-2 gap-4 w-full text-center">
          <div>
            <p className="font-heading text-2xl text-success">{Math.round(hoursWatched)}h</p>
            <p className="text-xs text-muted">Hours watched</p>
          </div>
          <div>
            <p className="font-heading text-2xl text-muted">{hoursLeft}h</p>
            <p className="text-xs text-muted">Hours remaining</p>
          </div>
        </div>
      </div>

      {/* Content donut */}
      <div className="bg-bg-surface rounded-2xl border border-white/8 p-5">
        <h2 className="font-heading text-xl text-white tracking-wide mb-4">Content Breakdown</h2>
        <DonutChart segments={donutSegments} size={160} />
      </div>

      {/* Phase breakdown */}
      <div className="bg-bg-surface rounded-2xl border border-white/8 p-5 space-y-4">
        <h2 className="font-heading text-xl text-white tracking-wide">Phase Breakdown</h2>
        {PHASES.map((phase) => (
          <PhaseRow key={phase} phase={phase} watchedSet={watchedSet} />
        ))}
      </div>

      {/* Pace calculator */}
      <PaceCalculator />

      {/* Streak */}
      <div className="bg-bg-surface rounded-2xl border border-white/8 p-5">
        <h2 className="font-heading text-xl text-white tracking-wide mb-3">🔥 Watch Streak</h2>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-bg-elevated rounded-xl p-3 text-center">
            <p className="font-heading text-3xl text-accent-red">{settings.streakCount ?? 0}</p>
            <p className="text-xs text-muted">Current streak</p>
          </div>
          <div className="bg-bg-elevated rounded-xl p-3 text-center">
            <p className="font-heading text-3xl text-white">{settings.longestStreak ?? 0}</p>
            <p className="text-xs text-muted">Longest streak</p>
          </div>
        </div>
      </div>

      <StreakCalendar />

      {/* Ratings */}
      {ratingsCount > 0 && (
        <div className="bg-bg-surface rounded-2xl border border-white/8 p-5">
          <h2 className="font-heading text-xl text-white tracking-wide mb-1">⭐ Your Ratings</h2>
          <p className="text-sm text-muted mb-4">Average: {avgRating ?? '—'} · {ratingsCount} rated</p>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-muted w-4">{star}★</span>
                <div className="flex-1 h-2 rounded-full bg-white/8 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-accent-gold transition-all"
                    style={{ width: `${(dist[star - 1] / maxDist) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted w-4 text-right">{dist[star - 1]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
