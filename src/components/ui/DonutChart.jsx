/**
 * Pure SVG donut chart — no external library.
 * @param {Array} segments  [{ label, value, color }]
 * @param {number} size
 * @param {number} stroke
 */
export default function DonutChart({ segments = [], size = 160, stroke = 28, className = '' }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const total = segments.reduce((s, seg) => s + seg.value, 0)

  let offset = 0
  const arcs = segments.map((seg) => {
    const dash = total > 0 ? (seg.value / total) * circ : 0
    const gap  = circ - dash
    const arc  = { ...seg, dash, gap, offset }
    offset += dash
    return arc
  })

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        {arcs.map((arc, i) => (
          <circle
            key={i}
            cx={size/2} cy={size/2} r={r}
            fill="none"
            stroke={arc.color}
            strokeWidth={stroke}
            strokeLinecap="butt"
            strokeDasharray={`${arc.dash} ${arc.gap}`}
            strokeDashoffset={-arc.offset}
            style={{ transition: 'stroke-dasharray 0.8s ease' }}
          />
        ))}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-muted">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: seg.color }} />
            <span>{seg.label}</span>
            <span className="text-white font-medium">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
