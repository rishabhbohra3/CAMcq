import { useState, useEffect, useCallback } from 'react'
import { loadProgress, saveProgress } from '../api/progress'
import type { CourseProgress, QuestionProgress } from '../types'
import { defaultProgress } from '../lib/spaced'

export function useProgress(slug: string) {
  const [progress, setProgress] = useState<CourseProgress | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProgress(slug).then(p => {
      setProgress(p ?? { courseId: slug, xp: 0, streak: 0, questions: {}, sessions: [] })
      setLoading(false)
    })
  }, [slug])

  const getQ = useCallback((id: string): QuestionProgress => {
    return progress?.questions[id] ?? defaultProgress()
  }, [progress])

  const updateQ = useCallback((id: string, updates: Partial<QuestionProgress>) => {
    setProgress(prev => {
      if (!prev) return prev
      const updated = {
        ...prev,
        questions: {
          ...prev.questions,
          [id]: { ...(prev.questions[id] ?? defaultProgress()), ...updates },
        },
      }
      saveProgress(slug, updated)
      return updated
    })
  }, [slug])

  const addXP = useCallback((amount: number) => {
    setProgress(prev => {
      if (!prev) return prev
      const updated = { ...prev, xp: prev.xp + amount }
      saveProgress(slug, updated)
      return updated
    })
  }, [slug])

  const recordSession = useCallback((mode: string, correct: number, total: number) => {
    setProgress(prev => {
      if (!prev) return prev
      const updated = {
        ...prev,
        sessions: [
          { date: new Date().toISOString(), mode: mode as never, correct, total },
          ...prev.sessions.slice(0, 49),
        ],
      }
      saveProgress(slug, updated)
      return updated
    })
  }, [slug])

  return { progress, loading, getQ, updateQ, addXP, recordSession }
}
