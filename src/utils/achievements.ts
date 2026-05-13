import { Achievement, AppState } from '../types'

type AchievementSeed = Omit<Achievement, 'unlockedAt'>

const seeds: AchievementSeed[] = [
  { id: 'first-steps', title: 'Первые шаги', description: 'Пройден первый модуль', icon: '👣' },
  { id: 'three-modules', title: 'Темп', description: 'Пройдено 3 модуля', icon: '🔥' },
  { id: 'assessment-pro', title: 'Диагностика', description: 'Пройден тест уровня', icon: '🧠' },
  { id: 'certified', title: 'Сертификат', description: 'Завершён путь обучения', icon: '🏆' }
]

export function evaluateAchievements(state: AppState, totalModulesInPath: number): Achievement[] {
  const unlocked: Achievement[] = []
  const completedCount = state.progress.completedModuleIds.length

  if (completedCount >= 1) unlocked.push(make('first-steps'))
  if (completedCount >= 3) unlocked.push(make('three-modules'))
  if (state.assessment) unlocked.push(make('assessment-pro'))
  if (totalModulesInPath > 0 && completedCount >= totalModulesInPath) unlocked.push(make('certified'))

  return unlocked
}

function make(id: string): Achievement {
  const seed = seeds.find(s => s.id === id)
  if (!seed) {
    return { id, title: id, description: '', icon: '⭐', unlockedAt: new Date() }
  }
  return { ...seed, unlockedAt: new Date() }
}
