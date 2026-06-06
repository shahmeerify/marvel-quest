import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { useWatchlist } from '../hooks/useWatchlist'
import { getCachedTMDB, getTMDBData, posterUrl, backdropUrl } from '../lib/tmdb'
import { MCU_TITLES, byId } from '../data/mcu'
import Badge from './ui/Badge'
import StarRating from './ui/StarRating'

function ConnectedTitle({ id, onOpen }) {
  const t = byId[id]
  if (!t) return null
  const cached = getCachedTMDB(t.tmdbId, t.tmdbType)
  const src = cached?.posterPath ? posterUrl(cached.posterPath, 'w92') : null
  return (
    <button
      onClick={() => onOpen(t)}
      className="flex-shrink-0 w-16 text-center"
    >
      <div className="w-16 h-24 rounded-lg overflow-hidden bg-white/5 mb-1">
        {src
          ? <img src={src} alt="" loading="lazy" className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-xs text-muted font-bold">{t.title[0]}</div>
        }
      </div>
      <p className="text-[10px] text-muted leading-tight line-clamp-2">{t.title}</p>
    </button>
  )
}

export default function TitleDetail({ title, onClose, onOpenOther }) {
  const { progress, watchedSet } = useApp()
  const { toggleWatched, saveRating, saveNote } = useWatchlist()
  const [tmdbData, setTmdbData]   = useState(() => getCachedTMDB(title.tmdbId, title.tmdbType))
  const [note, setNote]           = useState(progress[title.id]?.note ?? '')
  const [saving, setSaving]       = useState(false)

  const watched = watchedSet.has(title.id)
  const rating  = progress[title.id]?.rating ?? 0

  useEffect(() => {
    if (!tmdbData && title.tmdbId) {
      getTMDBData(title.tmdbId, title.tmdbType).then((d) => { if (d) setTmdbData(d) })
    }
  }, [title.tmdbId, title.tmdbType]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleNoteBlur = useCallback(async () => {
    setSaving(true)
    await saveNote(title.id, note)
    setSaving(false)
  }, [note, title.id, saveNote])

  const handleShare = () => {
    const text = `I just watched ${title.title} on Marvel Quest! 🕷️`
    navigator.clipboard?.writeText(text)
  }

  const posterSrc   = tmdbData?.posterPath   ? posterUrl(tmdbData.posterPath, 'w300')   : null
  const backdropSrc = tmdbData?.backdropPath ? backdropUrl(tmdbData.backdropPath, 'w780') : null
  const description = tmdbData?.description ?? ''

  const hue = title.title.charCodeAt(0) * 7 % 360

  return (
    <div>
      {/* Backdrop */}
      <div className="relative h-40 lg:h-52 overflow-hidden rounded-t-2xl lg:rounded-t-none">
        {backdropSrc
          ? <img src={backdropSrc} alt="" loading="lazy" className="w-full h-full object-cover" />
          : <div className="w-full h-full" style={{ background: `linear-gradient(135deg, hsl(${hue},40%,15%), hsl(${hue+30},30%,10%))` }} />
        }
        <div className="absolute inset-0 bg-gradient-to-t from-bg-surface/95 via-bg-surface/40 to-transparent" />

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end gap-3">
          <div className="w-16 h-24 rounded-lg overflow-hidden shrink-0 border border-white/10 shadow-xl">
            {posterSrc
              ? <img src={posterSrc} alt={title.title} loading="lazy" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white" style={{ background: `hsl(${hue},40%,20%)` }}>
                  {title.title[0]}
                </div>
            }
          </div>
          <div>
            <div className="flex flex-wrap gap-1 mb-1">
              <Badge type={title.type} />
              {title.isEssential    && <Badge variant="essential" label="⭐ Essential" />}
              {title.isSpiderManPath && <Badge variant="spider"   label="🕷️ Spider-Man Path" />}
            </div>
            <h2 className="font-heading text-xl text-white leading-tight">{title.title}</h2>
            <p className="text-xs text-muted">
              Phase {title.phase} · {title.setYear} · {title.runtime}h
              {tmdbData?.imdbRating ? ` · ⭐ ${tmdbData.imdbRating}` : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Special note */}
        {title.specialNote && (
          <div className="flex gap-2 p-3 rounded-xl bg-warning/10 border border-warning/20 text-sm text-warning">
            <span>⚠️</span>
            <span>{title.specialNote}</span>
          </div>
        )}

        {/* Description */}
        {description && <p className="text-sm text-muted leading-relaxed">{description}</p>}

        {/* Tags */}
        {title.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {title.tags.map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/8 text-muted border border-white/10">{tag}</span>
            ))}
          </div>
        )}

        {/* Characters */}
        {title.characters.length > 0 && (
          <div>
            <p className="text-xs text-muted uppercase tracking-wider mb-2 font-semibold">Key Characters</p>
            <div className="flex flex-wrap gap-2">
              {title.characters.map((char) => (
                <div key={char} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/8">
                  <div className="w-5 h-5 rounded-full bg-accent-red/20 flex items-center justify-center text-[10px] font-bold text-accent-red">
                    {char[0]}
                  </div>
                  <span className="text-xs text-white">{char}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Connected titles */}
        {title.connectedTo?.length > 0 && (
          <div>
            <p className="text-xs text-muted uppercase tracking-wider mb-2 font-semibold">Connected Titles</p>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {title.connectedTo.map((id) => (
                <ConnectedTitle key={id} id={id} onOpen={onOpenOther} />
              ))}
            </div>
          </div>
        )}

        {/* Rating */}
        <div>
          <p className="text-xs text-muted uppercase tracking-wider mb-2 font-semibold">Your Rating</p>
          <StarRating value={rating} onChange={(r) => saveRating(title.id, r)} size="lg" />
        </div>

        {/* Note */}
        <div>
          <p className="text-xs text-muted uppercase tracking-wider mb-2 font-semibold">
            Personal Note {saving && <span className="text-accent-gold">(saving…)</span>}
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={handleNoteBlur}
            placeholder="Add a note or review…"
            rows={3}
            className="w-full bg-bg-elevated border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-muted resize-none focus:outline-none focus:border-accent-red/50 transition-colors"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pb-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => toggleWatched(title.id)}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all
              ${watched
                ? 'bg-white/10 text-muted hover:bg-white/15'
                : 'bg-accent-red text-white hover:bg-accent-darkred'}`}
          >
            {watched ? '↺ Mark as Unwatched' : '✓ Mark as Watched'}
          </motion.button>
          <button
            onClick={handleShare}
            className="px-4 py-3 rounded-xl bg-white/8 text-muted hover:text-white hover:bg-white/12 transition-colors text-sm"
            title="Copy share text"
          >
            Share
          </button>
        </div>
      </div>
    </div>
  )
}
