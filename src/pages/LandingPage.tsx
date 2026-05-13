import React from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3, Bot, BrainCircuit, Code2, GitBranch, Monitor } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import FeatureCard from '../components/FeatureCard'
import Hero from '../components/Hero'
import Navbar from '../components/Navbar'
import { loadState } from '../utils/storage'

const featureMeta = [
  { icon: Monitor, accent: 'blue' as const, key: 'ide' },
  { icon: Bot, accent: 'dark' as const, key: 'mentor' },
  { icon: GitBranch, accent: 'green' as const, key: 'paths' },
  { icon: BarChart3, accent: 'blue' as const, key: 'scoring' },
  { icon: Code2, accent: 'dark' as const, key: 'split' },
  { icon: BrainCircuit, accent: 'green' as const, key: 'brain' }
]

const LandingPage: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleStartFromScratch = () => {
    navigate('/paths')
  }

  const handleContinueLearning = () => {
    const state = loadState()
    if (state.selectedPathId || state.progress.completedModuleIds.length > 0) {
      navigate('/dashboard')
    } else {
      navigate('/paths')
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F5F7] font-sans text-black">
      <Navbar onPrimaryAction={handleStartFromScratch} onSecondaryAction={handleContinueLearning} />
      <Hero onPrimaryAction={handleStartFromScratch} onSecondaryAction={handleContinueLearning} />

      <section id="features" className="bg-[#F5F5F7] px-4 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-black/5 bg-white px-3 py-1 text-sm font-semibold text-black/60 transition-colors duration-300 hover:border-[#34C759]">
              {t('landing.featuresKicker')}
            </span>
            <h2 className="mt-6 text-4xl font-bold leading-[1.1] tracking-[-0.02em] text-black sm:text-5xl">
              {t('landing.featuresTitle')}
            </h2>
            <p className="mt-4 text-lg leading-8 text-black/60">
              {t('landing.featuresSubtitle')}
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featureMeta.map((feature) => (
              <FeatureCard
                key={feature.key}
                icon={feature.icon}
                accent={feature.accent}
                title={t(`landing.features.${feature.key}.title`)}
                description={t(`landing.features.${feature.key}.description`)}
                preview={t(`landing.features.${feature.key}.preview`)}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default LandingPage
