import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'

const TABS = [
  { to: '/home',         icon: '🏠', label: 'Home'       },
  { to: '/watchlist',   icon: '📋', label: 'Watchlist'  },
  { to: '/progress',    icon: '📊', label: 'Progress'   },
  { to: '/paths',       icon: '🛤️',  label: 'Paths'      },
  { to: '/achievements',icon: '🏆', label: 'Badges'     },
]

export default function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-bg-surface/95 backdrop-blur-md border-t border-white/8 pb-safe">
      <div className="flex items-stretch justify-around h-16">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 gap-0.5 text-xs transition-colors
               ${isActive ? 'text-accent-red' : 'text-muted'}`
            }
          >
            {({ isActive }) => (
              <>
                <motion.span
                  className="text-xl leading-none"
                  animate={{ scale: isActive ? 1.2 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  {tab.icon}
                </motion.span>
                <span className={`font-medium ${isActive ? 'text-accent-red' : ''}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    className="absolute top-0 h-0.5 w-8 rounded-full bg-accent-red"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
