import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

export default function Header() {
  const { syncing, online } = useApp()

  return (
    <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 bg-bg-primary/90 backdrop-blur-md border-b border-white/8">
      <Link to="/home" className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-md bg-accent-red flex items-center justify-center text-white font-heading text-base">
          M
        </div>
        <span className="font-heading text-xl tracking-wider text-white">Marvel Quest</span>
      </Link>

      <div className="flex items-center gap-2">
        {!online && (
          <span className="text-xs bg-warning/20 text-warning px-2 py-0.5 rounded-full">Offline</span>
        )}
        {syncing && (
          <span className="text-xs text-accent-gold animate-pulse">Syncing...</span>
        )}
        <Link
          to="/settings"
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-muted hover:text-white"
          aria-label="Settings"
        >
          ⚙️
        </Link>
      </div>
    </header>
  )
}
