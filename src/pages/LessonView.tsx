import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { Archive, ArrowLeft, BookOpen, Bot, CheckCircle2, Code2, FolderKanban, GitPullRequest, Layers, Library, Sparkles, Star, Terminal, Timer } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { learningModules } from '../data/learningModules'
import { Exercise, LearningModule } from '../types'
import { loadState, updateState } from '../utils/storage'
import '../styles/lesson.css'

type ParaKey = 'projects' | 'areas' | 'resources' | 'archives'

type ParaResources = Record<ParaKey, string[]>

interface VerifyResult {
  task_id?: string
  stars: number
  passed: boolean
  feedback: string[]
}

const paraMeta: Record<ParaKey, { translationKey: string; icon: LucideIcon }> = {
  projects: { translationKey: 'lesson.para.projects', icon: FolderKanban },
  areas: { translationKey: 'lesson.para.areas', icon: Layers },
  resources: { translationKey: 'lesson.para.resources', icon: Library },
  archives: { translationKey: 'lesson.para.archives', icon: Archive }
}

const LessonView: React.FC = () => {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const params = useParams<{ id: string }>()
  const lessonId = params.id || ''
  const [state, setState] = useState(loadState())
  const [solutionDrafts, setSolutionDrafts] = useState<Record<string, string>>({})
  const [verifyResults, setVerifyResults] = useState<Record<string, VerifyResult>>({})
  const [isVerifying, setIsVerifying] = useState(false)
  const [terminalTaskId, setTerminalTaskId] = useState<string>()
  const [terminalLogs, setTerminalLogs] = useState<string[]>([])
  const [now, setNow] = useState(Date.now())
  const selectedPathId = state.selectedPathId || localStorage.getItem('selectedPath') || 'frontend'
  const modules = learningModules[selectedPathId] || []
  const lesson = useMemo(() => findLesson(lessonId), [lessonId])
  const pathModules = lesson ? learningModules[lesson.pathId] || [] : modules
  const completedCount = pathModules.filter(module => state.progress.completedModuleIds.includes(module.id)).length
  const progressPct = pathModules.length === 0 ? 0 : Math.round((completedCount / pathModules.length) * 100)
  const isCompleted = lesson ? state.progress.completedModuleIds.includes(lesson.module.id) : false
  const para = lesson ? buildPara(lesson.module) : emptyPara()
  const taskScores = lesson ? state.progress.taskScores?.[lesson.module.id] || {} : {}
  const lessonAverage = lesson ? calculateAverage(lesson.module.exercises.map(task => taskScores[task.id] || 0)) : 0
  const canProgress = lessonAverage >= 4
  const startedAtISO = lesson ? state.progress.lessonStartedAtISO?.[lesson.module.id] : undefined
  const deadlineHours = lesson && lesson.module.estimatedTime >= 5 ? 48 : 24
  const remainingMs = startedAtISO ? Math.max(0, new Date(startedAtISO).getTime() + deadlineHours * 60 * 60 * 1000 - now) : 0

  useEffect(() => {
    if (!lesson) return
    const next = updateState(prev => {
      if (prev.progress.lessonStartedAtISO?.[lesson.module.id]) return prev
      return {
        ...prev,
        selectedPathId: lesson.pathId,
        progress: {
          ...prev.progress,
          lessonStartedAtISO: {
            ...(prev.progress.lessonStartedAtISO || {}),
            [lesson.module.id]: new Date().toISOString()
          }
        }
      }
    })
    setState(next)
  }, [lesson?.module.id])

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(intervalId)
  }, [])

  const openInVSCode = (taskIndex = 0) => {
    const extension = lesson?.module.exercises[taskIndex]?.language === 'python' ? 'py' : 'ts'
    const path = lesson
      ? `C:/Users/Hp/Desktop/project/practice/${lesson.pathId}/${lesson.module.id}/task_${taskIndex + 1}.${extension}`
      : 'C:/Users/Hp/Desktop/project/practice/frontend/lesson-1-philosophy-career/task_1.ts'
    window.location.href = `vscode://file/${path}`
  }

  const verifySolution = async (task: Exercise) => {
    if (!lesson) return
    setIsVerifying(true)
    setTerminalTaskId(task.id)
    runTerminalLogs()
    const code = solutionDrafts[task.id] || task.starterCode

    try {
      const response = await fetch('/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lesson_id: lesson.module.id, task_id: task.id, code, language: i18n.language })
      })
      if (!response.ok) throw new Error('verify failed')
      const result = await response.json() as VerifyResult
      applyVerifyResult(task, result)
    } catch {
      applyVerifyResult(task, { ...simulateVerify(code, i18n.language), task_id: task.id })
    } finally {
      window.setTimeout(() => setIsVerifying(false), 300)
    }
  }

  const applyVerifyResult = (task: Exercise, result: VerifyResult) => {
    if (!lesson) return
    const nextResults = { ...verifyResults, [task.id]: result }
    setVerifyResults(nextResults)

    const next = updateState(prev => {
      const previousLessonTaskScores = prev.progress.taskScores?.[lesson.module.id] || {}
      const nextLessonTaskScores = { ...previousLessonTaskScores, [task.id]: result.stars }
      const nextAverage = calculateAverage(lesson.module.exercises.map(item => nextLessonTaskScores[item.id] || 0))
      return {
        ...prev,
        selectedPathId: lesson.pathId,
        progress: {
          ...prev.progress,
          taskScores: {
            ...(prev.progress.taskScores || {}),
            [lesson.module.id]: nextLessonTaskScores
          },
          lessonScores: {
            ...(prev.progress.lessonScores || {}),
            [lesson.module.id]: nextAverage
          },
          verifiedLines: (prev.progress.verifiedLines || 0) + codeLineCount(solutionDrafts[task.id] || task.starterCode)
        }
      }
    })

    setState(next)
    if (result.stars === 5) {
      fireFiveStarConfetti()
    }
  }

  const markCompleted = async () => {
    if (!lesson || isCompleted || !canProgress) return

    try {
      await fetch(`/lessons/${lesson.module.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'local', language: i18n.language })
      })
    } catch {
      console.info('Backend lesson completion sync deferred; local progress was updated.')
    }

    const next = updateState(prev => {
      const completedModuleIds = prev.progress.completedModuleIds.includes(lesson.module.id)
        ? prev.progress.completedModuleIds
        : [...prev.progress.completedModuleIds, lesson.module.id]
      return {
        ...prev,
        selectedPathId: lesson.pathId,
        progress: {
          ...prev.progress,
          completedModuleIds,
          points: prev.progress.points + Math.round(lessonAverage * 20),
          fastLessonCompletionIds: isFastCompletion(lesson.module.id, prev.progress.lessonStartedAtISO)
            ? Array.from(new Set([...(prev.progress.fastLessonCompletionIds || []), lesson.module.id]))
            : prev.progress.fastLessonCompletionIds
        }
      }
    })

    setState(next)
    if (lessonAverage >= 5) {
      fireFiveStarConfetti()
    }
  }

  const runTerminalLogs = () => {
    const logs = t('lesson.terminalLogs', { returnObjects: true }) as string[]
    const paraLogs = [
      t('lesson.paraSyncProjects', { defaultValue: 'Syncing verified task assets into PARA/Projects...' }),
      t('lesson.paraSyncResources', { defaultValue: 'Promoting reusable patterns from PARA/Projects to PARA/Resources...' })
    ]
    setTerminalLogs([])
    ;[...logs, ...paraLogs].forEach((log, index) => {
      window.setTimeout(() => {
        setTerminalLogs(prev => [...prev, log])
      }, index * 460)
    })
  }

  if (!lesson) {
    return (
      <main className="lesson-root">
        <section className="lesson-empty-card">
          <h1>{t('lesson.notFound')}</h1>
          <p>{t('lesson.chooseLesson')}</p>
          <button type="button" onClick={() => navigate('/learn')}>{t('lesson.backToPlan')}</button>
        </section>
      </main>
    )
  }

  return (
    <main className="lesson-root">
      <div className="lesson-progress-top" aria-label={`Course progress ${progressPct}%`}>
        <div style={{ width: `${progressPct}%` }} />
      </div>

      <div className="lesson-shell">
        <aside className="lesson-para" aria-label={t('lesson.resources')}>
          <button type="button" className="lesson-back" onClick={() => navigate('/learn')}>
            <ArrowLeft size={18} />
            {t('lesson.plan')}
          </button>

          <div className="lesson-para-heading">
            <BookOpen size={20} />
            {t('lesson.para.heading')}
          </div>

          {(Object.keys(paraMeta) as ParaKey[]).map(key => {
            const Icon = paraMeta[key].icon
            return (
              <section key={key} className="lesson-para-section">
                <h2>
                  <Icon size={16} />
                  {t(paraMeta[key].translationKey)}
                </h2>
                <ul>
                  {para[key].map(item => <li key={item}>{item}</li>)}
                </ul>
              </section>
            )
          })}
        </aside>

        <div className="lesson-workspace">
          <motion.article
            className="lesson-reader"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <header className="lesson-header">
              <div className="lesson-kicker">
                <Timer size={16} />
                {t('lesson.kicker', { hours: lesson.module.estimatedTime })}
              </div>
              <h1>{lesson.module.title}</h1>
              <p>{lesson.module.description}</p>
            </header>

            <section className="lesson-markdown">
              {renderMarkdown(lesson.module.content)}
            </section>

            {lesson.module.showcaseCode && (
              <section className="lesson-showcase">
                <span>{t('lesson.showcase')}</span>
                <pre><code>{lesson.module.showcaseCode}</code></pre>
              </section>
            )}
          </motion.article>

          <motion.aside
            className="lesson-task-panel"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <div className="lesson-task-header">
              <div>
                <span>{t('lesson.taskSolution')}</span>
                <h2>{t('lesson.practiceTasks')}</h2>
              </div>
              <Code2 size={24} />
            </div>

            <p>{t('lesson.instruction')}</p>

            <div className="lesson-deadline">
              <Timer size={16} />
              {t('lesson.deadline', { hours: deadlineHours, time: formatDuration(remainingMs) })}
            </div>

            {lesson.module.exercises.map((task, index) => {
              const result = verifyResults[task.id]
              const persistedScore = taskScores[task.id]
              const stars = result?.stars || persistedScore || 0
              return (
                <section key={task.id} className="lesson-task-card">
                  <div className="lesson-task-card-heading">
                    <span>{t('lesson.task', { index: index + 1 })}</span>
                    <strong>{task.title}</strong>
                  </div>
                  <p>{task.description}</p>
                  <button type="button" className="lesson-vscode-btn" onClick={() => openInVSCode(index)}>
                    <Code2 size={20} />
                    {t('lesson.solveInVSCode')}
                  </button>
                  <textarea
                    value={solutionDrafts[task.id] ?? task.starterCode}
                    onChange={event => setSolutionDrafts(prev => ({ ...prev, [task.id]: event.target.value }))}
                    className="lesson-solution-input"
                    aria-label={`${task.title} solution draft`}
                  />
                  <button type="button" className="lesson-verify-btn" onClick={() => verifySolution(task)} disabled={isVerifying}>
                    <Sparkles size={18} />
                    {isVerifying ? t('lesson.verifying') : t('lesson.verifyTask')}
                  </button>
                  {(result || persistedScore) && (
                    <div className="lesson-rating-card">
                      <div className="lesson-stars" aria-label={`${stars} star rating`}>
                        {Array.from({ length: 5 }).map((_, starIndex) => (
                          <Star key={starIndex} size={18} fill={starIndex < stars ? '#34C759' : 'transparent'} />
                        ))}
                      </div>
                      <strong>{stars >= 4 ? t('lesson.accepted') : t('lesson.iteration')}</strong>
                      {result && (
                        <div className="lesson-review-comments">
                          <div className="lesson-review-title">
                            <GitPullRequest size={16} />
                            {t('lesson.reviewComments')}
                          </div>
                          {result.feedback.map((item: string, feedbackIndex) => (
                            <div key={item} className="lesson-review-comment">
                              <span>task_{index + 1}.{task.language === 'python' ? 'py' : 'ts'}:{feedbackIndex + 1}</span>
                              <p>{item}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {terminalTaskId === task.id && (
                    <div className="lesson-terminal-overlay" aria-live="polite">
                      <div className="lesson-terminal-title">
                        <Terminal size={15} />
                        {t('lesson.terminal')}
                      </div>
                      {terminalLogs.map(log => (
                        <motion.div
                          key={log}
                          className="lesson-terminal-line"
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.24 }}
                        >
                          <span>$</span>
                          {log}
                        </motion.div>
                      ))}
                      {isVerifying && terminalLogs.length < 5 && <div className="lesson-terminal-cursor" />}
                    </div>
                  )}
                </section>
              )
            })}

            <div className="lesson-rating-card">
              <div className="lesson-stars" aria-label={`${lessonAverage.toFixed(1)} average star rating`}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} size={18} fill={index < Math.round(lessonAverage) ? '#007AFF' : 'transparent'} />
                ))}
              </div>
              <strong>{t('lesson.average', { score: lessonAverage.toFixed(1) })}</strong>
              <p>{canProgress ? t('lesson.approved') : t('lesson.rule')}</p>
            </div>

            <footer className="lesson-actions">
              <button type="button" className="lesson-complete-btn" onClick={markCompleted} disabled={isCompleted || !canProgress}>
                <CheckCircle2 size={20} />
                {isCompleted ? t('lesson.completed') : canProgress ? t('lesson.complete') : t('lesson.locked')}
              </button>
            </footer>
          </motion.aside>
        </div>

        <motion.aside
          className="lesson-mentor"
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          aria-label={t('lesson.mentor')}
        >
          <div className={isVerifying ? 'lesson-mentor-title lesson-mentor-title--thinking' : 'lesson-mentor-title'}>
            <Bot size={20} />
            {isVerifying ? t('lesson.thinking') : t('lesson.mentor')}
          </div>
          <p>{t('lesson.mentorText')}</p>
          <div className="lesson-mentor-context">
            <span>{t('lesson.lesson')}</span>
            <strong>{lesson.module.title}</strong>
          </div>
          <div className="lesson-mentor-context">
            <span>{t('lesson.verdict')}</span>
            <strong>{isCompleted ? t('lesson.completed') : canProgress ? t('lesson.progressionApproved') : t('lesson.lockedByRule')}</strong>
          </div>
          <div className="lesson-mentor-context">
            <span>{t('lesson.averageScore')}</span>
            <strong>{t('lesson.acrossTasks', { score: lessonAverage.toFixed(1), count: lesson.module.exercises.length })}</strong>
          </div>
          <div className="lesson-mentor-context">
            <span>{t('lesson.paraTip')}</span>
            <strong>{t('lesson.paraTipText')}</strong>
          </div>
        </motion.aside>
      </div>
    </main>
  )
}

function findLesson(moduleId: string): { pathId: string; module: LearningModule } | null {
  for (const [pathId, modules] of Object.entries(learningModules)) {
    const module = modules.find(item => item.id === moduleId)
    if (module) return { pathId, module }
  }
  return null
}

function buildPara(module: LearningModule): ParaResources {
  return {
    projects: module.exercises.map(exercise => exercise.title),
    areas: module.prerequisites.length > 0 ? module.prerequisites : ['Foundation skills', 'Course progress'],
    resources: [module.title, ...module.exercises.flatMap(exercise => exercise.hints.slice(0, 1))],
    archives: module.exercises.map(exercise => `${exercise.difficulty} exercise pattern`)
  }
}

function emptyPara(): ParaResources {
  return { projects: [], areas: [], resources: [], archives: [] }
}

function renderMarkdown(markdown: string) {
  return markdown.split('\n').map((line, index) => {
    if (line.startsWith('# ')) return <h2 key={index}>{line.slice(2)}</h2>
    if (line.startsWith('## ')) return <h3 key={index}>{line.slice(3)}</h3>
    if (line.startsWith('- ')) return <p key={index} className="lesson-list-item">{line.slice(2)}</p>
    if (line.trim() === '') return <div key={index} className="lesson-spacer" />
    return <p key={index}>{line}</p>
  })
}

function calculateAverage(scores: number[]) {
  if (scores.length === 0) return 0
  return scores.reduce((total, score) => total + score, 0) / scores.length
}

function codeLineCount(code: string) {
  return code.split('\n').filter(line => line.trim().length > 0).length
}

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

function isFastCompletion(moduleId: string, startedAtISO?: Record<string, string>) {
  const startedAt = startedAtISO?.[moduleId]
  if (!startedAt) return false
  return Date.now() - new Date(startedAt).getTime() < 60 * 60 * 1000
}

function fireFiveStarConfetti() {
  const colors = ['#007AFF', '#34C759', '#FFFFFF', '#000000', '#FFD60A']
  confetti({ particleCount: 220, spread: 120, startVelocity: 58, scalar: 1.05, origin: { x: 0.5, y: 0.72 }, colors })
  confetti({ particleCount: 120, angle: 60, spread: 80, startVelocity: 64, origin: { x: 0, y: 0.76 }, colors })
  confetti({ particleCount: 120, angle: 120, spread: 80, startVelocity: 64, origin: { x: 1, y: 0.76 }, colors })
}

function simulateVerify(code: string, language: string): VerifyResult {
  const lang = (['en', 'ru', 'uz'].includes(language) ? language : 'en') as 'en' | 'ru' | 'uz'
  const local = {
    en: {
      substantial: 'Solution is substantial enough for review.',
      incomplete: 'Add a complete implementation before final review.',
      units: 'Named units improve readability and testability.',
      logic: 'Logic is explicit and reviewable.',
      clean: 'No obvious debug leftovers detected.'
    },
    ru: {
      substantial: 'Решение достаточно содержательное для ревью.',
      incomplete: 'Добавьте более полную реализацию перед финальным ревью.',
      units: 'Именованные сущности улучшают читаемость и тестируемость.',
      logic: 'Логика выражена явно и удобна для проверки.',
      clean: 'Явных отладочных артефактов не обнаружено.'
    },
    uz: {
      substantial: "Yechim tekshiruv uchun yetarlicha mazmunli.",
      incomplete: "Yakuniy tekshiruvdan oldin to'liqroq implementatsiya qo'shing.",
      units: "Nomlangan birliklar o'qiluvchanlik va testlanishni oshiradi.",
      logic: "Mantiq aniq ifodalangan va tekshiruvga qulay.",
      clean: "Aniq debug qoldiqlari topilmadi."
    }
  }[lang]

  const feedback: string[] = []
  let stars = 1

  if (code.trim().length >= 80) {
    stars += 1
    feedback.push(local.substantial)
  } else {
    feedback.push(local.incomplete)
  }

  if (code.includes('def ') || code.includes('class ')) {
    stars += 1
    feedback.push(local.units)
  }

  if (['if ', 'for ', 'while ', 'return'].some(token => code.includes(token))) {
    stars += 1
    feedback.push(local.logic)
  }

  if (!code.includes('TODO') && !code.includes('print(')) {
    stars += 1
    feedback.push(local.clean)
  }

  return { stars: Math.min(stars, 5), passed: stars >= 3, feedback }
}

export default LessonView
