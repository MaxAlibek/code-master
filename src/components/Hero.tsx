import React, { useEffect, useState } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

interface HeroProps {
  onPrimaryAction: () => void
  onSecondaryAction: () => void
}

const SPLINE_SCENE =
  'https://my.spline.design/nexbotrobotcharacterconcept-ZLQUo6j9tTGRVcz3sd36SQnB/'

interface SplineErrorBoundaryProps {
  children: React.ReactNode
  fallback: React.ReactNode
}

interface SplineErrorBoundaryState {
  hasError: boolean
}

class SplineErrorBoundary extends React.Component<SplineErrorBoundaryProps, SplineErrorBoundaryState> {
  state: SplineErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): SplineErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error('Spline scene failed to render:', error)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }

    return this.props.children
  }
}

const RobotFallback = () => (
  <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_20%,var(--app-glow-blue),transparent_34%),linear-gradient(145deg,var(--app-surface-strong),var(--app-bg-soft))]">
    <div className="absolute left-10 top-12 h-24 w-24 rounded-full bg-[#34C759]/15 blur-2xl" aria-hidden="true" />
    <div className="absolute bottom-14 right-8 h-32 w-32 rounded-full bg-[#007AFF]/15 blur-2xl" aria-hidden="true" />
    <svg
      className="relative h-[360px] w-[360px] max-w-[88%] drop-shadow-[0_28px_42px_rgba(0,0,0,0.14)]"
      viewBox="0 0 360 360"
      role="img"
      aria-label="Friendly robot assistant"
    >
      <defs>
        <linearGradient id="robot-shell" x1="92" x2="276" y1="78" y2="278" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#DCE8FF" />
        </linearGradient>
        <linearGradient id="robot-face" x1="108" x2="252" y1="120" y2="206" gradientUnits="userSpaceOnUse">
          <stop stopColor="#111827" />
          <stop offset="1" stopColor="#25324A" />
        </linearGradient>
      </defs>
      <ellipse cx="180" cy="318" rx="92" ry="18" fill="rgba(0,0,0,0.08)" />
      <path d="M180 54v28" stroke="#111827" strokeLinecap="round" strokeWidth="10" />
      <circle cx="180" cy="42" r="14" fill="#34C759" />
      <rect x="74" y="82" width="212" height="178" rx="56" fill="url(#robot-shell)" stroke="rgba(0,0,0,0.06)" strokeWidth="2" />
      <rect x="104" y="116" width="152" height="94" rx="32" fill="url(#robot-face)" />
      <circle cx="148" cy="162" r="13" fill="#7DD3FC" />
      <circle cx="212" cy="162" r="13" fill="#7DD3FC" />
      <path d="M154 192c14 12 38 12 52 0" stroke="#7DD3FC" strokeLinecap="round" strokeWidth="8" />
      <path d="M74 164H48c-14 0-24 10-24 24v20" stroke="#DCE8FF" strokeLinecap="round" strokeWidth="22" />
      <path d="M286 164h26c14 0 24 10 24 24v20" stroke="#DCE8FF" strokeLinecap="round" strokeWidth="22" />
      <rect x="118" y="238" width="124" height="54" rx="24" fill="#FFFFFF" stroke="rgba(0,0,0,0.05)" strokeWidth="2" />
      <circle cx="154" cy="265" r="8" fill="#007AFF" />
      <circle cx="180" cy="265" r="8" fill="#34C759" />
      <circle cx="206" cy="265" r="8" fill="#111827" />
    </svg>
  </div>
)

const SplineViewer = () => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasFailed, setHasFailed] = useState(false)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (!isLoaded) {
        setHasFailed(true)
      }
    }, 10000)

    return () => window.clearTimeout(timeoutId)
  }, [isLoaded])

  if (hasFailed) {
    return <RobotFallback />
  }

  return (
    <>
      {!isLoaded && (
        <div className="absolute inset-0 flex h-full w-full items-center justify-center gap-2 text-sm font-semibold text-[var(--app-text-faint)]">
          <Sparkles size={16} className="text-[#007AFF]" aria-hidden="true" />
          Loading 3D scene…
        </div>
      )}
      <iframe
        title="Nexbot robot character concept"
        src={SPLINE_SCENE}
        className="h-full w-full border-0"
        allow="autoplay; fullscreen; xr-spatial-tracking"
        loading="eager"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasFailed(true)}
      />
    </>
  )
}

const Hero: React.FC<HeroProps> = ({ onPrimaryAction, onSecondaryAction }) => {
  return (
    <section id="start" className="relative overflow-hidden px-4 pb-16 pt-32 sm:px-8 sm:pb-24 sm:pt-40 theme-shell">
      <div className="absolute left-1/2 top-0 -z-10 h-[512px] w-[512px] -translate-x-1/2 rounded-full bg-[var(--app-glow-blue)] blur-3xl" aria-hidden="true" />
      <div className="absolute right-0 top-32 -z-10 h-64 w-64 rounded-full bg-[var(--app-glow-green)] blur-3xl" aria-hidden="true" />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1fr_520px]">
        <div className="max-w-3xl">
          <span className="inline-flex rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-1 text-sm font-semibold text-[var(--app-text-muted)] shadow-[var(--app-shadow-soft)] backdrop-blur-[20px] transition-colors duration-300 hover:border-[var(--app-accent)]">
            AI-guided programming education
          </span>

          <h1 className="mt-8 text-5xl font-bold leading-[1.1] tracking-[-0.02em] text-[var(--app-text)] sm:text-6xl lg:text-7xl">
            Learn code with a premium adaptive path.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--app-text-muted)] sm:text-xl">
            CodeMaster combines level assessment, structured practice, and progress tracking into a calm Apple-style learning experience.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              onClick={onPrimaryAction}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#007AFF] px-7 py-4 text-base font-bold text-white shadow-[0_10px_20px_rgba(0,122,255,0.18)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-0.5 hover:bg-black focus:outline-none focus:ring-4 focus:ring-[#007AFF]/20"
            >
              Start from scratch
              <ArrowRight size={20} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onSecondaryAction}
              className="inline-flex items-center justify-center rounded-full border border-[var(--app-border)] bg-[var(--app-surface-strong)] px-7 py-4 text-base font-bold text-[var(--app-text)] shadow-[var(--app-shadow-soft)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-0.5 hover:border-[var(--app-accent)] focus:outline-none focus:ring-4 focus:ring-[var(--app-glow-blue)]"
            >
              Continue learning
            </button>
          </div>
        </div>

        {/* Entrance: spring physics per design.md §4 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          {/* Continuous Y-axis bobbing — §4 "slow Y-axis bobbing effect" */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop' }}
            style={{ willChange: 'transform' }}
          >
            <div id="platform" className="relative rounded-[24px] border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-[var(--app-shadow-soft)] backdrop-blur-[20px] sm:p-6">
              {/* 3D canvas container — border-radius:24px + will-change:transform per spec */}
              <div
                className="relative h-[600px] w-full overflow-hidden"
                style={{ borderRadius: '24px', willChange: 'transform', background: 'transparent' }}
              >
                <SplineErrorBoundary fallback={<RobotFallback />}>
                  <SplineViewer />
                </SplineErrorBoundary>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero
