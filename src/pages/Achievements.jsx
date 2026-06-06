import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { ACHIEVEMENTS } from '../data/achievements'
import AchievementBadge from '../components/AchievementBadge'

const PAGE = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 } }

export default function Achievements() {
  const { achievements } = useApp()
  const unlocked = ACHIEVEMENTS.filter((a) => achievements[a.id]).length

  return (
    <motion.div {...PAGE} transition={{ duration: 0.2 }} className="space-y-5 pb-24 lg:pb-8">
      <div className="flex items-baseline gap-3">
        <h1 className="font-heading text-3xl text-white tracking-wider">Achievements</h1>
        <span className="text-sm text-muted">{unlocked}/{ACHIEVEMENTS.length} unlocked</span>
      </div>

      {/* Progress strip */}
      <div className="h-2 rounded-full bg-white/8 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-accent-gold"
          initial={{ width: 0 }}
          animate={{ width: `${Math.round((unlocked / ACHIEVEMENTS.length) * 100)}%` }}
          transition={{ duration: 1, delay: 0.2 }}
        />
      </div>

      {unlocked === 0 && (
        <div className="text-center py-6">
          <p className="text-3xl mb-2">🏆</p>
          <p className="text-sm text-muted">Start watching to unlock achievements!</p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {ACHIEVEMENTS.map((ach) => (
          <AchievementBadge
            key={ach.id}
            achievement={ach}
            unlockedAt={achievements[ach.id]}
          />
        ))}
      </div>
    </motion.div>
  )
}
