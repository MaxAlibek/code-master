import React from 'react'
import { useNavigate } from 'react-router-dom'
import { learningPaths } from '../data/learningPaths'
import { learningModules } from '../data/learningModules'
import { ArrowRight, BarChart3, CheckCircle2, Clock, Cloud, Code2, Server, Smartphone, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { loadState, updateState } from '../utils/storage'
import '../styles/paths.css'

const iconMap = {
  code: Code2,
  server: Server,
  smartphone: Smartphone,
  chart: BarChart3,
  cloud: Cloud
}

const springTransition = { type: 'spring', stiffness: 260, damping: 20 } as const

type TrackLevel = 'beginner' | 'intermediate' | 'advanced' | 'master'

const LearningPathSelection: React.FC = () => {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const state = loadState()

  const handlePathSelect = (pathId: string) => {
    updateState(prev => ({
      ...prev,
      selectedPathId: pathId,
      progress: {
        ...prev.progress,
        completedModuleIds: [],
        completedExerciseIds: [],
        skippedModuleIds: [],
        points: 0
      }
    }))
    localStorage.setItem('selectedPath', pathId)
    navigate('/assessment')
  }

  const getTrackLevel = (progress: number, avgScore: number): TrackLevel => {
    if (progress === 100) return 'master'
    if (progress >= 71 && progress <= 95 && avgScore > 4.5) return 'advanced'
    if (progress >= 31 && progress <= 70 && avgScore > 4.0) return 'intermediate'
    return 'beginner'
  }

  const getLevelClass = (level: TrackLevel) => {
    switch (level) {
      case 'beginner': return 'path-badge path-badge--beginner'
      case 'intermediate': return 'path-badge path-badge--intermediate'
      case 'advanced': return 'path-badge path-badge--advanced'
      case 'master': return 'path-badge path-badge--master'
    }
  }

  const getAverageScore = (moduleIds: string[]) => {
    const scores = moduleIds.map(id => state.progress.lessonScores?.[id] || 0).filter(score => score > 0)
    if (scores.length === 0) return 0
    return scores.reduce((total, score) => total + score, 0) / scores.length
  }

  return (
    <section className="paths-root" aria-label={t('paths.title')}>
      <div className="paths-shell">
        <div className="paths-hero">
          <div>
            <h1 className="paths-title">{t('paths.title')}</h1>
            <p className="paths-subtitle">
              {t('paths.subtitle')}
            </p>
          </div>
          <button
            onClick={() => navigate('/assessment')}
            className="paths-test-btn paths-test-btn--primary"
          >
            {t('paths.assessment')}
          </button>
        </div>

        <div className="paths-roadmap" aria-label={t('paths.roadmap')}>
          {learningPaths.map((path) => {
            const Icon = iconMap[path.icon]
            const modules = learningModules[path.id] || []
            const completedCount = modules.filter(module => state.progress.completedModuleIds.includes(module.id)).length
            const progressPct = modules.length === 0 ? 0 : Math.round((completedCount / modules.length) * 100)
            const avgScore = getAverageScore(modules.map(module => module.id))
            const trackLevel = getTrackLevel(progressPct, avgScore)
            const deadline = new Intl.DateTimeFormat(i18n.language === 'uz' ? 'uz-UZ' : i18n.language === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(path.deadlineISO))

            return (
            <motion.article
              key={path.id}
              className="roadmap-node"
              onClick={() => handlePathSelect(path.id)}
              aria-label={t(`paths.tracks.${path.id}.title`)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={springTransition}
            >
              <div className="path-card-header">
                <div className="path-card-badge-row">
                  <span className={getLevelClass(trackLevel)}>
                    {t(`paths.levels.${trackLevel}`)}
                  </span>
                </div>
                <div className="path-card-title-row">
                  <span className="path-icon" aria-hidden="true">
                    <Icon size={24} />
                  </span>
                  <div>
                    <h3 className="path-title">{t(`paths.tracks.${path.id}.title`)}</h3>
                    <div className="path-tech-line">
                      {path.technologies.slice(0, 3).join(' • ')}
                    </div>
                  </div>
                </div>
              </div>

              <p className="path-desc">{t(`paths.tracks.${path.id}.description`)}</p>

              <div className="path-meta">
                <div className="path-meta-item">
                  <Clock size={16} aria-hidden="true" />
                  {path.estimatedDuration} {t('paths.hours')}
                </div>
                <div className="path-meta-item">
                  <Star size={16} aria-hidden="true" />
                  {path.technologies.length} {t('paths.topics')}
                </div>
                <div className="path-meta-item path-meta-item--wide">
                  <CheckCircle2 size={16} aria-hidden="true" />
                  {t('paths.deadline')}: {deadline}
                </div>
              </div>

              <div className="path-progress" aria-label={t('paths.progressLabel', { progress: progressPct })}>
                <div className="path-progress-copy">
                  <span>{t('paths.progress')}</span>
                  <span>{progressPct}%</span>
                </div>
                <div className="path-progress-track">
                  <div className="path-progress-fill" style={{ width: `${progressPct}%` }} />
                </div>
              </div>

              <div className="path-tags">
                {path.technologies.slice(0, 4).map((tech) => (
                  <span key={tech} className="path-tag">{tech}</span>
                ))}
                {path.technologies.length > 4 && (
                  <span className="path-tag">{t('paths.moreTopics', { count: path.technologies.length - 4 })}</span>
                )}
              </div>

              <button
                className="path-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  handlePathSelect(path.id)
                }}
              >
                {t('paths.select')}
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </motion.article>
            )
          })}
        </div>

        <p className="paths-footer">
          {t('paths.footer')}
        </p>
      </div>
    </section>
  )
}

export default LearningPathSelection
