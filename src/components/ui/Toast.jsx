import { AnimatePresence, motion } from 'framer-motion'
import { useToast } from '../../hooks/useToast'

const STYLES = {
  success:     'bg-success/20 border-success/40 text-success',
  achievement: 'bg-accent-gold/20 border-accent-gold/40 text-accent-gold',
  error:       'bg-accent-red/20 border-accent-red/40 text-accent-red',
  info:        'bg-info/20 border-info/40 text-info',
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed top-4 inset-x-0 z-[100] flex flex-col items-center gap-2 pointer-events-none px-4">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0,   scale: 1    }}
            exit={{   opacity: 0, y: -10,  scale: 0.9  }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md
                        text-sm font-medium shadow-lg max-w-sm w-full
                        ${STYLES[toast.type] ?? STYLES.info}`}
            onClick={() => removeToast(toast.id)}
          >
            <span className="flex-1">{toast.message}</span>
            <button className="opacity-60 hover:opacity-100 text-xs">✕</button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
