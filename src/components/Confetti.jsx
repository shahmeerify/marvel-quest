import { useEffect } from 'react'

let confettiLib = null

async function loadConfetti() {
  if (!confettiLib) {
    const mod = await import('canvas-confetti')
    confettiLib = mod.default
  }
  return confettiLib
}

/** Call triggerConfetti() imperatively whenever you want a burst */
export async function triggerConfetti() {
  const confetti = await loadConfetti()
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.5 },
    colors: ['#E23636', '#f5c518', '#ffffff', '#22c55e'],
  })
}

/** Component wrapper — fires once on mount */
export default function Confetti() {
  useEffect(() => { triggerConfetti() }, [])
  return null
}
