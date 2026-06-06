import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function BottomSheet({ open, onClose, children, title }) {
  const overlayRef = useRef(null)

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            ref={overlayRef}
            key="backdrop"
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:flex lg:items-center lg:justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
          >
            {/* Sheet */}
            <motion.div
              key="sheet"
              className="absolute bottom-0 inset-x-0 bg-bg-surface rounded-t-3xl overflow-hidden max-h-[90vh]
                         lg:relative lg:bottom-auto lg:inset-auto lg:rounded-2xl lg:max-w-2xl lg:w-full lg:mx-4"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 lg:hidden">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>

              {title && (
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/8">
                  <h2 className="font-heading text-xl tracking-wide text-white">{title}</h2>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-muted hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="overflow-y-auto max-h-[80vh] lg:max-h-[85vh]">{children}</div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
