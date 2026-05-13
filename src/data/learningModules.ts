import { Exercise, LearningModule, ExerciseLanguage } from '../types'

const tracks = {
  frontend: { title: 'Frontend', stack: 'React', language: 'typescript' as ExerciseLanguage },
  backend: { title: 'Backend', stack: 'FastAPI', language: 'python' as ExerciseLanguage },
  mobile: { title: 'Mobile', stack: 'React Native', language: 'typescript' as ExerciseLanguage },
  'data-science': { title: 'Data Science', stack: 'Python/SQL', language: 'python' as ExerciseLanguage }
}

export const learningModules: { [key: string]: LearningModule[] } = Object.fromEntries(
  Object.entries(tracks).map(([trackId, track]) => [
    trackId,
    [
      createModule(trackId, 'lesson-1-philosophy-career', `Lesson 1: ${track.title} Philosophy & Career`, `Understand the why, industry context, and career roadmap for ${track.title}.`, [], 2, track.language),
      createModule(trackId, 'lesson-2-core-foundations', `${track.title} Core Foundations`, `Build production-grade foundations with ${track.stack}.`, ['lesson-1-philosophy-career'], 4, track.language),
      createModule(trackId, 'lesson-3-professional-workflow', `${track.title} Professional Workflow`, `Practice professional review, refactoring, and delivery habits.`, ['lesson-2-core-foundations'], 5, track.language)
    ]
  ])
)

function createModule(trackId: string, id: string, title: string, description: string, prerequisites: string[], estimatedTime: number, language: ExerciseLanguage): LearningModule {
  const isPhilosophy = id.includes('philosophy')
  return {
    id,
    title,
    description,
    content: `# ${title}

## Theory
${description}

## Industry Context
Professional engineers optimize for clarity, maintainability, feedback loops, and reliable delivery.

## Career Roadmap
- Build fundamentals.
- Practice with real tools.
- Learn to explain trade-offs.
- Ship reviewable work.`,
    showcaseCode: isPhilosophy ? 'career_goal = "Build like a professional, learn like a scientist"' : showcaseFor(language),
    exercises: createThreeTasks(trackId, id, language, isPhilosophy),
    prerequisites,
    estimatedTime
  }
}

function createThreeTasks(trackId: string, lessonId: string, language: ExerciseLanguage, isPhilosophy: boolean): Exercise[] {
  const basePath = `project/practice/${trackId}/${lessonId}`
  return [
    createTask('basic', 'Basic', trackId, lessonId, basePath, 1, language, isPhilosophy),
    createTask('intermediate', 'Intermediate', trackId, lessonId, basePath, 2, language, isPhilosophy),
    createTask('pro', 'Pro', trackId, lessonId, basePath, 3, language, isPhilosophy)
  ]
}

function createTask(level: 'basic' | 'intermediate' | 'pro', label: string, trackId: string, lessonId: string, basePath: string, index: number, language: ExerciseLanguage, isPhilosophy: boolean): Exercise {
  const file = `${basePath}/task_${index}.${language === 'python' ? 'py' : 'ts'}`
  return {
    id: `${lessonId}-${level}`,
    title: `${label}: ${isPhilosophy ? 'Career operating system' : 'Production implementation'}`,
    description: `${label} task for ${trackId}. Open ${file}, implement the prompt, and keep the solution reviewable.`,
    language,
    starterCode: language === 'python' ? 'def solve():\n    pass\n' : 'export function solve() {\n  return null\n}\n',
    solution: language === 'python' ? 'def solve():\n    return {"status": "reviewable"}\n' : 'export function solve() {\n  return { status: "reviewable" }\n}\n',
    hints: ['Keep the public API small', 'Return values instead of relying on debug output'],
    difficulty: level === 'basic' ? 'easy' : level === 'intermediate' ? 'medium' : 'hard'
  }
}

function showcaseFor(language: ExerciseLanguage) {
  return language === 'python'
    ? 'def build_reviewable_unit(input_data):\n    return {"ok": True, "data": input_data}\n'
    : 'export function buildReviewableUnit(inputData: unknown) {\n  return { ok: true, data: inputData }\n}\n'
}

export const getModulesForPath = (pathId: string, _userLevel: string): LearningModule[] => {
  const allModules = learningModules[pathId] || []
  return allModules.map(module => ({ ...module }))
}
