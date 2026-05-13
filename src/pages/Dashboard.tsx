import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveAs } from 'file-saver'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { BadgeCheck, Code2, Rocket, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { learningPaths } from '../data/learningPaths'
import { getModulesForPath } from '../data/learningModules'
import { evaluateAchievements } from '../utils/achievements'
import { loadState, updateState, upsertAchievement } from '../utils/storage'

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [state, setState] = useState(loadState())
  const [nameDraft, setNameDraft] = useState(state.profile.name || '')

  const pathInfo = useMemo(() => {
    const id = state.selectedPathId
    return learningPaths.find(p => p.id === id) || learningPaths[0]
  }, [state.selectedPathId])

  const modules = useMemo(() => {
    const id = pathInfo?.id
    const level = state.assessment?.level || 'junior'
    return id ? getModulesForPath(id, level) : []
  }, [pathInfo?.id, state.assessment?.level])

  const totalModulesInPath = modules.length
  const completedCount = state.progress.completedModuleIds.filter(id => modules.some(m => m.id === id)).length
  const completionPct = totalModulesInPath === 0 ? 0 : Math.round((completedCount / totalModulesInPath) * 100)
  const scoreValues = Object.values(state.progress.lessonScores || {})
  const avgCodeQuality = scoreValues.length === 0 ? 0 : scoreValues.reduce((sum, score) => sum + score, 0) / scoreValues.length
  const verifiedLines = state.progress.verifiedLines || 0
  const activeDeadlines = Object.values(state.progress.lessonStartedAtISO || {}).filter(startedAt => {
    return new Date(startedAt).getTime() + 24 * 60 * 60 * 1000 > Date.now()
  }).length
  const growthData = useMemo(() => buildGrowthData(scoreValues, completionPct), [completionPct, scoreValues.join('|')])
  const heatmapData = useMemo(() => buildHeatmapData(completedCount, verifiedLines), [completedCount, verifiedLines])
  const featuredBadges = useMemo(() => buildFeaturedBadges(state, t), [state.progress.achievements, state.progress.lessonScores, state.progress.verifiedLines, state.progress.fastLessonCompletionIds, t])

  const syncAchievements = () => {
    const unlocked = evaluateAchievements(state, totalModulesInPath)
    if (unlocked.length === 0) return
    const next = updateState(prev => {
      const merged = unlocked.reduce((acc, a) => upsertAchievement(acc, a), prev.progress.achievements)
      return { ...prev, progress: { ...prev.progress, achievements: merged } }
    })
    setState(next)
  }

  const exportCertificate = () => {
    const name = state.profile.name || t('dashboard.certificateSection.fallbackName', { defaultValue: 'Student' })
    const verificationCode = `${pathInfo.id}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`
    const html = certificateHtml({
      recipient: name,
      title: t('dashboard.certificateSection.title', { defaultValue: '{{path}} Completion Certificate', path: pathInfo.title }),
      skills: pathInfo.technologies,
      verificationCode
    })
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    saveAs(blob, `certificate-${pathInfo.id}.html`)
  }

  const canExportCertificate = totalModulesInPath > 0 && completedCount >= totalModulesInPath

  return (
    <div className="theme-shell min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="apple-glass mb-6 flex flex-col gap-4 rounded-[var(--app-card-radius)] p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--app-text)]">{t('dashboard.title')}</h1>
            <div className="text-[var(--app-text-muted)]">
              {t('dashboard.path')}: <span className="font-semibold text-[var(--app-text)]">{pathInfo.title}</span>
              {state.assessment && (
                <>
                  {' '}
                  • {t('dashboard.level')}: <span className="font-semibold text-[var(--app-text)]">{state.assessment.level}</span>
                  {' '}
                  • {t('dashboard.score')}: <span className="font-semibold text-[var(--app-text)]">{state.assessment.score}/{state.assessment.total}</span>
                </>
              )}
            </div>
            <div className="mt-4">
              <div className="mb-1 text-sm text-[var(--app-text-faint)]">{t('dashboard.certificateName')}</div>
              <input
                value={nameDraft}
                onChange={e => setNameDraft(e.target.value)}
                onBlur={() => {
                  const trimmed = nameDraft.trim()
                  const next = updateState(prev => ({ ...prev, profile: { ...prev.profile, name: trimmed || undefined } }))
                  setState(next)
                  setNameDraft(next.profile.name || '')
                }}
                className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-strong)] px-3 py-2 text-[var(--app-text)] focus:outline-none focus:ring-2 focus:ring-indigo-200 md:w-80"
                placeholder={t('dashboard.certificatePlaceholder')}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              className="min-h-[44px] rounded-lg bg-[var(--app-text)] px-4 py-2.5 text-[var(--app-bg)] hover:bg-[var(--app-primary)] font-medium"
              onClick={() => navigate('/learn')}
            >
              {t('dashboard.continue')}
            </button>
            <button
              className="min-h-[44px] rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-strong)] px-4 py-2.5 text-[var(--app-text)] hover:border-[var(--app-primary)] font-medium"
              onClick={() => navigate('/paths')}
            >
              {t('dashboard.changePath')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="apple-glass rounded-[var(--app-card-radius)] p-5">
            <div className="text-[var(--app-text-muted)]">{t('dashboard.progress')}</div>
            <div className="text-3xl font-bold text-[var(--app-text)]">{completionPct}%</div>
            <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-[var(--app-surface-muted)]">
              <div className="h-3 bg-emerald-500" style={{ width: `${completionPct}%` }} />
            </div>
            <div className="mt-2 text-sm text-[var(--app-text-faint)]">{completedCount} / {totalModulesInPath} {t('dashboard.modules')}</div>
          </div>

          <div className="apple-glass rounded-[var(--app-card-radius)] p-5">
            <div className="text-[var(--app-text-muted)]">{t('dashboard.points')}</div>
            <div className="text-3xl font-bold text-[var(--app-text)]">{state.progress.points}</div>
            <div className="mt-2 text-sm text-[var(--app-text-faint)]">{t('dashboard.pointsHint')}</div>
          </div>

          <div className="apple-glass rounded-[var(--app-card-radius)] p-5">
            <div className="text-[var(--app-text-muted)]">{t('dashboard.achievements')}</div>
            <div className="text-3xl font-bold text-[var(--app-text)]">{state.progress.achievements.length}</div>
            <button
              className="mt-3 min-h-[44px] px-4 py-2.5 rounded-lg bg-[var(--app-primary)] text-[var(--surface)] hover:bg-[#0069D9] font-medium"
              onClick={syncAchievements}
            >
              {t('dashboard.refresh')}
            </button>
          </div>
        </div>

        <section className="apple-glass mb-6 rounded-[var(--app-card-radius)] p-6">
          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-sm font-bold uppercase tracking-[0.04em] text-[#007AFF]">{t('dashboard.performanceHub')}</div>
              <h2 className="mt-2 text-xl sm:text-2xl font-extrabold leading-[1.1] tracking-[-0.02em] text-[var(--app-text)]">{t('dashboard.analytics')}</h2>
            </div>
            <div className="text-sm text-[var(--app-text-faint)]">{t('dashboard.telemetry')}</div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-[var(--app-card-radius)] border border-[var(--app-border)] bg-[var(--app-surface)] p-4 backdrop-blur-[20px]">
              <div className="text-sm font-semibold text-[var(--app-text-faint)]">{t('dashboard.analyticsLabels.avgQuality')}</div>
              <div className="mt-2 text-3xl font-extrabold text-[var(--app-text)]">{avgCodeQuality.toFixed(1)}/5</div>
              <div className="mt-2 h-px bg-gradient-to-r from-[#34C759] to-transparent" />
            </div>
            <div className="rounded-[var(--app-card-radius)] border border-[var(--app-border)] bg-[var(--app-surface)] p-4 backdrop-blur-[20px]">
              <div className="text-sm font-semibold text-[var(--app-text-faint)]">{t('dashboard.analyticsLabels.linesVerified')}</div>
              <div className="mt-2 text-3xl font-extrabold text-[var(--app-text)]">{verifiedLines}</div>
              <div className="mt-2 h-px bg-gradient-to-r from-[#007AFF] to-transparent" />
            </div>
            <div className="rounded-[var(--app-card-radius)] border border-[var(--app-border)] bg-[var(--app-surface)] p-4 backdrop-blur-[20px]">
              <div className="text-sm font-semibold text-[var(--app-text-faint)]">{t('dashboard.analyticsLabels.activeDeadlines')}</div>
              <div className="mt-2 text-3xl font-extrabold text-[var(--app-text)]">{activeDeadlines}</div>
              <div className="mt-2 h-px bg-gradient-to-r from-[#34C759] via-[#007AFF] to-transparent" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="rounded-[var(--app-card-radius)] border border-[var(--app-border)] bg-[var(--app-code-bg)] p-4 shadow-[0_8px_20px_rgba(0,0,0,0.05)]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[var(--app-code-text)]">{t('dashboard.analyticsLabels.skillGrowth')}</h3>
                  <p className="text-sm opacity-[0.45] text-[var(--app-code-text)]">{t('dashboard.analyticsLabels.skillGrowthSub')}</p>
                </div>
                <div className="rounded-full border border-[#34C759]/20 bg-[#34C759]/10 px-3 py-1 text-sm font-bold text-[#34C759]">{t('dashboard.analyticsLabels.live')}</div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={growthData} margin={{ top: 8, right: 8, bottom: 8, left: -24 }}>
                    <defs>
                      <linearGradient id="growthGlow" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#34C759" stopOpacity={0.36} />
                        <stop offset="100%" stopColor="#34C759" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeWidth={1} vertical={false} />
                    <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.46)', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.46)', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: 16 }}
                      formatter={(value) => [`${value}`, t('dashboard.level')]}
                    />
                    <Area type="monotone" dataKey="level" stroke="#34C759" strokeWidth={2} fill="url(#growthGlow)" dot={false} activeDot={{ r: 4, stroke: '#007AFF', strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-[var(--app-card-radius)] border border-[var(--app-border)] bg-[var(--app-surface-strong)] p-4">
              <h3 className="text-lg font-bold text-[var(--app-text)]">{t('dashboard.analyticsLabels.activityHeatmap')}</h3>
              <p className="text-sm text-[var(--app-text-faint)]">{t('dashboard.analyticsLabels.heatmapSub')}</p>
              <div className="mt-4 grid grid-cols-7 gap-1">
                {heatmapData.map(day => (
                  <div
                    key={day.id}
                    title={`${day.label}: ${day.intensity} activity`}
                    className="h-5 rounded-[4px] border border-[var(--app-border)]"
                    style={{ backgroundColor: heatmapColor(day.intensity) }}
                  />
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between text-xs font-semibold text-[var(--app-text-faint)]">
                <span>{t('dashboard.analyticsLabels.less')}</span>
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map(level => (
                    <span key={level} className="h-3 w-3 rounded-[3px] border border-[var(--app-border)]" style={{ backgroundColor: heatmapColor(level) }} />
                  ))}
                </div>
                <span>{t('dashboard.analyticsLabels.more')}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-[var(--app-card-radius)] border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-[0_8px_20px_rgba(0,0,0,0.05)] backdrop-blur-[24px]">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-sm font-bold uppercase tracking-[0.08em] text-[#007AFF]">{t('dashboard.badges.title', { defaultValue: 'Badges' })}</div>
              <h2 className="mt-2 text-xl sm:text-2xl font-extrabold tracking-[-0.02em] text-[var(--app-text)]">{t('dashboard.achievementsSection.title')}</h2>
            </div>
            <button
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[var(--app-text)] px-5 text-sm font-bold text-[var(--app-bg)] shadow-[0_10px_20px_rgba(0,0,0,0.12)] hover:bg-[#007AFF]"
              onClick={syncAchievements}
            >
              <BadgeCheck size={17} />
              {t('dashboard.refresh')}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {featuredBadges.map(badge => {
              const Icon = badge.icon
              return (
                <div
                  key={badge.id}
                  className={badge.unlocked ? 'rounded-[var(--app-card-radius)] border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-[0_8px_20px_rgba(0,0,0,0.05)] backdrop-blur-[24px]' : 'rounded-[var(--app-card-radius)] border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-5 opacity-60 backdrop-blur-[24px]'}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className={badge.unlocked ? 'inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#007AFF]/10 text-[#007AFF]' : 'inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--app-surface-muted)] text-[var(--app-text-faint)]'}>
                      <Icon size={23} strokeWidth={1.8} />
                    </span>
                    <span className={badge.unlocked ? 'rounded-full border border-[#34C759]/25 bg-[#34C759]/10 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.08em] text-[#34C759]' : 'rounded-full border border-[var(--app-border)] px-3 py-1 text-xs font-extrabold uppercase tracking-[0.08em] text-[var(--app-text-faint)]'}>
                      {badge.unlocked ? t('dashboard.badges.unlocked', { defaultValue: 'Unlocked' }) : t('dashboard.badges.locked', { defaultValue: 'Locked' })}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold tracking-[-0.02em] text-[var(--app-text)]">{badge.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--app-text-muted)]">{badge.description}</p>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--app-surface-muted)]">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#007AFF] to-[#34C759]" style={{ width: `${badge.progress}%` }} />
                  </div>
                  <div className="mt-2 text-xs font-bold text-[var(--app-text-faint)]">{badge.meta}</div>
                </div>
              )
            })}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="apple-glass rounded-[var(--app-card-radius)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[var(--app-text)]">{t('dashboard.modulesSection.title')}</h2>
              <button
                className="text-indigo-600 hover:text-indigo-700 font-medium"
                onClick={() => navigate('/learn')}
              >
                {t('dashboard.modulesSection.openPlan')}
              </button>
            </div>

            <div className="space-y-3">
              {modules.slice(0, 6).map(m => {
                const done = state.progress.completedModuleIds.includes(m.id)
                return (
                  <div key={m.id} className="flex items-center justify-between border border-[var(--app-border)] rounded-xl p-3">
                    <div>
                      <div className="font-semibold text-[var(--app-text)]">{m.title}</div>
                      <div className="text-sm text-[var(--app-text-muted)]">{m.estimatedTime}{t('dashboard.modulesSection.hours')} • {m.exercises.length} {t('dashboard.modulesSection.tasks')}</div>
                    </div>
                    <div className={done ? 'text-emerald-600 font-semibold' : 'text-[var(--text-sub)]'}>
                      {done ? t('dashboard.modulesSection.done') : t('dashboard.modulesSection.inProgress')}
                    </div>
                  </div>
                )
              })}
              {modules.length === 0 && <div className="text-[var(--app-text-muted)]">{t('dashboard.modulesSection.noPath')}</div>}
            </div>
          </div>

          <div className="apple-glass rounded-[var(--app-card-radius)] p-6">
            <h2 className="text-xl font-semibold text-[var(--app-text)] mb-4">{t('dashboard.achievementsSection.title')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {state.progress.achievements.map(a => (
                <div key={a.id} className="border border-[var(--app-border)] rounded-xl p-4">
                  <div className="text-2xl">{a.icon}</div>
                  <div className="font-semibold text-[var(--app-text)] mt-2">{a.title}</div>
                  <div className="text-sm text-[var(--app-text-muted)]">{a.description}</div>
                </div>
              ))}
              {state.progress.achievements.length === 0 && (
                <div className="text-[var(--app-text-muted)]">{t('dashboard.achievementsSection.empty')}</div>
              )}
            </div>

            <div className="mt-6 border-t border-[var(--app-border)] pt-6">
              <h3 className="text-lg font-semibold text-[var(--app-text)] mb-2">{t('dashboard.certificateSection.title')}</h3>
              <div className="text-[var(--app-text-muted)] mb-3">
                {t('dashboard.certificateSection.description')}
              </div>
              <button
                className={
                  canExportCertificate
                    ? 'min-h-[44px] px-4 py-2.5 rounded-lg bg-[var(--app-primary)] text-[var(--surface)] hover:bg-[#0069D9] font-medium'
                    : 'min-h-[44px] px-4 py-2.5 rounded-lg bg-[var(--app-surface-muted)] text-[var(--text-sub)] cursor-not-allowed font-medium'
                }
                onClick={exportCertificate}
                disabled={!canExportCertificate}
              >
                {t('dashboard.certificateSection.export')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function buildGrowthData(scores: number[], completionPct: number) {
  const base = Math.max(8, completionPct * 0.42)
  return Array.from({ length: 14 }).map((_, index) => {
    const scoreBoost = scores[index % Math.max(scores.length, 1)] || 0
    const level = Math.min(100, Math.round(base + index * 3.4 + scoreBoost * 7))
    return {
      day: `D${index + 1}`,
      level
    }
  })
}

function buildHeatmapData(completedCount: number, verifiedLines: number) {
  const today = new Date()
  return Array.from({ length: 49 }).map((_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (48 - index))
    const momentum = completedCount + Math.floor(verifiedLines / 12)
    const intensity = Math.max(0, Math.min(4, (index + momentum) % 5))
    return {
      id: date.toISOString(),
      label: date.toLocaleDateString(),
      intensity
    }
  })
}

function heatmapColor(intensity: number) {
  const colors = ['#EBEDF0', '#DDFBE6', '#9BE9A8', '#40C463', '#34C759']
  return colors[Math.max(0, Math.min(colors.length - 1, intensity))]
}

function buildFeaturedBadges(state: ReturnType<typeof loadState>, t: (key: string, options?: Record<string, unknown>) => string) {
  const achievements = state.progress.achievements
  const scores = Object.values(state.progress.lessonScores || {})
  const fiveStarCount = scores.filter(score => score >= 5).length
  const verifiedLines = state.progress.verifiedLines || 0
  const fastCount = (state.progress.fastLessonCompletionIds || []).length

  return [
    {
      id: 'clean-coder',
      title: t('dashboard.badges.cleanCoderTitle', { defaultValue: 'Clean Coder' }),
      description: t('dashboard.badges.cleanCoderDesc', { defaultValue: 'Earn a 5-star streak by producing consistently clean, review-ready solutions.' }),
      icon: SparkIcon,
      unlocked: achievements.some(item => item.id === 'clean-coder'),
      progress: Math.min(100, Math.round((fiveStarCount / 3) * 100)),
      meta: t('dashboard.badges.cleanCoderMeta', { defaultValue: '{{count}} / 3 five-star lessons', count: Math.min(fiveStarCount, 3) })
    },
    {
      id: 'code-warrior',
      title: t('dashboard.badges.codeWarriorTitle', { defaultValue: 'Code Warrior' }),
      description: t('dashboard.badges.codeWarriorDesc', { defaultValue: 'Verify 1000 lines through the Senior AI review pipeline.' }),
      icon: Code2,
      unlocked: achievements.some(item => item.id === 'code-warrior'),
      progress: Math.min(100, Math.round((verifiedLines / 1000) * 100)),
      meta: t('dashboard.badges.codeWarriorMeta', { defaultValue: '{{count}} / 1000 lines', count: verifiedLines })
    },
    {
      id: 'fast-learner',
      title: t('dashboard.badges.fastLearnerTitle', { defaultValue: 'Fast Learner' }),
      description: t('dashboard.badges.fastLearnerDesc', { defaultValue: 'Complete any lesson less than one hour after opening it.' }),
      icon: Zap,
      unlocked: achievements.some(item => item.id === 'fast-learner'),
      progress: fastCount > 0 ? 100 : 0,
      meta: fastCount > 0
        ? t('dashboard.badges.fastLearnerMeta', { defaultValue: '{{count}} fast completions', count: fastCount })
        : t('dashboard.badges.fastLearnerRequired', { defaultValue: '< 1h completion required' })
    }
  ]
}

const SparkIcon = Rocket

function certificateHtml(input: { recipient: string; title: string; skills: string[]; verificationCode: string }) {
  const date = new Date().toLocaleDateString()
  const skills = input.skills.slice(0, 12).join(', ')
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Certificate</title>
  <style>
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; background: #f5f7ff; padding: 24px; }
    .card { max-width: 980px; margin: 0 auto; background: white; border-radius: 18px; padding: 42px; border: 2px solid #e5e7eb; }
    .title { font-size: 34px; font-weight: 800; color: #0f172a; margin: 0 0 8px; }
    .sub { color: #334155; margin: 0 0 28px; font-size: 16px; }
    .name { font-size: 28px; font-weight: 800; color: #1d4ed8; margin: 8px 0; }
    .meta { color: #475569; margin-top: 18px; }
    .box { margin-top: 22px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px; }
    .code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    .footer { margin-top: 28px; display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; color: #475569; }
    .btn { display: inline-block; margin-top: 18px; padding: 10px 14px; border-radius: 10px; background: #1d4ed8; color: white; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">
    <div class="title">${escapeHtml(input.title)}</div>
    <div class="sub">Подтверждение завершения учебного плана в CodeMaster</div>
    <div>Награждается</div>
    <div class="name">${escapeHtml(input.recipient)}</div>
    <div class="meta">Дата: ${escapeHtml(date)}</div>
    <div class="box">
      <div><strong>Навыки:</strong> ${escapeHtml(skills)}</div>
      <div style="margin-top:10px"><strong>Код проверки:</strong> <span class="code">${escapeHtml(input.verificationCode)}</span></div>
    </div>
    <a class="btn" href="#" onclick="window.print(); return false;">Печать / Сохранить в PDF</a>
    <div class="footer">
      <div>CodeMaster • Learning Assistant</div>
      <div class="code">${escapeHtml(new Date().toISOString())}</div>
    </div>
  </div>
</body>
</html>`
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
}

export default Dashboard
