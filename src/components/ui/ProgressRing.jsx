import { useEffect, useRef } from 'react'

/**
 * Animated SVG circular progress ring.
 * @param {number} percent     0–100
 * @param {number} size        diameter in px (default 120)
 * @param {number} stroke      stroke width (default 10)
 * @param {string} color       stroke color (default #E23636)
 * @param {React.ReactNode} children  center content
 */
export default function ProgressRing({
  percent = 0,
  size = 120,
  stroke = 10,
  color = '#E23636',
  children,
  className = '',
}) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.min(percent, 100) / 100)
  const circleRef = useRef(null)

  // Animate from 0 on mount
  useEffect(() => {
    if (!circleRef.current) return
    circleRef.current.style.strokeDashoffset = circ
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (circleRef.current) {
          circleRef.current.style.transition = 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)'
          circleRef.current.style.strokeDashoffset = offset
        }
      })
    })
  }, [percent]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke}
        />
        {/* Progress */}
        <circle
          ref={circleRef}
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  )
}
