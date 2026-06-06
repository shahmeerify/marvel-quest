import { useApp } from '../context/AppContext'
import { MCU_TITLES } from '../data/mcu'

export default function PathTrail({ pathKey = 'spider', onOpenTitle }) {
  const { watchedSet } = useApp()

  const titles = pathKey === 'spider'
    ? MCU_TITLES.filter((t) => t.isSpiderManPath)
    : pathKey === 'essential'
    ? MCU_TITLES.filter((t) => t.isEssential)
    : MCU_TITLES

  const firstUnwatched = titles.find((t) => !watchedSet.has(t.id))

  return (
    <div className="relative pl-8">
      {/* Vertical track line */}
      <div className="absolute left-3.5 top-4 bottom-4 w-0.5 bg-white/10" />

      <div className="space-y-3">
        {titles.map((title, i) => {
          const watched = watchedSet.has(title.id)
          const isCurrent = title.id === firstUnwatched?.id

          return (
            <div key={title.id} className="relative flex items-center gap-3">
              {/* Connector segment */}
              {i > 0 && (
                <div
                  className="absolute left-[-18px] top-0 bottom-1/2 w-0.5"
                  style={{ background: watchedSet.has(titles[i - 1].id) ? '#22c55e' : 'rgba(255,255,255,0.1)' }}
                />
              )}

              {/* Node */}
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 z-10 transition-all
                  ${watched
                    ? 'bg-success border-success'
                    : isCurrent
                    ? 'border-accent-red bg-accent-red/20 animate-pulse-ring'
                    : 'border-white/20 bg-bg-primary'}`}
                style={{ marginLeft: -18 }}
              >
                {watched ? <span className="text-white text-[10px]">✓</span> : null}
              </div>

              {/* Card */}
              <button
                onClick={() => onOpenTitle?.(title)}
                className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-all
                  ${watched
                    ? 'bg-success/5 border-success/20 opacity-70'
                    : isCurrent
                    ? 'bg-accent-red/10 border-accent-red/30'
                    : 'bg-bg-surface border-white/8 hover:border-white/20'}`}
              >
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium leading-tight truncate ${watched ? 'text-muted line-through' : 'text-white'}`}>
                    {title.title}
                  </p>
                  <p className="text-[10px] text-muted mt-0.5">{title.type} · {title.runtime}h</p>
                </div>
                {isCurrent && (
                  <span className="text-xs font-bold text-accent-red px-2 py-0.5 rounded-full bg-accent-red/10 border border-accent-red/20 shrink-0">
                    Next
                  </span>
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
