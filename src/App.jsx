import { Suspense, lazy, useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

import { useApp } from './context/AppContext'
import Sidebar from './components/layout/Sidebar'
import BottomNav from './components/layout/BottomNav'
import Header from './components/layout/Header'
import ToastContainer from './components/ui/Toast'
import OnboardingOverlay from './components/OnboardingOverlay'
import ErrorBoundary from './components/ErrorBoundary'

// Lazy-load pages for code splitting
const Home         = lazy(() => import('./pages/Home'))
const Watchlist    = lazy(() => import('./pages/Watchlist'))
const Progress     = lazy(() => import('./pages/Progress'))
const Paths        = lazy(() => import('./pages/Paths'))
const Achievements = lazy(() => import('./pages/Achievements'))
const Settings     = lazy(() => import('./pages/Settings'))
const AuthCallback = lazy(() => import('./pages/AuthCallback'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-48">
      <div className="w-8 h-8 rounded-full border-2 border-accent-red border-t-transparent animate-spin" />
    </div>
  )
}

export default function App() {
  const location = useLocation()
  const { settings, online } = useApp()
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    if (!settings.onboardingComplete) setShowOnboarding(true)
  }, [settings.onboardingComplete])

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  const isCallback = location.pathname === '/auth/callback'

  if (isCallback) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <AuthCallback />
        </Suspense>
        <ToastContainer />
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-bg-primary font-body">
        {/* Offline banner */}
        {!online && (
          <div className="fixed top-0 inset-x-0 z-[90] bg-warning/90 text-gray-900 text-xs font-medium text-center py-1.5 px-4">
            📴 Offline — changes saved locally and will sync when reconnected
          </div>
        )}

        {/* Toasts */}
        <ToastContainer />

        {/* Onboarding */}
        {showOnboarding && (
          <OnboardingOverlay onDone={() => setShowOnboarding(false)} />
        )}

        {/* Layout shell */}
        <div className="lg:flex">
          {/* Desktop sidebar */}
          <Sidebar />

          {/* Main content area */}
          <div className="flex-1 lg:pl-60">
            {/* Mobile header */}
            <Header />

            <main className={`px-4 py-4 lg:px-8 lg:py-6 ${!online ? 'mt-7' : ''}`}>
              <AnimatePresence mode="wait">
                <Suspense fallback={<PageLoader />}>
                  <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<Navigate to="/home" replace />} />
                    <Route path="/home"          element={<Home />} />
                    <Route path="/watchlist"     element={<Watchlist />} />
                    <Route path="/progress"      element={<Progress />} />
                    <Route path="/paths"         element={<Paths />} />
                    <Route path="/achievements"  element={<Achievements />} />
                    <Route path="/settings"      element={<Settings />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="*"             element={<Navigate to="/home" replace />} />
                  </Routes>
                </Suspense>
              </AnimatePresence>
            </main>
          </div>
        </div>

        {/* Mobile bottom nav */}
        <BottomNav />
      </div>
    </ErrorBoundary>
  )
}
