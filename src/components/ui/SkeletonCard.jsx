export default function SkeletonCard({ className = '' }) {
  return (
    <div className={`rounded-2xl bg-bg-surface border border-white/8 overflow-hidden ${className}`}>
      <div className="animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent bg-[length:200%_100%] h-full w-full p-4">
        <div className="flex gap-3">
          <div className="w-12 h-18 rounded-lg bg-white/10 shrink-0" style={{ height: 72 }} />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-3 w-3/4 rounded bg-white/10" />
            <div className="h-3 w-1/2 rounded bg-white/8"  />
            <div className="h-3 w-1/3 rounded bg-white/6"  />
          </div>
        </div>
      </div>
    </div>
  )
}
