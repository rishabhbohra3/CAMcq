import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronDown, CheckCircle, XCircle, Circle, Play, ArrowLeft, Bookmark, RotateCcw, BookOpen } from 'lucide-react'
import { fetchCourse } from '../api/courses'
import { useProgress } from '../hooks/useProgress'
import { resetProgress } from '../api/progress'
import { ProgressRing } from '../components/ProgressRing'
import { defaultProgress } from '../lib/spaced'
import type { Course, QuizMode } from '../types'
import { clsx } from 'clsx'

export function CoursePage() {
  const { slug = '' } = useParams()
  const nav = useNavigate()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const { progress } = useProgress(slug)
  const [confirmReset, setConfirmReset] = useState(false)

  async function handleReset() {
    await resetProgress(slug)
    window.location.reload()
  }

  useEffect(() => {
    fetchCourse(slug).then(c => { setCourse(c); setLoading(false) }).catch(() => setLoading(false))
  }, [slug])

  function toggle(key: string) {
    setExpanded(e => ({ ...e, [key]: !e[key] }))
  }

  function startQuiz(mode: QuizMode, filter?: string) {
    const params = new URLSearchParams({ mode })
    if (filter) params.set('filter', filter)
    nav(`/quiz/${slug}?${params}`)
  }

  if (loading || !course) {
    return <div className="flex items-center justify-center h-64 text-gray-500">Loading…</div>
  }

  let totalQ = 0, correct = 0, incorrect = 0, unanswered = 0

  const sectionStats = course.sections.map(section => {
    let sTotal = 0, sCorrect = 0
    const topics = section.topics.map(topic => {
      let tTotal = 0, tCorrect = 0
      const subtopics = topic.subtopics.map(sub => {
        let stTotal = 0, stCorrect = 0
        const allQs = [
          ...(sub.questions ?? []),
          ...((sub.passages ?? []).flatMap(p => p.questions)),
        ]
        for (const q of allQs) {
          const qp = progress?.questions[q.id] ?? defaultProgress()
          stTotal++; tTotal++; sTotal++; totalQ++
          if (qp.status === 'correct') { stCorrect++; tCorrect++; sCorrect++; correct++ }
          else if (qp.status === 'incorrect') incorrect++
          else unanswered++
        }
        const hasPassages = (sub.passages?.length ?? 0) > 0
        return { ...sub, total: stTotal, correct: stCorrect, hasPassages }
      })
      return { ...topic, subtopics, total: tTotal, correct: tCorrect }
    })
    return { ...section, topics, total: sTotal, correct: sCorrect }
  })

  const overallPct = totalQ > 0 ? Math.round((correct / totalQ) * 100) : 0

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button onClick={() => nav('/')} className="flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft size={16} /> Back
      </button>
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">{course.title}</h1>
          {course.description && <p className="text-gray-400 text-sm">{course.description}</p>}
        </div>
        <div className="flex-shrink-0 flex items-center gap-3">
          <ProgressRing value={overallPct} size={56} strokeWidth={5} />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total', value: totalQ, color: 'text-gray-300' },
          { label: 'Correct', value: correct, color: 'text-green-400' },
          { label: 'Wrong', value: incorrect, color: 'text-red-400' },
          { label: 'Unseen', value: unanswered, color: 'text-gray-500' },
        ].map(s => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-8">
        <button onClick={() => startQuiz('practice')} className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-medium transition-colors">
          <Play size={15} /> Practice
        </button>
        <button onClick={() => startQuiz('exam')} className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-medium transition-colors">
          Exam Mode
        </button>
        <button onClick={() => startQuiz('review')} disabled={incorrect + unanswered === 0} className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors">
          Review ({incorrect + unanswered})
        </button>
        <button onClick={() => nav(`/bookmarks/${slug}`)} className="ml-auto flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-yellow-400 rounded-xl text-sm font-medium transition-colors">
          <Bookmark size={15} /> Bookmarked
        </button>
        {confirmReset ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-900/30 border border-red-700 rounded-xl">
            <span className="text-xs text-red-300">Reset all progress?</span>
            <button onClick={handleReset} className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded-md text-xs font-medium">Yes</button>
            <button onClick={() => setConfirmReset(false)} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-xs font-medium">No</button>
          </div>
        ) : (
          <button onClick={() => setConfirmReset(true)} title="Reset all progress for this course" className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-red-900/40 hover:text-red-300 text-gray-400 rounded-xl text-sm font-medium transition-colors">
            <RotateCcw size={15} /> Reset
          </button>
        )}
      </div>

      <div className="space-y-3">
        {sectionStats.map(section => {
          const sKey = section.name
          const sOpen = expanded[sKey] ?? true
          const sPct = section.total > 0 ? Math.round((section.correct / section.total) * 100) : 0
          return (
            <div key={sKey} className="border border-gray-800 rounded-xl overflow-hidden">
              <div className="flex items-center bg-gray-900 hover:bg-gray-800/80 transition-colors group/sec">
                <button
                  onClick={() => toggle(sKey)}
                  className="flex-1 flex items-center gap-3 px-4 py-3 text-left"
                >
                  {sOpen ? <ChevronDown size={16} className="text-gray-500" /> : <ChevronRight size={16} className="text-gray-500" />}
                  <span className="font-medium text-white flex-1">{section.name}</span>
                  <span className="text-xs text-gray-500">{section.correct}/{section.total}</span>
                  <ProgressRing value={sPct} size={28} strokeWidth={3} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); startQuiz('practice', section.name) }}
                  disabled={section.total === 0}
                  className="opacity-0 group-hover/sec:opacity-100 disabled:opacity-0 mr-3 px-2.5 py-1 text-xs text-brand-400 hover:bg-brand-500/10 rounded-md transition-all"
                >
                  Practice ▸
                </button>
              </div>
              {sOpen && (
                <div className="divide-y divide-gray-800/60">
                  {section.topics.map(topic => {
                    const tKey = `${sKey}/${topic.name}`
                    const tOpen = expanded[tKey]
                    const tPct = topic.total > 0 ? Math.round((topic.correct / topic.total) * 100) : 0
                    return (
                      <div key={tKey}>
                        <div className="flex items-center bg-gray-900/60 hover:bg-gray-800/40 transition-colors group/top">
                          <button
                            onClick={() => toggle(tKey)}
                            className="flex-1 flex items-center gap-3 pl-8 pr-4 py-2.5 text-left"
                          >
                            {tOpen ? <ChevronDown size={14} className="text-gray-600" /> : <ChevronRight size={14} className="text-gray-600" />}
                            <span className="text-sm text-gray-200 flex-1">{topic.name}</span>
                            <span className="text-xs text-gray-500">{topic.correct}/{topic.total}</span>
                            <ProgressRing value={tPct} size={22} strokeWidth={2.5} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); startQuiz('practice', `${section.name} › ${topic.name}`) }}
                            disabled={topic.total === 0}
                            className="opacity-0 group-hover/top:opacity-100 disabled:opacity-0 mr-3 px-2 py-0.5 text-xs text-brand-400 hover:bg-brand-500/10 rounded-md transition-all"
                          >
                            Practice ▸
                          </button>
                        </div>
                        {tOpen && (
                          <div className="pl-12 pr-4 pb-2 space-y-1.5 pt-1">
                            {topic.subtopics.map(sub => {
                              const subPath = `${section.name} › ${topic.name} › ${sub.name}`
                              const subPct = sub.total > 0 ? Math.round((sub.correct / sub.total) * 100) : 0
                              const color = subPct === 100 ? 'text-green-400' : subPct > 0 ? 'text-yellow-400' : 'text-gray-500'
                              const Icon = subPct === 100 ? CheckCircle : subPct > 0 ? XCircle : Circle
                              return (
                                <div key={sub.name} className="flex items-center gap-2 py-1.5 px-3 rounded-lg hover:bg-gray-800/30 group">
                                  <Icon size={13} className={clsx(color, 'flex-shrink-0')} />
                                  <span className="text-xs text-gray-300 flex-1 flex items-center gap-1.5">
                                    {sub.name}
                                    {sub.hasPassages && (
                                      <span title="Contains passage-based questions" className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium text-brand-300 bg-brand-500/10 border border-brand-500/30">
                                        <BookOpen size={9} /> Passage
                                      </span>
                                    )}
                                  </span>
                                  <span className="text-xs text-gray-600">{sub.correct}/{sub.total}</span>
                                  <button
                                    onClick={() => startQuiz('practice', subPath)}
                                    className="opacity-0 group-hover:opacity-100 text-xs text-brand-400 hover:text-brand-300 transition-all"
                                  >
                                    Practice →
                                  </button>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
