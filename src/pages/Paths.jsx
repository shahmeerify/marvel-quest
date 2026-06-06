import { useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { MCU_TITLES } from '../data/mcu'
import PathTrail from '../components/PathTrail'
import TitleDetail from '../components/TitleDetail'
import BottomSheet from '../components/ui/BottomSheet'
import ProgressRing from '../components/ui/ProgressRing'

const PAGE = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 } }

const PATHS = [
  {
    key: 'spider',
    icon: '🕷️',
    label: 'Spider-Man Path',
    desc: 'Minimum viable for Brand New Day',
    color: '#E23636',
  },
  {
    key: 'essential',
    icon: '⭐',
    label: 'Essential MCU',
    desc: 'Full Avengers storyline',
    color: '#f5c518',
  },
  {
    key: 'all',
    icon: '🎬',
    label: 'Full Completionist',
    desc: 'Every single MCU title',
    color: '#22c55e',
  },
]

function PathCard({ path, watchedSet, isActive, onSetActive, onView }) {
  const titles = path.key === 'spider'
    ? MCU_TITLES.filter((t) => t.isSpiderManPath)
    : path.key === 'essential'
    ? MCU_TITLES.filter((t) => t.isEssential)
    : MCU_TITLES

  const watched = titles.filter((t) => watchedSet.has(t.id)).length
  const hours   = titles.reduce((s, t) => s + t.runtime, 0)
  const pct     = Math.round((watched / Math.max(titles.length, 1)) * 100)

  return (
    <motion.div
      layout
      className={`bg-bg-surface rounded-2xl border p-5 transition-all ${isActive ? 'border-accent-gold/50 shadow-lg shadow-accent-gold/5' : 'border-white/8'}`}
    >
      <div className="flex items-start gap-4">
        <ProgressRing percent={pct} size={60} stroke={6} color={path.color}>
          <span className="text-lg">{path.icon}</span>
        </ProgressRing>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-heading text-lg text-white tracking-wide">{path.label}</h3>
            {isActive && (
              <span className="text-[10px] font-bold text-accent-gold border border-accent-gold/30 bg-accent-gold/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                Active
              </span>
            )}
          </div>
          <p className="text-xs text-muted mt-0.5">{path.desc}</p>
          <p className="text-xs text-white mt-1 font-medium">
            {titles.length} titles · ~{Math.round(hours)}h · {pct}% complete
          </p>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => onSetActive(path.key)}
          disabled={isActive}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors
            ${isActive ? 'bg-accent-gold/15 text-accent-gold border border-accent-gold/30' : 'bg-white/8 text-muted hover:bg-white/12 hover:text-white'}`}
        >
          {isActive ? '✓ Active Path' : 'Set Active'}
        </button>
        <button
          onClick={() => onView(path.key)}
          className="px-4 py-2 bg-accent-red/15 text-accent-red rounded-xl text-sm font-medium hover:bg-accent-red/25 transition-colors border border-accent-red/20"
        >
          View Trail
        </button>
      </div>
    </motion.div>
  )
}

export default function Paths() {
  const { watchedSet, settings, updateSettings } = useApp()
  const [viewingPath, setViewingPath] = useState(null)
  const [selectedTitle, setSelectedTitle] = useState(null)

  const activePath = settings.activePath ?? 'all'

  const setActive = (key) => updateSettings({ activePath: key })

  return (
    <motion.div {...PAGE} transition={{ duration: 0.2 }} className="space-y-5 pb-24 lg:pb-8">
      <h1 className="font-heading text-3xl text-white tracking-wider">Watch Paths</h1>
      <p className="text-sm text-muted -mt-2">Choose a path to set your "Continue Watching" focus.</p>

      {PATHS.map((path) => (
        <PathCard
          key={path.key}
          path={path}
          watchedSet={watchedSet}
          isActive={activePath === path.key}
          onSetActive={setActive}
          onView={setViewingPath}
        />
      ))}

      {/* Trail view */}
      {viewingPath && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl text-white tracking-wide">
              {PATHS.find((p) => p.key === viewingPath)?.label} Trail
            </h2>
            <button
              onClick={() => setViewingPath(null)}
              className="text-xs text-muted hover:text-white px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              Hide ✕
            </button>
          </div>
          <PathTrail pathKey={viewingPath} onOpenTitle={setSelectedTitle} />
        </div>
      )}

      {/* Title detail */}
      <BottomSheet open={Boolean(selectedTitle)} onClose={() => setSelectedTitle(null)}>
        {selectedTitle && (
          <TitleDetail
            title={selectedTitle}
            onClose={() => setSelectedTitle(null)}
            onOpenOther={(t) => setSelectedTitle(t)}
          />
        )}
      </BottomSheet>
    </motion.div>
  )
}
