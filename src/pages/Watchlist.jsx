import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { useWatchlist } from '../hooks/useWatchlist'
import { MCU_TITLES } from '../data/mcu'
import TitleCard from '../components/TitleCard'
import TitleDetail from '../components/TitleDetail'
import BottomSheet from '../components/ui/BottomSheet'

const PAGE = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }

const FILTERS = ['all','unwatched','watched','movies','series','essentials','spider-man']
const FILTER_LABELS = {
  all: 'All', unwatched: 'Unwatched', watched: 'Watched',
  movies: 'Movies', series: 'Series', essentials: 'Essentials', 'spider-man': '🕷️ Spider-Man'
}
const SORTS = [
  { value: 'chronological', label: 'Chronological' },
  { value: 'phase',         label: 'Phase'         },
  { value: 'title',         label: 'Title A–Z'     },
  { value: 'runtime-asc',   label: 'Shortest'      },
  { value: 'runtime-desc',  label: 'Longest'       },
]

function SectionHeader({ era, titles, watchedSet }) {
  const watched = titles.filter((t) => watchedSet.has(t.id)).length
  const pct = Math.round((watched / Math.max(titles.length, 1)) * 100)
  return (
    <div className="sticky top-0 z-10 bg-bg-primary/90 backdrop-blur-sm py-2 mb-2">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-heading text-base text-white tracking-wide">{era}</h3>
        <span className="text-xs text-muted">{watched}/{titles.length}</span>
      </div>
      <div className="h-1 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: pct === 100 ? '#22c55e' : pct > 50 ? '#f5c518' : '#E23636' }}
        />
      </div>
    </div>
  )
}

export default function Watchlist() {
  const { watchedSet } = useApp()
  const { getFilteredList, markAllWatched } = useWatchlist()
  const [filter, setFilter]           = useState('all')
  const [sort, setSort]               = useState('chronological')
  const [search, setSearch]           = useState('')
  const [selectedTitle, setSelectedTitle] = useState(null)
  const [batchMode, setBatchMode]     = useState(false)
  const [batchSelected, setBatchSelected] = useState(new Set())
  const [showSort, setShowSort]       = useState(false)

  const filtered = useMemo(
    () => getFilteredList({ filter, sort, search }),
    [filter, sort, search, watchedSet] // eslint-disable-line react-hooks/exhaustive-deps
  )

  // Group by era (only when sorting chronologically or by phase)
  const grouped = useMemo(() => {
    if (sort !== 'chronological' && sort !== 'phase') {
      return [{ era: null, titles: filtered }]
    }
    const map = new Map()
    for (const t of filtered) {
      const era = t.era
      if (!map.has(era)) map.set(era, [])
      map.get(era).push(t)
    }
    return [...map.entries()].map(([era, titles]) => ({ era, titles }))
  }, [filtered, sort])

  const toggleBatch = useCallback((id) => {
    setBatchSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const enterBatch = () => { setBatchMode(true); setBatchSelected(new Set()) }
  const exitBatch  = () => { setBatchMode(false); setBatchSelected(new Set()) }

  const handleBatchWatch = async (watched) => {
    await markAllWatched([...batchSelected], watched)
    exitBatch()
  }

  return (
    <motion.div {...PAGE} transition={{ duration: 0.2 }} className="pb-32 lg:pb-8 space-y-4">
      {/* Filter + search bar */}
      <div className="sticky top-0 z-20 bg-bg-primary pt-1 pb-3 space-y-3">
        {/* Search */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">🔍</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search titles, characters, tags…"
            className="w-full bg-bg-surface border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent-red/50 transition-colors"
          />
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-all
                ${filter === f ? 'bg-accent-red text-white border-accent-red' : 'bg-bg-surface text-muted border-white/10 hover:border-white/30'}`}
            >
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>

        {/* Sort + batch controls */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowSort(!showSort)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-surface border border-white/10 rounded-xl text-xs text-muted hover:text-white transition-colors"
            >
              ↕ {SORTS.find((s) => s.value === sort)?.label}
            </button>
            {showSort && (
              <div className="absolute top-full mt-1 left-0 bg-bg-elevated border border-white/10 rounded-xl overflow-hidden shadow-xl z-30 min-w-32">
                {SORTS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => { setSort(s.value); setShowSort(false) }}
                    className={`block w-full text-left px-3 py-2 text-xs transition-colors hover:bg-white/5
                      ${sort === s.value ? 'text-accent-red' : 'text-muted'}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={batchMode ? exitBatch : enterBatch}
            className="px-3 py-1.5 bg-bg-surface border border-white/10 rounded-xl text-xs text-muted hover:text-white transition-colors"
          >
            {batchMode ? '✕ Cancel' : 'Select'}
          </button>
          <span className="text-xs text-muted ml-auto">{filtered.length} titles</span>
        </div>
      </div>

      {/* Batch action bar */}
      <AnimatePresence>
        {batchMode && batchSelected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 lg:bottom-8 inset-x-4 z-50 bg-bg-elevated border border-white/10 rounded-2xl p-3 flex items-center gap-3 shadow-2xl"
          >
            <span className="text-sm text-white font-medium flex-1">{batchSelected.size} selected</span>
            <button onClick={() => handleBatchWatch(true)}  className="px-4 py-2 bg-success text-white rounded-xl text-sm font-medium">Watch All</button>
            <button onClick={() => handleBatchWatch(false)} className="px-4 py-2 bg-white/10 text-muted rounded-xl text-sm">Unwatch</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      {grouped.map(({ era, titles }) => (
        <div key={era ?? 'all'}>
          {era && <SectionHeader era={era} titles={titles} watchedSet={watchedSet} />}
          <div className="space-y-2">
            {titles.map((title) => (
              <TitleCard
                key={title.id}
                title={title}
                onOpenDetail={() => setSelectedTitle(title)}
                batchMode={batchMode}
                isBatchSelected={batchSelected.has(title.id)}
                onBatchToggle={() => {
                  if (!batchMode) enterBatch()
                  toggleBatch(title.id)
                }}
              />
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <p className="text-4xl">🔍</p>
          <p className="font-heading text-xl text-white">Nothing here</p>
          <p className="text-sm text-muted">Try a different filter or search term</p>
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
