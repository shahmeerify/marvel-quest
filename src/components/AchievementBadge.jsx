import { motion } from 'framer-motion'

export default function AchievementBadge({ achievement, unlockedAt }) {
  const unlocked = Boolean(unlockedAt)
  const dateStr  = unlockedAt
    ? new Date(unlockedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  return (
    <motion.div
      layout
      initial={unlocked ? { scale: 0.8, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`relative rounded-2xl border p-4 flex flex-col items-center text-center gap-2 transition-all
        ${unlocked
          ? 'bg-gradient-to-b from-accent-gold/10 to-bg-surface border-accent-gold/30 shadow-lg shadow-accent-gold/5'
          : 'bg-bg-surface border-white/8 opacity-60'}`}
    >
      {/* Icon */}
      <div className={`text-4xl ${unlocked ? '' : 'grayscale opacity-40'}`}>
        {achievement.icon}
      </div>

      {/* Name */}
      <div>
        <p className={`text-sm font-bold leading-tight ${unlocked ? 'text-white' : 'text-muted'}`}>
          {achievement.secret && !unlocked ? '???' : achievement.name}
        </p>
        {!achievement.secret || unlocked
          ? <p className="text-xs text-muted mt-0.5 leading-snug">{achievement.description}</p>
          : <p className="text-xs text-muted mt-0.5">Secret achievement</p>
        }
      </div>

      {/* Unlock date */}
      {unlocked && dateStr && (
        <p className="text-[10px] text-accent-gold font-medium">Unlocked {dateStr}</p>
      )}

      {/* Locked overlay */}
      {!unlocked && (
        <div className="absolute inset-0 rounded-2xl bg-bg-primary/20 backdrop-blur-[1px]" />
      )}
    </motion.div>
  )
}
