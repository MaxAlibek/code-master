import { Exercise } from '../types'

export type ValidationResult =
  | { status: 'idle' }
  | { status: 'pass' }
  | { status: 'fail'; message: string; missing?: string[] }

export function validateExercise(exercise: Exercise, code: string): ValidationResult {
  if (!exercise.validation) return { status: 'idle' }

  if (exercise.validation.type === 'includes') {
    const missing = exercise.validation.allOf.filter(token => !code.includes(token))
    if (missing.length > 0) return { status: 'fail', message: 'Не хватает обязательных частей кода', missing }
    return { status: 'pass' }
  }

  if (exercise.validation.type === 'regex') {
    const missing: string[] = []
    for (const r of exercise.validation.allOf) {
      const re = new RegExp(r.source, r.flags)
      if (!re.test(code)) missing.push(`/${r.source}/${r.flags || ''}`)
    }
    if (missing.length > 0) return { status: 'fail', message: 'Не пройдены проверки', missing }
    return { status: 'pass' }
  }

  return { status: 'idle' }
}
