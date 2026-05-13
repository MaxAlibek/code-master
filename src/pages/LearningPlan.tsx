import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { learningPaths } from '../data/learningPaths'
import { getModulesForPath } from '../data/learningModules'
import { CheckCircle, PlayCircle, Lock, BookOpen, Clock, Award } from 'lucide-react'
import { LearningModule } from '../types'
import { loadState } from '../utils/storage'

const TRACK_STACKS: Record<string, string> = {
  frontend: 'React',
  backend: 'FastAPI',
  mobile: 'React Native',
  'data-science': 'Python/SQL'
}

const LearningPlan: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [selectedPath, setSelectedPath] = useState('')
  const [userLevel, setUserLevel] = useState('junior')
  const [modules, setModules] = useState<LearningModule[]>([])
  const [completedModules, setCompletedModules] = useState<string[]>([])
  const [lessonScores, setLessonScores] = useState<Record<string, number>>({})

  useEffect(() => {
    const state = loadState()
    const path = state.selectedPathId || localStorage.getItem('selectedPath') || ''
    const level = state.assessment?.level || (localStorage.getItem('userLevel') || 'junior')
    const completed = state.progress.completedModuleIds

    setSelectedPath(path)
    setUserLevel(level)
    setCompletedModules(completed)
    setLessonScores(state.progress.lessonScores || {})

    if (!path) {
      navigate('/paths')
      return
    }

    const pathModules = getModulesForPath(path, level)
    setModules(pathModules)
  }, [])

  const handleStartModule = (moduleId: string) => {
    navigate(`/lesson/${moduleId}`)
  }

  const getPathInfo = () => {
    return learningPaths.find(path => path.id === selectedPath) || learningPaths[0]
  }

  const getCompletionPercentage = () => {
    if (modules.length === 0) return 0
    return Math.round((completedModules.length / modules.length) * 100)
  }

  const isModuleLocked = (module: LearningModule) => {
    if (module.prerequisites.length === 0) return false
    return !module.prerequisites.every((prereq: string) => (lessonScores[prereq] || 0) >= 4)
  }

  const pathInfo = getPathInfo()
  const pathTitle = t(`paths.tracks.${selectedPath}.title`, { defaultValue: pathInfo.title })
  const levelLabel = t(`learningPlan.levels.${userLevel}`, { defaultValue: userLevel })

  const getModuleTitle = (module: LearningModule) =>
    t(`learningPlan.modules.${module.id}.title`, {
      track: pathTitle,
      stack: TRACK_STACKS[selectedPath] || '',
      defaultValue: module.title
    })

  const getModuleDescription = (module: LearningModule) =>
    t(`learningPlan.modules.${module.id}.description`, {
      track: pathTitle,
      stack: TRACK_STACKS[selectedPath] || '',
      defaultValue: module.description
    })

  const getPrerequisiteLabel = (prerequisiteId: string) =>
    t(`learningPlan.modules.${prerequisiteId}.title`, {
      track: pathTitle,
      stack: TRACK_STACKS[selectedPath] || '',
      defaultValue: prerequisiteId
    })

  return (
    <div className="theme-shell min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[var(--surface)] rounded-2xl shadow-lg p-6 mb-6 border border-[var(--app-border)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)]">{t('learningPlan.title')}</h1>
              <p className="text-[var(--text-sub)] mt-1">{t('learningPlan.pathLabel')}: <span className="font-semibold text-[var(--text-main)]">{pathTitle}</span></p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-extrabold text-[var(--app-primary)]">{getCompletionPercentage()}%</div>
              <div className="text-sm text-[var(--text-sub)]">{t('learningPlan.progress')}</div>
            </div>
          </div>

          <div className="w-full bg-[var(--app-surface-muted)] rounded-full h-3 mt-4 overflow-hidden">
            <div 
              className="bg-emerald-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${getCompletionPercentage()}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[var(--surface)] rounded-2xl shadow-lg p-5 text-center border border-[var(--app-border)]">
            <BookOpen className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
            <div className="text-3xl font-extrabold text-[var(--text-main)]">{modules.length}</div>
            <div className="text-[var(--text-sub)]">{t('learningPlan.totalModules')}</div>
          </div>
          
          <div className="bg-[var(--surface)] rounded-2xl shadow-lg p-5 text-center border border-[var(--app-border)]">
            <Clock className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <div className="text-3xl font-extrabold text-[var(--text-main)]">
              {modules.reduce((total, module) => total + module.estimatedTime, 0)}
            </div>
            <div className="text-[var(--text-sub)]">{t('learningPlan.hoursEstimate')}</div>
          </div>
          
          <div className="bg-[var(--surface)] rounded-2xl shadow-lg p-5 text-center border border-[var(--app-border)]">
            <Award className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
            <div className="text-3xl font-extrabold text-[var(--text-main)]">{levelLabel}</div>
            <div className="text-[var(--text-sub)]">{t('learningPlan.level')}</div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-extrabold text-[var(--text-main)] mb-4">{t('learningPlan.modulesTitle')}</h2>
          
          {modules.map((module, index) => {
            const isCompleted = completedModules.includes(module.id)
            const isLocked = isModuleLocked(module)
            const averageScore = lessonScores[module.id] || 0
            
            return (
              <div key={module.id} className="bg-[var(--surface)] rounded-2xl shadow-lg p-6 border border-[var(--app-border)]">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-[var(--app-primary)]/10 rounded-full flex items-center justify-center mr-4 border border-[var(--app-border)]">
                      {isCompleted ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : isLocked ? (
                        <Lock className="h-6 w-6 text-[var(--text-sub)]" />
                      ) : (
                        <div className="text-[var(--app-primary)] font-extrabold">{index + 1}</div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold text-[var(--text-main)]">
                        {getModuleTitle(module)}
                      </h3>
                      <p className="text-[var(--text-sub)]">{getModuleDescription(module)}</p>
                      
                      <div className="flex items-center mt-2 text-sm text-[var(--text-sub)]">
                        <Clock className="h-4 w-4 mr-1" />
                        {module.estimatedTime} {t('learningPlan.hours')} • {t('learningPlan.aiScore')} {averageScore.toFixed(1)}/5 • 
                        {module.prerequisites.length > 0 && (
                          <span className="ml-2">
                            {t('learningPlan.requires')}: {module.prerequisites.map(getPrerequisiteLabel).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => !isLocked && handleStartModule(module.id)}
                    disabled={isLocked}
                    className={`min-h-[44px] flex items-center px-4 sm:px-5 py-2.5 rounded-[20px] font-semibold ${
                      isCompleted
                        ? 'bg-green-100 text-green-700'
                        : isLocked
                        ? 'bg-[var(--app-surface-muted)] text-[var(--text-sub)] cursor-not-allowed'
                        : 'primary-btn'
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {t('learningPlan.btnDone')}
                      </>
                    ) : isLocked ? (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        {t('learningPlan.btnLocked')}
                      </>
                    ) : (
                      <>
                        <PlayCircle className="h-4 w-4 mr-2" />
                        {t('learningPlan.btnStart')}
                      </>
                    )}
                  </button>
                </div>
                
                {isLocked && (
                  <p className="mt-2 ml-16 text-xs font-medium tracking-[0.01em] text-[var(--text-sub)] opacity-80">
                    {t('learningPlan.ruleHint', { lessons: module.prerequisites.join(', ') })}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-3 mt-8">
          <button
            onClick={() => navigate('/paths')}
            className="min-h-[44px] px-6 py-3 text-[var(--text-main)] hover:opacity-80 font-semibold rounded-lg"
          >
            {t('learningPlan.changePath')}
          </button>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="min-h-[44px] primary-btn px-6 py-3 border border-transparent rounded-lg"
          >
            {t('learningPlan.dashboard')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default LearningPlan
