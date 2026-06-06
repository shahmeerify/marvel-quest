import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { useWatchlist } from '../hooks/useWatchlist'
import { posterUrl } from '../lib/tmdb'
import Badge from './ui/Badge'
import StarRating from './ui/StarRating'

function PosterImage({ title }) {
  const [failed, setFailed] = useState(false)
  const src = title.posterPath ? posterUrl(title.posterPath, 'w92') : null

  if (!src || failed) {
    const initials = title.title.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
    const hue = title.title.charCodeAt(0) * 7 % 360
    return (
      <div
        className="w-12 h-[72px] rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0"
        style={{ background: `hsl(${hue},50%,25%)` }}
      >
        {initials}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className="w-12 h-[72px] object-cover rounded-lg shrink-0 bg-white/5"
    />
  )
}

export default function TitleCard({ title, onOpenDetail, batchMode, isBatchSelected, onBatchToggle }) {
  const { watchedSet, progress } = useApp()
  const { toggleWatched } = useWatchlist()
  const watched = watchedSet.has(title.id)
  const rating = progress[title.id]?.rating ?? 0

  // Long-press for batch mode
  const longPressTimer = useRef(null)
  const touchMoved = useRef(false)

  const handleTouchStart = () => {
    touchMoved.current = false
    longPressTimer.current = setTimeout(() => {
      if (!touchMoved.current) onBatchToggle?.()
    }, 500)
  }
  const handleTouchMove = () => { touchMoved.current = true }
  const handleTouchEnd = () => clearTimeout(longPressTimer.current)

  // Swipe-to-watch (horizontal swipe detection)
  const swipeStart = useRef(null)
  const [swiping, setSwiping] = useState(0)

  const onSwipeStart = useCallback((e) => {
    swipeStart.current = e.touches?.[0]?.clientX ?? null
  }, [])
  const onSwipeMove = useCallback((e) => {
    if (swipeStart.current === null) return
    const dx = (e.touches?.[0]?.clientX ?? 0) - swipeStart.current
    if (dx < 0) setSwiping(Math.max(dx, -72))
  }, [])
  const onSwipeEnd = useCallback(() => {
    if (swiping < -50) toggleWatched(title.id)
    setSwiping(0)
    swipeStart.current = null
  }, [swiping, title.id, toggleWatched])

  return (
    <motion.div
      layout
      style={{ x: swiping }}
      className="relative"
      onTouchStart={(e) => { handleTouchStart(); onSwipeStart(e) }}
      onTouchMove={(e) => { handleTouchMove(); onSwipeMove(e) }}
      onTouchEnd={() => { handleTouchEnd(); onSwipeEnd() }}
    >
      {/* Swipe reveal action */}
      {swiping < -20 && (
        <div className="absolute right-0 top-0 bottom-0 w-16 flex items-center justify-center bg-accent-red rounded-r-xl text-white text-sm font-medium">
          ✓
        </div>
      )}

      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer
                   ${watched ? 'bg-bg-surface/60' : 'bg-bg-surface'}
                   ${batchMode && isBatchSelected ? 'ring-2 ring-accent-red' : ''}
                   hover:bg-bg-elevated border border-white/5`}
        onClick={() => batchMode ? onBatchToggle?.() : onOpenDetail?.()}
      >
        {/* Batch checkbox */}
        {batchMode && (
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                          ${isBatchSelected ? 'bg-accent-red border-accent-red' : 'border-white/30'}`}>
            {isBatchSelected && <span className="text-white text-xs">✓</span>}
          </div>
        )}

        {/* Poster */}
        <PosterImage title={title} />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
            <span className="text-xs text-muted font-mono">#{title.number}</span>
            <Badge type={title.type} />
            {title.isEssential    && <Badge variant="essential" label="⭐ Essential" />}
            {title.isSpiderManPath && <Badge variant="spider"   label="🕷️ Spider" />}
          </div>
          <p className={`text-sm font-semibold leading-tight truncate ${watched ? 'text-muted line-through decoration-white/30' : 'text-white'}`}>
            {title.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted">{title.runtime}h</span>
            {title.streamingOn !== 'Unavailable' && (
              <span className="text-xs text-blue-400">{title.streamingOn}</span>
            )}
            {rating > 0 && <StarRating value={rating} readOnly size="sm" />}
          </div>
        </div>

        {/* Watch toggle */}
        {!batchMode && (
          <motion.button
            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                       ${watched ? 'bg-success border-success' : 'border-white/30 hover:border-white/60'}`}
            onClick={(e) => { e.stopPropagation(); toggleWatched(title.id) }}
            whileTap={{ scale: 0.85 }}
            aria-label={watched ? 'Mark as unwatched' : 'Mark as watched'}
          >
            <AnimatePresence mode="wait">
              {watched && (
                <motion.span
                  key="check"
                  className="text-white text-xs"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                  ✓
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}
