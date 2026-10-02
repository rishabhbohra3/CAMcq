import type { QuestionProgress } from '../types'

export function defaultProgress(): QuestionProgress {
  return {
    status: 'unanswered',
    attempts: 0,
    lastAnswer: null,
    lastSeen: null,
    interval: 1,
    easeFactor: 2.5,
    bookmarked: false,
    note: '',
  }
}

export function updateSM2(qp: QuestionProgress, correct: boolean): QuestionProgress {
  const now = new Date().toISOString()
  if (correct) {
    const newInterval = qp.attempts === 0 ? 1 : Math.round(qp.interval * qp.easeFactor)
    const newEase = Math.max(1.3, qp.easeFactor + 0.1)
    return { ...qp, interval: newInterval, easeFactor: newEase, lastSeen: now }
  } else {
    return { ...qp, interval: 1, easeFactor: Math.max(1.3, qp.easeFactor - 0.2), lastSeen: now }
  }
}

export function isDue(qp: QuestionProgress): boolean {
  if (!qp.lastSeen) return true
  const daysSince = (Date.now() - new Date(qp.lastSeen).getTime()) / 86_400_000
  return daysSince >= qp.interval
}

export function quizPriority(qp: QuestionProgress): number {
  if (qp.status === 'unanswered') return 0
  if (qp.status === 'incorrect') return 1
  if (isDue(qp)) return 2
  return 3
}
