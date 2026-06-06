import { useState } from 'react'
import { motion } from 'framer-motion'

export default function StarRating({ value = 0, onChange, readOnly = false, size = 'md' }) {
  const [hovered, setHovered] = useState(0)
  const sz = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : 'text-lg'

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hovered || value)
        return (
          <motion.button
            key={star}
            type="button"
            disabled={readOnly}
            className={`${sz} transition-colors ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} ${filled ? 'text-accent-gold' : 'text-white/20'}`}
            onClick={() => !readOnly && onChange?.(star === value ? 0 : star)}
            onMouseEnter={() => !readOnly && setHovered(star)}
            onMouseLeave={() => !readOnly && setHovered(0)}
            whileTap={readOnly ? {} : { scale: 1.3 }}
            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
          >
            ★
          </motion.button>
        )
      })}
    </div>
  )
}
