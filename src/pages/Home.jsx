import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useWatchlist } from '../hooks/useWatchlist'
import { MCU_TITLES, TOTAL } from '../data/mcu'
import { getDailyTrivia } from '../data/trivia'
import { posterUrl } from '../lib/tmdb'
import CountdownTimer from '../components/CountdownTimer'
import ProgressRing from '../components/ui/ProgressRing'
import BottomSheet from '../components/ui/BottomSheet'
import TitleDetail from '../components/TitleDetail'

const PAGE = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 } }

const PATH_LABELS = { spider: '🕷️ Spider-Man Path', essential: '⭐ Essential MCU', all: '🎬 Full Completionist' }

function StatCard({ icon, value, label }) {
  return (
    <div className="bg-bg-surface rounded-2xl border border-white/8 p-4 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="font-heading text-xl text-white">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  )
}

function UpNextCard({ title, onOpen }) {
  const src = title.posterPath ? posterUrl(title.posterPath, 'w92') : null
  const hue = title.title.charCodeAt(0) * 7 % 360

  return (
    <button
      onClick={() => onOpen(title)}
      className="flex-shrink-0 w-28 flex flex-col gap-1.5 text-left"
    >
      <div className="w-28 h-40 rounded-xl overflow-hidden border border-white/8 shadow-md">
        {src
          ? <img src={src} alt={title.title} loading="lazy" className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white" style={{ background: `hsl(${hue},40%,20%)` }}>
              {title.title[0]}
            </div>
        }
      </div>
      <p className="text-xs text-white font-medium leading-tight line-clamp-2">{title.title}</p>
      <p className="text-[10px] text-muted">{title.runtime}h</p>
    </button>
  )
}

export default function Home() {
  const { watchedSet, hoursWatched, avgRating, settings, addToast } = useApp()
  const { isGuest, signInWithGoogle, supabaseEnabled } = useAuth()
  const { toggleWatched } = useWatchlist()
  const [selectedTitle, setSelectedTitle] = useState(null)
  const [trivia]  = useState(() => getDailyTrivia())
  const [showTrivia, setShowTrivia] = useState(true)

  // Pick up welcome toast set by AuthCallback after OAuth redirect
  useEffect(() => {
    const name = sessionStorage.getItem('mq_welcome')
    if (name) {
      sessionStorage.removeItem('mq_welcome')
      addToast({ type: 'success', message: `✓ Welcome back, ${name}!` })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const activePath = settings.activePath ?? 'all'
  const pathTitles = activePath === 'spider'
    ? MCU_TITLES.filter((t) => t.isSpiderManPath)
    : activePath === 'essential'
    ? MCU_TITLES.filter((t) => t.isEssential)
    : MCU_TITLES

  const watched     = watchedSet.size
  const total       = TOTAL
  const pct         = Math.round((watched / total) * 100)
  const nextTitle   = pathTitles.find((t) => !watchedSet.has(t.id))
  const upNext      = pathTitles.filter((t) => !watchedSet.has(t.id)).slice(0, 8)
  const pathWatched = pathTitles.filter((t) => watchedSet.has(t.id)).length
  const pathPct     = Math.round((pathWatched / Math.max(pathTitles.length, 1)) * 100)

  const nextSrc = nextTitle?.posterPath ? posterUrl(nextTitle.posterPath, 'w185') : null

  return (
    <motion.div {...PAGE} transition={{ duration: 0.2 }} className="space-y-5 pb-24 lg:pb-8">
      {/* Hero banner with countdown */}
      {settings.showCountdown !== false && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent-red/20 via-bg-elevated to-bg-surface border border-accent-red/20 p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-red/5 to-transparent pointer-events-none" />
          <p className="text-xs text-accent-red/80 uppercase tracking-widest font-semibold mb-2">Countdown To</p>
          <h2 className="font-heading text-2xl text-white tracking-wider mb-4">
            Spider-Man: Brand New Day
          </h2>
          <CountdownTimer />
          <p className="text-xs text-muted mt-3 text-center">July 31, 2026</p>
        </div>
      )}

      {/* Guest sync banner */}
      {isGuest && supabaseEnabled && (
        <div className="bg-info/10 border border-info/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex-1">
            <p className="text-sm font-medium text-white">📱 Sign in to sync across devices</p>
            <p className="text-xs text-muted mt-0.5">Your progress is saved locally. Sign in to access it everywhere.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={signInWithGoogle}
              className="px-3 py-1.5 bg-white text-gray-900 rounded-lg text-xs font-semibold hover:bg-white/90 transition-colors"
            >
              G Google
            </button>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon="🎬" value={`${watched}/${total}`} label="Titles Watched" />
        <StatCard icon="⏱️" value={`${Math.round(hoursWatched)}h`} label="Hours Watched" />
        <StatCard icon="🔥" value={settings.streakCount ?? 0} label="Day Streak" />
        <StatCard icon="⭐" value={avgRating ?? '—'} label="Avg Rating" />
      </div>

      {/* Overall progress */}
      <div className="bg-bg-surface rounded-2xl border border-white/8 p-5 flex items-center gap-5">
        <ProgressRing percent={pct} size={80} stroke={8}>
          <span className="font-heading text-lg text-white">{pct}%</span>
        </ProgressRing>
        <div className="flex-1">
          <p className="font-semibold text-white">{watched} of {total} titles</p>
          <p className="text-sm text-muted">{total - watched} left to watch</p>
          <Link to="/progress" className="text-xs text-accent-red mt-1 inline-block hover:underline">
            View full stats →
          </Link>
        </div>
      </div>

      {/* Continue Watching */}
      {nextTitle && (
        <div className="bg-bg-surface rounded-2xl border border-white/8 overflow-hidden">
          <div className="flex items-center gap-4 p-4">
            <div className="w-16 h-24 rounded-xl overflow-hidden shrink-0 border border-white/10">
              {nextSrc
                ? <img src={nextSrc} alt={nextTitle.title} loading="lazy" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white bg-accent-red/20">
                    {nextTitle.title[0]}
                  </div>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted uppercase tracking-wider mb-1">Continue Watching</p>
              <p className="font-semibold text-white leading-tight">{nextTitle.title}</p>
              <p className="text-xs text-muted mt-0.5 capitalize">{nextTitle.type} · {nextTitle.runtime}h</p>
              <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent-red transition-all"
                  style={{ width: `${pathPct}%` }}
                />
              </div>
              <p className="text-[10px] text-muted mt-1">{PATH_LABELS[activePath]} — {pathPct}%</p>
            </div>
          </div>
          <div className="flex gap-2 px-4 pb-4">
            <button
              onClick={() => toggleWatched(nextTitle.id)}
              className="flex-1 py-2.5 bg-accent-red text-white rounded-xl text-sm font-semibold hover:bg-accent-darkred transition-colors"
            >
              ✓ Mark as Watched
            </button>
            <button
              onClick={() => setSelectedTitle(nextTitle)}
              className="px-4 py-2.5 bg-white/8 text-muted rounded-xl text-sm hover:bg-white/12 transition-colors"
            >
              Details
            </button>
          </div>
        </div>
      )}

      {/* Up Next horizontal scroll */}
      {upNext.length > 1 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading text-xl text-white tracking-wide">Up Next</h2>
            <Link to="/watchlist" className="text-xs text-accent-red hover:underline">See all</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {upNext.slice(1, 9).map((t) => (
              <UpNextCard key={t.id} title={t} onOpen={setSelectedTitle} />
            ))}
          </div>
        </div>
      )}

      {/* Active path widget */}
      <div className="bg-bg-surface rounded-2xl border border-white/8 p-4 flex items-center gap-4">
        <div className="flex-1">
          <p className="text-xs text-muted uppercase tracking-wider mb-0.5">Active Path</p>
          <p className="font-semibold text-white">{PATH_LABELS[activePath]}</p>
          <p className="text-xs text-muted mt-0.5">{pathWatched}/{pathTitles.length} watched</p>
        </div>
        <ProgressRing percent={pathPct} size={52} stroke={6}>
          <span className="text-[10px] font-bold text-white">{pathPct}%</span>
        </ProgressRing>
        <Link
          to="/paths"
          className="text-xs text-accent-red hover:underline shrink-0"
        >
          Change
        </Link>
      </div>

      {/* Did You Know */}
      {showTrivia && (
        <div className="bg-bg-surface rounded-2xl border border-white/8 p-4 relative">
          <button
            onClick={() => setShowTrivia(false)}
            className="absolute top-3 right-3 text-muted hover:text-white text-xs"
          >✕</button>
          <p className="text-xs text-accent-gold uppercase tracking-widest font-semibold mb-2">
            💡 Did You Know? · {trivia.category}
          </p>
          <p className="text-sm text-muted leading-relaxed">{trivia.fact}</p>
        </div>
      )}

      {/* Title detail sheet */}
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
