import clsx from 'clsx'

const TYPE_STYLES = {
  movie:   'bg-accent-red/20 text-accent-red border-accent-red/30',
  series:  'bg-purple-500/20 text-purple-400 border-purple-500/30',
  special: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  short:   'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

const VARIANT_STYLES = {
  essential:  'bg-success/20 text-success border-success/30',
  spider:     'bg-accent-red/20 text-accent-red border-accent-red/30',
  phase:      'bg-white/10 text-muted border-white/10',
  streaming:  'bg-blue-500/20 text-blue-400 border-blue-500/30',
}

export default function Badge({ type, variant, label, className }) {
  const style = variant ? VARIANT_STYLES[variant] : TYPE_STYLES[type] ?? TYPE_STYLES.special
  const text = label ?? (type ? type.charAt(0).toUpperCase() + type.slice(1) : '')

  return (
    <span className={clsx('inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold border uppercase tracking-wide', style, className)}>
      {text}
    </span>
  )
}
