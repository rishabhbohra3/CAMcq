import { useState, useCallback } from 'react'
import type { Course, QuizMode, QuizQuestion, QuizState, CourseProgress } from '../types'
import { quizPriority, defaultProgress } from '../lib/spaced'

function buildQueue(course: Course, mode: QuizMode, progress: CourseProgress | null, filter?: string): QuizQuestion[] {
  const standalone: QuizQuestion[] = []
  const groups: QuizQuestion[][] = []
  const parts = filter ? filter.split(' › ') : []

  for (const section of course.sections) {
    if (parts[0] && parts[0] !== section.name) continue
    for (const topic of section.topics) {
      if (parts[1] && parts[1] !== topic.name) continue
      for (const subtopic of topic.subtopics) {
        if (parts[2] && parts[2] !== subtopic.name) continue
        const meta = { courseSlug: course.slug, sectionName: section.name, topicName: topic.name, subtopicName: subtopic.name }
        for (const q of subtopic.questions ?? []) {
          standalone.push({ ...q, ...meta })
        }
        for (const p of subtopic.passages ?? []) {
          const total = p.questions.length
          const group: QuizQuestion[] = p.questions.map((q, i) => ({
            ...q, ...meta,
            passage: p.passage, passageId: p.id, passageTitle: p.title,
            passageIndex: i, passageTotal: total,
          }))
          groups.push(group)
        }
      }
    }
  }

  if (mode === 'review') {
    const isReviewable = (q: QuizQuestion) => {
      const qp = progress?.questions[q.id] ?? defaultProgress()
      return qp.status === 'incorrect' || qp.status === 'unanswered'
    }
    const reviewStandalone = standalone.filter(isReviewable)
    const reviewGroups = groups
      .map(group => group.filter(isReviewable))
      .filter(group => group.length > 0)
    return [...reviewStandalone, ...reviewGroups.flat()]
  }

  // Sort standalone by SM-2 priority
  const sortedStandalone = [...standalone].sort((a, b) => {
    const pa = quizPriority(progress?.questions[a.id] ?? defaultProgress())
    const pb = quizPriority(progress?.questions[b.id] ?? defaultProgress())
    return pa - pb
  })

  // For each group, use the min priority across its questions as the group's priority.
  // Keep questions inside a group in authored order.
  const groupsWithPriority = groups.map(group => {
    const minPriority = Math.min(
      ...group.map(q => quizPriority(progress?.questions[q.id] ?? defaultProgress()))
    )
    return { group, priority: minPriority }
  }).sort((a, b) => a.priority - b.priority)

  // Interleave: place each group at its priority-ordered position relative to standalone.
  // Simplest stable behavior: standalone first, then groups (kept contiguous internally).
  return [...sortedStandalone, ...groupsWithPriority.flatMap(g => g.group)]
}

export function useQuiz(course: Course, mode: QuizMode, progress: CourseProgress | null, filter?: string) {
  const [state, setState] = useState<QuizState>(() => ({
    mode,
    queue: buildQueue(course, mode, progress, filter),
    currentIndex: 0,
    selectedOption: null,
    confirmed: false,
    sessionCorrect: 0,
    sessionTotal: 0,
    sessionStreak: 0,
    done: false,
    examAnswers: {},
  }))

  const current = state.queue[state.currentIndex] ?? null

  const select = useCallback((idx: number) => {
    if (state.confirmed && mode !== 'exam') return
    setState(s => ({ ...s, selectedOption: idx }))
  }, [state.confirmed, mode])

  const confirm = useCallback(() => {
    if (state.selectedOption === null || (state.confirmed && mode !== 'exam')) return
    const q = state.queue[state.currentIndex]
    if (!q) return

    if (mode === 'exam') {
      setState(s => ({
        ...s,
        examAnswers: { ...s.examAnswers, [q.id]: s.selectedOption },
        confirmed: true,
      }))
      return
    }

    const correct = state.selectedOption === q.answer
    setState(s => ({
      ...s,
      confirmed: true,
      sessionCorrect: correct ? s.sessionCorrect + 1 : s.sessionCorrect,
      sessionTotal: s.sessionTotal + 1,
      sessionStreak: correct ? s.sessionStreak + 1 : 0,
    }))
  }, [state, mode])

  const next = useCallback(() => {
    setState(s => {
      const nextIndex = s.currentIndex + 1
      const done = nextIndex >= s.queue.length
      return { ...s, currentIndex: nextIndex, selectedOption: null, confirmed: false, done }
    })
  }, [])

  const totalQ = state.queue.length

  return { state, current, select, confirm, next, totalQ }
}
