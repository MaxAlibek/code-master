import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import { learningModules } from '../data/learningModules'
import { LearningModule } from '../types'
import { evaluateAchievements } from '../utils/achievements'
import { loadState, updateState, upsertAchievement } from '../utils/storage'
import { validateExercise } from '../utils/validation'

const ModuleLesson: React.FC = () => {
  const navigate = useNavigate()
  const params = useParams<{ moduleId: string }>()
  const moduleId = params.moduleId || ''

  const [state, setState] = useState(loadState())
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null)
  const [codeByExercise, setCodeByExercise] = useState<Record<string, string>>({})
  const [hintIndexByExercise, setHintIndexByExercise] = useState<Record<string, number>>({})
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState<string | null>(null)

  const selectedPathId = state.selectedPathId || localStorage.getItem('selectedPath') || 'frontend'
  const userLevel = state.assessment?.level || (localStorage.getItem('userLevel') as 'junior' | 'mid' | 'senior' | null) || 'junior'

  const module = useMemo(() => findModule(selectedPathId, moduleId), [selectedPathId, moduleId])

  const totalModulesInPath = useMemo(() => {
    const pathModules = learningModules[selectedPathId] || []
    return pathModules.filter(m => {
      if (userLevel === 'junior') return m.estimatedTime <= 3
      if (userLevel === 'mid') return m.estimatedTime <= 6
      return true
    }).length
  }, [selectedPathId, userLevel])

  const activeExercise = useMemo(() => {
    if (!module) return null
    const id = activeExerciseId || module.exercises[0]?.id
    return module.exercises.find(e => e.id === id) || null
  }, [module, activeExerciseId])

  useEffect(() => {
    if (!module) return
    if (activeExerciseId) return
    if (module.exercises[0]?.id) setActiveExerciseId(module.exercises[0].id)
  }, [module, activeExerciseId])

  const getCode = (exerciseId: string) => {
    const current = codeByExercise[exerciseId]
    if (typeof current === 'string') return current
    const ex = module?.exercises.find(e => e.id === exerciseId)
    return ex?.starterCode || ''
  }

  const setCode = (exerciseId: string, value: string) => {
    setCodeByExercise(prev => ({ ...prev, [exerciseId]: value }))
  }

  const markExerciseCompleted = (exerciseId: string) => {
    if (!module) return
    const next = updateState(prev => {
      const completedExerciseIds = prev.progress.completedExerciseIds.includes(exerciseId)
        ? prev.progress.completedExerciseIds
        : [...prev.progress.completedExerciseIds, exerciseId]

      const points = prev.progress.points + 10
      return { ...prev, selectedPathId, progress: { ...prev.progress, completedExerciseIds, points } }
    })
    setState(next)
  }

  const markModuleCompleted = (skipped: boolean) => {
    if (!module) return
    const next = updateState(prev => {
      const completedModuleIds = prev.progress.completedModuleIds.includes(module.id)
        ? prev.progress.completedModuleIds
        : [...prev.progress.completedModuleIds, module.id]
      const skippedModuleIds = skipped && !prev.progress.skippedModuleIds.includes(module.id)
        ? [...prev.progress.skippedModuleIds, module.id]
        : prev.progress.skippedModuleIds
      const points = skipped ? prev.progress.points : prev.progress.points + 25
      return { ...prev, selectedPathId, progress: { ...prev.progress, completedModuleIds, skippedModuleIds, points } }
    })

    const unlocked = evaluateAchievements(next, totalModulesInPath)
    const next2 = updateState(prev => {
      const merged = unlocked.reduce((acc, a) => upsertAchievement(acc, a), prev.progress.achievements)
      return { ...prev, progress: { ...prev.progress, achievements: merged } }
    })

    setState(next2)
    navigate('/dashboard')
  }

  const revealHint = (exerciseId: string) => {
    const ex = module?.exercises.find(e => e.id === exerciseId)
    if (!ex) return
    setHintIndexByExercise(prev => {
      const current = prev[exerciseId] ?? -1
      const next = Math.min(current + 1, ex.hints.length - 1)
      return { ...prev, [exerciseId]: next }
    })
  }

  const ask = () => {
    const text = question.trim()
    if (!text) return
    const ex = activeExercise
    const base = ex?.hints?.[0] ? `Подсказка: ${ex.hints[0]}` : 'Попробуй сформулировать вопрос более конкретно и покажи свой код.'
    const lower = text.toLowerCase()
    if (lower.includes('что такое') || lower.includes('зачем')) {
      setAnswer('Если коротко: это часть темы текущего модуля. Открой теорию выше и попробуй связать с заданием. ' + base)
      return
    }
    if (lower.includes('ошиб') || lower.includes('error')) {
      setAnswer('Скорее всего не хватает обязательных частей кода или нарушен синтаксис. Проверь валидатор справа и сравни с примером решения. ' + base)
      return
    }
    setAnswer(base)
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6">
          <div className="text-xl font-semibold text-slate-900">Модуль не найден</div>
          <div className="text-slate-600 mt-2">Проверь ссылку или выбери модуль в плане обучения.</div>
          <button
            className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            onClick={() => navigate('/learn')}
          >
            Вернуться к плану
          </button>
        </div>
      </div>
    )
  }

  const currentExerciseId = activeExerciseId || module.exercises[0]?.id || null
  const code = currentExerciseId ? getCode(currentExerciseId) : ''
  const validation = activeExercise ? validateExercise(activeExercise, code) : { status: 'idle' as const }
  const hintsToShow = activeExercise
    ? activeExercise.hints.slice(0, (hintIndexByExercise[activeExercise.id] ?? -1) + 1)
    : []

  const exerciseDone = activeExercise ? state.progress.completedExerciseIds.includes(activeExercise.id) : false
  const moduleDone = state.progress.completedModuleIds.includes(module.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-slate-500">Модуль</div>
            <h1 className="text-3xl font-bold text-slate-900">{module.title}</h1>
            <div className="text-slate-600">{module.description}</div>
          </div>
          <div className="flex gap-3">
            <button
              className="px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50"
              onClick={() => navigate('/learn')}
            >
              ← План
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
              onClick={() => markModuleCompleted(true)}
              disabled={moduleDone}
            >
              Отметить как знаю
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Теория</h2>
            <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">{module.content}</div>

            <div className="mt-6 border-t border-slate-100 pt-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">Задания</h2>
              <div className="flex flex-wrap gap-2">
                {module.exercises.map(e => {
                  const done = state.progress.completedExerciseIds.includes(e.id)
                  return (
                    <button
                      key={e.id}
                      className={
                        (activeExercise?.id === e.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200') +
                        ' px-3 py-2 rounded-lg text-sm font-medium'
                      }
                      onClick={() => setActiveExerciseId(e.id)}
                    >
                      {done ? '✓ ' : ''}{e.title}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            {activeExercise && (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{activeExercise.title}</h2>
                    <div className="text-slate-600">{activeExercise.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-500">Статус</div>
                    <div
                      className={
                        validation.status === 'pass'
                          ? 'font-semibold text-emerald-600'
                          : validation.status === 'fail'
                          ? 'font-semibold text-rose-600'
                          : 'font-semibold text-slate-500'
                      }
                    >
                      {validation.status === 'pass' ? 'Проверка пройдена' : validation.status === 'fail' ? 'Нужно исправить' : 'В процессе'}
                    </div>
                  </div>
                </div>

                <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden">
                  <Editor
                    height="360px"
                    language={activeExercise.language}
                    value={code}
                    theme="vs-light"
                    onChange={value => setCode(activeExercise.id, value ?? '')}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      scrollBeyondLastLine: false
                    }}
                  />
                </div>

                {validation.status === 'fail' && (
                  <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-100">
                    <div className="font-semibold text-rose-700">{validation.message}</div>
                    {validation.missing && (
                      <div className="mt-2 text-sm text-rose-700">
                        Не найдено: {validation.missing.join(', ')}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    className="px-4 py-2 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200"
                    onClick={() => revealHint(activeExercise.id)}
                    disabled={(hintIndexByExercise[activeExercise.id] ?? -1) >= activeExercise.hints.length - 1}
                  >
                    Показать подсказку
                  </button>
                  <button
                    className={
                      validation.status === 'pass'
                        ? 'px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'px-4 py-2 rounded-lg bg-slate-100 text-slate-400 cursor-not-allowed'
                    }
                    onClick={() => activeExercise && markExerciseCompleted(activeExercise.id)}
                    disabled={validation.status !== 'pass'}
                  >
                    Зачесть задание (+10)
                  </button>
                  <button
                    className={
                      moduleDone
                        ? 'px-4 py-2 rounded-lg bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700'
                    }
                    onClick={() => markModuleCompleted(false)}
                    disabled={moduleDone}
                  >
                    Завершить модуль (+25)
                  </button>
                </div>

                {exerciseDone && (
                  <div className="mt-3 text-emerald-700 font-semibold">Задание уже зачтено</div>
                )}

                {hintsToShow.length > 0 && (
                  <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-100">
                    <div className="font-semibold text-amber-800">Подсказки</div>
                    <ul className="mt-2 space-y-1 text-amber-900">
                      {hintsToShow.map((h, idx) => (
                        <li key={idx}>• {h}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-6 border-t border-slate-100 pt-6">
                  <div className="font-semibold text-slate-900 mb-2">Задать вопрос</div>
                  <div className="flex gap-2">
                    <input
                      value={question}
                      onChange={e => setQuestion(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      placeholder="Например: почему тут нужен <h1>?"
                    />
                    <button
                      className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                      onClick={ask}
                    >
                      Спросить
                    </button>
                  </div>
                  {answer && <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-700">{answer}</div>}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function findModule(pathId: string, moduleId: string): LearningModule | null {
  const modules = learningModules[pathId] || []
  const found = modules.find(m => m.id === moduleId)
  return found || null
}

export default ModuleLesson
