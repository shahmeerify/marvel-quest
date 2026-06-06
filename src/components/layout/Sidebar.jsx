import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'

const NAV_ITEMS = [
  { to: '/home',         icon: '🏠', label: 'Home'         },
  { to: '/watchlist',   icon: '📋', label: 'Watchlist'    },
  { to: '/progress',    icon: '📊', label: 'Progress'     },
  { to: '/paths',       icon: '🛤️',  label: 'Paths'        },
  { to: '/achievements',icon: '🏆', label: 'Achievements' },
  { to: '/settings',    icon: '⚙️',  label: 'Settings'    },
]

export default function Sidebar() {
  const { user, isGuest } = useAuth()
  const { syncing } = useApp()

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-60 bg-bg-surface border-r border-white/8 z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/8">
        <div className="w-8 h-8 rounded-lg bg-accent-red flex items-center justify-center text-white font-heading text-lg">
          M
        </div>
        <span className="font-heading text-2xl tracking-wider text-white">Marvel Quest</span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
               ${isActive
                ? 'bg-accent-red/15 text-accent-red'
                : 'text-muted hover:text-white hover:bg-white/5'}`
            }
          >
            <span className="text-lg w-6 text-center">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="px-4 py-4 border-t border-white/8">
        {isGuest ? (
          <NavLink
            to="/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted hover:text-white hover:bg-white/5 transition-all"
          >
            <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs">👤</span>
            <span>Sign in to sync</span>
          </NavLink>
        ) : (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-accent-red/20 border border-accent-red/40 flex items-center justify-center text-xs font-bold text-accent-red">
              {(user?.email?.[0] ?? '?').toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">
                {user?.user_metadata?.full_name ?? user?.email ?? 'User'}
              </p>
              {syncing && <p className="text-xs text-accent-gold">Syncing...</p>}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
