export interface LearningPath {
  id: string
  title: string
  description: string
  technologies: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedDuration: number
  icon: 'code' | 'server' | 'smartphone' | 'chart' | 'cloud'
  deadlineISO: string
}

export interface AssessmentQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
}

export interface UserProgress {
  currentPath: string
  completedModules: string[]
  currentModule: string
  score: number
  level: 'junior' | 'mid' | 'senior'
  strengths: string[]
  weaknesses: string[]
}

export interface LearningModule {
  id: string
  title: string
  description: string
  content: string
  exercises: Exercise[]
  prerequisites: string[]
  estimatedTime: number
  showcaseCode?: string
  vscodePath?: string
}

export interface Exercise {
  id: string
  title: string
  description: string
  language: ExerciseLanguage
  starterCode: string
  solution: string
  hints: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  validation?: ValidationRule
}

export type ExerciseLanguage = 'html' | 'css' | 'javascript' | 'typescript' | 'json' | 'python'

export type ValidationRule =
  | { type: 'includes'; allOf: string[] }
  | { type: 'regex'; allOf: { source: string; flags?: string }[] }

export interface User {
  id: string
  name: string
  email: string
  progress: UserProgress
  achievements: Achievement[]
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt: Date
}

export interface Certificate {
  id: string
  title: string
  recipient: string
  completionDate: Date
  skills: string[]
  verificationCode: string
}

export interface AppState {
  version: number
  selectedPathId?: string
  assessment?: {
    score: number
    total: number
    level: 'junior' | 'mid' | 'senior'
  }
  progress: {
    completedModuleIds: string[]
    completedExerciseIds: string[]
    skippedModuleIds: string[]
    points: number
    achievements: Achievement[]
    startedAtISO?: string
    lessonScores?: Record<string, number>
    taskScores?: Record<string, Record<string, number>>
    lessonStartedAtISO?: Record<string, string>
    verifiedLines?: number
    fastLessonCompletionIds?: string[]
  }
  profile: {
    name?: string
  }
}
