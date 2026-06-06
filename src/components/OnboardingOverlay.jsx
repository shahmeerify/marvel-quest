import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'
import CountdownTimer from './CountdownTimer'

const PATHS = [
  { key: 'spider',    icon: '🕷️',  label: 'Spider-Man Path',  desc: '~20 titles · ~45h · Minimum for Brand New Day' },
  { key: 'essential', icon: '⭐',   label: 'Essential MCU',    desc: '~46 titles · ~110h · Full Avengers storyline'   },
  { key: 'all',       icon: '🎬',   label: 'Full Completionist',desc: '114 titles · ~554h · Everything'              },
]

export default function OnboardingOverlay({ onDone }) {
  const { updateSettings } = useApp()
  const [step, setStep] = useState(0)
  const [selectedPath, setSelectedPath] = useState('spider')
  const [targetDate, setTargetDate] = useState('2026-07-25')

  const finish = () => {
    updateSettings({ activePath: selectedPath, paceTargetDate: targetDate, onboardingComplete: true })
    onDone()
  }

  const steps = [
    // Step 0: Welcome
    <div key="welcome" className="text-center space-y-6 px-6 py-8">
      <div className="w-20 h-20 rounded-2xl bg-accent-red flex items-center justify-center text-4xl mx-auto shadow-lg shadow-accent-red/30">
        M
      </div>
      <div>
        <h1 className="font-heading text-4xl text-white tracking-wider mb-2">Marvel Quest</h1>
        <p className="text-muted text-base leading-relaxed">
          Track your entire MCU journey before<br />
          <span className="text-accent-red font-semibold">Spider-Man: Brand New Day</span>
        </p>
      </div>
      <div className="bg-bg-elevated rounded-2xl p-4 border border-white/8">
        <p className="text-xs text-muted uppercase tracking-widest mb-3">Releasing In</p>
        <CountdownTimer />
      </div>
      <button
        onClick={() => setStep(1)}
        className="w-full py-3.5 bg-accent-red text-white rounded-xl font-semibold hover:bg-accent-darkred transition-colors"
      >
        Get Started →
      </button>
      <button onClick={finish} className="text-xs text-muted underline underline-offset-2">Skip</button>
    </div>,

    // Step 1: Choose path
    <div key="path" className="space-y-4 px-6 py-8">
      <div className="text-center mb-2">
        <h2 className="font-heading text-3xl text-white tracking-wide">Choose Your Path</h2>
        <p className="text-muted text-sm mt-1">This sets your "Continue Watching" queue</p>
      </div>
      <div className="space-y-3">
        {PATHS.map((path) => (
          <button
            key={path.key}
            onClick={() => setSelectedPath(path.key)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all
              ${selectedPath === path.key ? 'bg-accent-red/10 border-accent-red/50' : 'bg-bg-elevated border-white/10 hover:border-white/20'}`}
          >
            <span className="text-3xl">{path.icon}</span>
            <div>
              <p className="font-semibold text-white text-sm">{path.label}</p>
              <p className="text-xs text-muted mt-0.5">{path.desc}</p>
            </div>
            {selectedPath === path.key && <span className="ml-auto text-accent-red text-lg">✓</span>}
          </button>
        ))}
      </div>
      <button
        onClick={() => setStep(2)}
        className="w-full py-3.5 bg-accent-red text-white rounded-xl font-semibold hover:bg-accent-darkred transition-colors mt-2"
      >
        Continue →
      </button>
    </div>,

    // Step 2: Set pace
    <div key="pace" className="space-y-5 px-6 py-8">
      <div className="text-center mb-2">
        <h2 className="font-heading text-3xl text-white tracking-wide">Set Your Pace</h2>
        <p className="text-muted text-sm mt-1">When do you want to finish watching?</p>
      </div>

      <div className="bg-bg-elevated rounded-2xl p-4 border border-white/8">
        <CountdownTimer compact />
        <p className="text-xs text-muted mt-1">Until Spider-Man: Brand New Day</p>
      </div>

      <div>
        <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Target Finish Date</label>
        <input
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          max="2026-07-31"
          className="w-full bg-bg-surface border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-accent-red/50 transition-colors"
        />
      </div>

      <div className="bg-accent-red/10 border border-accent-red/20 rounded-xl p-3 text-sm text-muted">
        💡 You'll see a daily pace target in the Progress section.
      </div>

      <button
        onClick={finish}
        className="w-full py-3.5 bg-accent-red text-white rounded-xl font-semibold hover:bg-accent-darkred transition-colors"
      >
        Let's Go! 🕷️
      </button>
    </div>,
  ]

  return (
    <div className="fixed inset-0 z-[200] bg-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-bg-surface rounded-3xl border border-white/8 overflow-hidden shadow-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{   opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 pb-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-accent-red' : 'w-1.5 bg-white/20'}`} />
          ))}
        </div>
      </div>
    </div>
  )
}
