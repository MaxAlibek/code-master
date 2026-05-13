import { AppState, Achievement } from '../types'

const STORAGE_KEY = 'codemaster_state_v1'
const VERSION = 1

const defaultState: AppState = {
  version: VERSION,
  progress: {
    completedModuleIds: [],
    completedExerciseIds: [],
    skippedModuleIds: [],
    points: 0,
    achievements: [],
    startedAtISO: new Date().toISOString(),
    lessonScores: {},
    taskScores: {},
    lessonStartedAtISO: {},
    verifiedLines: 0,
    fastLessonCompletionIds: []
  },
  profile: {}
}

export function loadState(): AppState {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return migrateLegacyState(defaultState)
  }

  try {
    const parsed = JSON.parse(raw) as AppState
    if (!parsed || typeof parsed !== 'object') return defaultState
    if (parsed.version !== VERSION) return { ...defaultState, ...parsed, version: VERSION }
    return { ...defaultState, ...parsed, progress: { ...defaultState.progress, ...parsed.progress } }
  } catch {
    return defaultState
  }
}

export function saveState(next: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

export function updateState(updater: (prev: AppState) => AppState) {
  const prev = loadState()
  const next = updater(prev)
  saveState(next)
  return next
}

export function upsertAchievement(prev: Achievement[], next: Achievement): Achievement[] {
  if (prev.some(a => a.id === next.id)) return prev
  return [...prev, next]
}

function migrateLegacyState(fallback: AppState): AppState {
  const selectedPathId = localStorage.getItem('selectedPath') || undefined
  const assessmentScoreRaw = localStorage.getItem('assessmentScore')
  const userLevelRaw = localStorage.getItem('userLevel') as 'junior' | 'mid' | 'senior' | null
  const completedModules = safeJson<string[]>(localStorage.getItem('completedModules')) || []

  const assessmentScore = assessmentScoreRaw ? Number(assessmentScoreRaw) : undefined
  const level = userLevelRaw || undefined

  const migrated: AppState = {
    ...fallback,
    selectedPathId,
    assessment:
      typeof assessmentScore === 'number' && Number.isFinite(assessmentScore) && level
        ? { score: assessmentScore, total: 15, level }
        : undefined,
    progress: {
      ...fallback.progress,
      completedModuleIds: completedModules,
      lessonScores: {},
      taskScores: {},
      lessonStartedAtISO: {},
      verifiedLines: 0
    }
  }

  saveState(migrated)
  return migrated
}

function safeJson<T>(raw: string | null): T | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}
