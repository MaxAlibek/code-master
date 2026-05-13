import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronRight, ChevronLeft, Award } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import i18n from '../i18n'
import { loadState, updateState } from '../utils/storage'
import type { AssessmentQuestion } from '../types'

type BackendAssessmentQuestion = {
  id: string
  question: string
  options: string[]
  correct_answer: number
  difficulty: AssessmentQuestion['difficulty']
  category: string
}

const Assessment: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const TARGET_QUESTIONS = 10
  const selectedTrack = loadState().selectedPathId || localStorage.getItem('selectedPath') || 'frontend'
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [questionBank] = useState(() => generateAssessmentSession(selectedTrack))
  const [activeBank, setActiveBank] = useState(questionBank)
  const [asked, setAsked] = useState(() => pickInitialQuestions(questionBank))
  const [answersById, setAnswersById] = useState<Record<string, number>>({})
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [timeLeft, setTimeLeft] = useState(900)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    let cancelled = false
    setIsGenerating(true)
    fetch('/assessment/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ track_id: selectedTrack, previous_correct: 0, previous_total: 0, language: i18n.language })
    })
      .then(response => response.ok ? response.json() : null)
      .then(data => {
        if (cancelled || !data?.questions?.length) return
        const generated = data.questions.map((question: BackendAssessmentQuestion): AssessmentQuestion => ({
          id: question.id,
          question: question.question,
          options: question.options,
          correctAnswer: question.correct_answer,
          difficulty: question.difficulty,
          category: question.category
        }))
        setActiveBank(generated)
        setAsked(pickInitialQuestions(generated))
        setCurrentQuestion(0)
      })
      .catch(() => console.info('Assessment generator API unavailable; using local anti-cheat generator.'))
      .finally(() => {
        if (!cancelled) setIsGenerating(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedTrack, i18n.language])

  useEffect(() => {
    setCurrentQuestion(prev => Math.min(prev, Math.max(asked.length - 1, 0), TARGET_QUESTIONS - 1))
  }, [asked.length])

  useEffect(() => {
    if (timeLeft > 0 && !showResults) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !showResults) {
      calculateResults()
    }
  }, [timeLeft, showResults])

  const handleAnswer = (answerIndex: number) => {
    const q = asked[currentQuestion]
    if (!q) return

    const nextAnswers = { ...answersById, [q.id]: answerIndex }
    setAnswersById(nextAnswers)

    const isCorrect = answerIndex === q.correctAnswer
    const nextDifficulty = isCorrect ? bumpUp(q.difficulty) : bumpDown(q.difficulty)
    const nextQuestion = asked.length < TARGET_QUESTIONS ? pickNextQuestion(activeBank, asked, nextDifficulty) : null

    setAsked(prev => {
      if (prev.length >= TARGET_QUESTIONS) return prev
      if (!nextQuestion || prev.some(item => item.id === nextQuestion.id)) return prev
      return [...prev, nextQuestion]
    })

    if (currentQuestion < TARGET_QUESTIONS - 1 && (asked[currentQuestion + 1] || nextQuestion)) {
      setTimeout(() => setCurrentQuestion(prev => Math.min(prev + 1, TARGET_QUESTIONS - 1)), 250)
    } else {
      calculateResults(nextAnswers)
    }
  }

  const calculateResults = (answers: Record<string, number> = answersById) => {
    let totalScore = 0
    asked.forEach(q => {
      const answer = answers[q.id]
      if (answer === q.correctAnswer) {
        totalScore++
      }
    })
    setScore(totalScore)
    setShowResults(true)
    
    const level = totalScore >= 8 ? 'senior' : totalScore >= 5 ? 'mid' : 'junior'
    updateState(prev => ({
      ...prev,
      assessment: { score: totalScore, total: TARGET_QUESTIONS, level }
    }))
    localStorage.setItem('assessmentScore', totalScore.toString())
    localStorage.setItem('userLevel', level)
  }

  const getLevel = () => {
    if (score >= 8) return { level: 'senior' as const, color: 'text-green-600' }
    if (score >= 5) return { level: 'mid' as const, color: 'text-blue-600' }
    return { level: 'junior' as const, color: 'text-orange-600' }
  }

  const getRecommendations = () => {
    const level = getLevel()
    return t(`assessment.recs.${level.level}`)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (showResults) {
    const levelInfo = getLevel()
    return (
      <div className="theme-shell min-h-screen p-4">
        <div className="max-w-2xl mx-auto bg-[var(--surface)] rounded-2xl shadow-lg p-8 border border-[var(--app-border)]">
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-4">
              <Award className="h-8 w-8 text-amber-600" />
            </div>
            <h1 className="text-3xl font-extrabold text-[var(--text-main)] mb-2">{t('assessment.completed')}</h1>
            <p className="text-[var(--text-sub)]">{t('assessment.completedSub')}</p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-[var(--surface)] text-center p-4 rounded-xl border border-[var(--app-border)] shadow-sm">
              <div className="text-3xl font-extrabold text-[var(--text-primary)]">{score ?? '--'}/{TARGET_QUESTIONS}</div>
              <div className="text-[var(--text-secondary)]">{t('assessment.correctAnswers')}</div>
            </div>
            <div className="bg-[var(--surface)] text-center p-4 rounded-xl border border-[var(--app-border)] shadow-sm">
              <div className="text-3xl font-extrabold text-[var(--text-primary)]">{t(`assessment.levels.${levelInfo.level}`)}</div>
              <div className="text-[var(--text-secondary)]">{t('assessment.level')}</div>
            </div>
          </div>

          <div className="bg-[var(--surface)] rounded-xl p-6 mb-6 border border-[var(--app-border)] shadow-sm">
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">{t('assessment.recommendations')}</h3>
            <p className="text-[var(--text-secondary)]">{getRecommendations() ?? '--'}</p>
            <p className="text-[var(--text-secondary)] mt-2">{t(`assessment.descriptions.${levelInfo.level}`)}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[var(--surface)] rounded-xl p-4 border border-[var(--app-border)] shadow-sm">
              <h4 className="font-semibold text-[var(--text-primary)] mb-2">{t('assessment.strengths')}</h4>
              <ul className="text-sm text-[var(--text-primary)] space-y-1">
                {score > 7 && <li className="flex items-start gap-2"><span className="text-emerald-500">•</span> {t('assessment.strengthItems.goodBase')}</li>}
                {score > 5 && <li className="flex items-start gap-2"><span className="text-emerald-500">•</span> {t('assessment.strengthItems.logicOk')}</li>}
                <li className="flex items-start gap-2"><span className="text-emerald-500">•</span> {t('assessment.strengthItems.readyToLearn')}</li>
              </ul>
            </div>
            <div className="bg-[var(--surface)] rounded-xl p-4 border border-[var(--app-border)] shadow-sm">
              <h4 className="font-semibold text-[var(--text-primary)] mb-2">{t('assessment.improve')}</h4>
              <ul className="text-sm text-[var(--text-primary)] space-y-1">
                {score < 8 && <li className="flex items-start gap-2"><span className="text-amber-500">•</span> {t('assessment.improveItems.advanced')}</li>}
                {score < 5 && <li className="flex items-start gap-2"><span className="text-amber-500">•</span> {t('assessment.improveItems.basics')}</li>}
                <li className="flex items-start gap-2"><span className="text-amber-500">•</span> {t('assessment.improveItems.morePractice')}</li>
              </ul>
            </div>
          </div>

          <button 
            onClick={() => navigate('/learn')}
            className="primary-btn main-action-pulse w-full py-3 px-6 flex items-center justify-center"
          >
            {t('assessment.goToLearning')}
            <ChevronRight className="h-5 w-5 ml-2" />
          </button>
        </div>
      </div>
    )
  }

  const currentQ = asked[currentQuestion]
  const isQuestionReady = Boolean(currentQ?.question && currentQ.options?.length)
  const progress = ((Math.min(currentQuestion + 1, TARGET_QUESTIONS)) / TARGET_QUESTIONS) * 100
  const currentQId = currentQ?.id ?? ''
  const currentQDifficulty = currentQ?.difficulty ?? 'medium'
  const currentQCategory = currentQ?.category ?? '--'
  const currentQQuestion = currentQ?.question ?? ''
  const currentQOptions = currentQ?.options ?? []

  return (
    <div className="theme-shell min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-[var(--surface)] rounded-2xl shadow-lg p-8 mb-6 border border-[var(--app-border)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-extrabold text-[var(--text-main)]">{t('assessment.title')}</h1>
              <p className="text-[var(--text-sub)]">{t('assessment.questionOf', { current: currentQuestion + 1, total: TARGET_QUESTIONS })}</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-indigo-700 dark:text-indigo-400">{formatTime(timeLeft)}</div>
              <div className="text-sm text-[var(--text-sub)]">{t('assessment.timeLeft')}</div>
            </div>
          </div>
          
          <div className="w-full bg-[var(--app-surface-muted)] rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-[var(--surface)] rounded-2xl shadow-lg p-6 mb-6 border border-[var(--app-border)]">
          {isGenerating || !isQuestionReady ? (
            <div className="animate-pulse space-y-5" aria-live="polite">
              <div className="flex items-center justify-between">
                <div className="h-4 w-32 rounded-full bg-[var(--app-surface-muted)]" />
                <div className="h-4 w-28 rounded-full bg-[var(--app-surface-muted)]" />
              </div>
              <div className="h-7 w-5/6 rounded-full bg-[var(--app-surface-muted)]" />
              <div className="space-y-3">
                {[0, 1, 2, 3].map(item => (
                  <div key={item} className="h-14 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-muted)]" />
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-[var(--text-sub)]">{t('assessment.difficulty')}: <span className="font-semibold text-[var(--text-main)]">{currentQDifficulty}</span></div>
                <div className="text-sm text-[var(--text-sub)]">{t('assessment.category')}: <span className="font-semibold text-[var(--text-main)]">{currentQCategory}</span></div>
              </div>
              <h2 className="text-xl font-bold text-[var(--text-main)] mb-6">
                {currentQQuestion}
              </h2>

              <div className="space-y-4">
                {currentQOptions.map((option, index) => (
                  <button
                    key={`${currentQId}-${index}`}
                    onClick={() => handleAnswer(index)}
                    className={`w-full min-h-[72px] text-left p-5 rounded-2xl border transition-all duration-300 ease-out ${
                      answersById[currentQId] === index
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-[var(--assessment-option-text)] shadow-[0_8px_20px_rgba(0,122,255,0.12)]'
                        : 'border-gray-200 dark:border-zinc-700 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-[var(--assessment-option-text)]'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center mr-4 transition-all duration-300 ${
                        answersById[currentQId] === index
                          ? 'border-blue-500 bg-blue-500 text-[var(--surface)]'
                          : 'border-gray-300 dark:border-gray-500'
                      }`}>
                        {answersById[currentQId] === index && <Check className="h-3 w-3" />}
                      </div>
                      {option}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="flex items-center px-4 py-2 text-[var(--text-main)] disabled:opacity-50"
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            {t('assessment.back')}
          </button>
          
          <button
            onClick={() => {
              if (currentQuestion < Math.min(asked.length, TARGET_QUESTIONS) - 1) {
                setCurrentQuestion(currentQuestion + 1)
              } else {
                calculateResults()
              }
            }}
            disabled={!isQuestionReady}
            className="primary-btn flex items-center px-5 py-2.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {currentQuestion >= Math.min(asked.length, TARGET_QUESTIONS) - 1 ? t('assessment.finish') : t('assessment.next')}
            <ChevronRight className="h-5 w-5 ml-2" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Assessment

function bumpUp(d: 'easy' | 'medium' | 'hard'): 'easy' | 'medium' | 'hard' {
  if (d === 'easy') return 'medium'
  if (d === 'medium') return 'hard'
  return 'hard'
}

function bumpDown(d: 'easy' | 'medium' | 'hard'): 'easy' | 'medium' | 'hard' {
  if (d === 'hard') return 'medium'
  if (d === 'medium') return 'easy'
  return 'easy'
}

function pickInitialQuestions(all: AssessmentQuestion[]) {
  const first = all.find(q => q.difficulty === 'medium') || all[0]
  return first ? [first] : []
}

function pickNextQuestion(
  all: AssessmentQuestion[],
  asked: AssessmentQuestion[],
  difficulty: 'easy' | 'medium' | 'hard'
) {
  const used = new Set(asked.map(q => q.id))
  const pick = (d: 'easy' | 'medium' | 'hard') => all.find(q => q.difficulty === d && !used.has(q.id))
  return pick(difficulty) || pick('medium') || pick('easy') || pick('hard') || null
}

function generateAssessmentSession(trackId: string): AssessmentQuestion[] {
  const seed = `${trackId}-${Date.now()}-${Math.random().toString(36).slice(2)}`
  const track = assessmentTracks[trackId] || assessmentTracks.frontend
  const difficulties: AssessmentQuestion['difficulty'][] = ['medium', 'easy', 'medium', 'hard', 'medium', 'hard', 'easy', 'medium', 'hard', 'hard']

  return difficulties.map((difficulty, index) => {
    const topic = track.topics[(index + seed.length) % track.topics.length]
    const variable = track.variables[(index * 3 + seed.charCodeAt(index % seed.length)) % track.variables.length]
    const answer = track.answers[(index + variable.length) % track.answers.length]
    const distractors = shuffle(track.answers.filter(item => item !== answer), seed + index).slice(0, 3)
    const options = shuffle([answer, ...distractors], `${seed}-${topic}-${index}`)
    return {
      id: `${trackId}-${Date.now()}-${index}`,
      question: buildQuestion(track.label, topic, variable, difficulty, index),
      options,
      correctAnswer: options.indexOf(answer),
      difficulty,
      category: trackId
    }
  })
}

function buildQuestion(track: string, topic: string, variable: string, difficulty: AssessmentQuestion['difficulty'], index: number) {
  if (difficulty === 'hard') {
    return `${track}: in a production scenario ${index + 1}, which decision best handles ${topic} when ${variable} changes under load?`
  }
  if (difficulty === 'medium') {
    return `${track}: what is the best engineering choice for ${topic} using ${variable}?`
  }
  return `${track}: which concept is directly related to ${topic}?`
}

function shuffle<T>(items: T[], seed: string): T[] {
  return [...items].sort((a, b) => {
    const left = JSON.stringify(a).length + seed.charCodeAt(0)
    const right = JSON.stringify(b).length + seed.charCodeAt(seed.length - 1)
    return (left % 7) - (right % 7) || Math.random() - 0.5
  })
}

const assessmentTracks: Record<string, { label: string; topics: string[]; variables: string[]; answers: string[] }> = {
  frontend: {
    label: 'Frontend',
    topics: ['component state', 'accessibility', 'render performance', 'responsive layout', 'React data flow'],
    variables: ['userRole', 'viewportWidth', 'isLoading', 'selectedTab', 'formErrors'],
    answers: ['Use semantic UI and explicit state boundaries', 'Mutate DOM nodes directly', 'Ignore keyboard navigation', 'Store all state globally', 'Block rendering with sync work']
  },
  backend: {
    label: 'Backend',
    topics: ['API boundaries', 'database transactions', 'validation', 'idempotency', 'FastAPI dependency design'],
    variables: ['requestId', 'userId', 'payload', 'dbSession', 'retryCount'],
    answers: ['Validate inputs and keep side effects explicit', 'Trust every client payload', 'Hide errors silently', 'Share mutable globals freely', 'Skip persistence constraints']
  },
  mobile: {
    label: 'Mobile',
    topics: ['navigation state', 'offline sync', 'native permissions', 'gesture feedback', 'battery-aware updates'],
    variables: ['screenName', 'networkStatus', 'permissionState', 'gestureDelta', 'deviceToken'],
    answers: ['Design for lifecycle, latency, and platform constraints', 'Assume permanent connectivity', 'Request every permission at launch', 'Ignore device differences', 'Render heavy lists without virtualization']
  },
  'data-science': {
    label: 'Data Science',
    topics: ['data cleaning', 'feature leakage', 'SQL aggregation', 'model validation', 'visual analysis'],
    variables: ['dataset', 'targetColumn', 'nullRate', 'trainSplit', 'queryWindow'],
    answers: ['Preserve reproducibility and validate assumptions', 'Train on leaked target fields', 'Ignore missing values', 'Report only accuracy', 'Change data manually without tracking']
  }
}
