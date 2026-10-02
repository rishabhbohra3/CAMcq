import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Bookmark, StickyNote } from 'lucide-react'
import { fetchCourse } from '../api/courses'
import { useProgress } from '../hooks/useProgress'
import { defaultProgress } from '../lib/spaced'
import type { Course, QuizQuestion } from '../types'

export function BookmarksPage() {
  const { slug = '' } = useParams()
  const nav = useNavigate()
  const [course, setCourse] = useState<Course | null>(null)
  const { progress, updateQ } = useProgress(slug)

  useEffect(() => {
    fetchCourse(slug).then(setCourse)
  }, [slug])

  const bookmarked: QuizQuestion[] = []
  if (course) {
    for (const section of course.sections) {
      for (const topic of section.topics) {
        for (const sub of topic.subtopics) {
          const meta = { courseSlug: slug, sectionName: section.name, topicName: topic.name, subtopicName: sub.name }
          for (const q of sub.questions ?? []) {
            const qp = progress?.questions[q.id] ?? defaultProgress()
            if (qp.bookmarked) {
              bookmarked.push({ ...q, ...meta })
            }
          }
          for (const p of sub.passages ?? []) {
            const total = p.questions.length
            for (let i = 0; i < p.questions.length; i++) {
              const q = p.questions[i]
              const qp = progress?.questions[q.id] ?? defaultProgress()
              if (qp.bookmarked) {
                bookmarked.push({
                  ...q, ...meta,
                  passage: p.passage, passageId: p.id, passageTitle: p.title,
                  passageIndex: i, passageTotal: total,
                })
              }
            }
          }
        }
      }
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => nav(-1)} className="flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft size={16} /> Back
      </button>
      <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
        <Bookmark size={22} className="text-yellow-400" /> Bookmarked Questions
      </h1>
      <p className="text-gray-400 text-sm mb-6">{bookmarked.length} question{bookmarked.length !== 1 ? 's' : ''} bookmarked</p>
      {bookmarked.length === 0 ? (
        <div className="text-center py-16 text-gray-600">No bookmarks yet. Press <kbd className="bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded text-xs">B</kbd> during a quiz to bookmark a question.</div>
      ) : (
        <div className="space-y-4">
          {bookmarked.map(q => {
            const qp = progress?.questions[q.id] ?? defaultProgress()
            return (
              <div key={q.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="text-xs text-gray-500 mb-2 flex items-center gap-2 flex-wrap">
                  <span>{q.sectionName} › {q.topicName} › {q.subtopicName}</span>
                  {q.passage && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-brand-300 bg-brand-500/10 border border-brand-500/30">
                      📖 {q.passageTitle || 'Passage'}
                    </span>
                  )}
                </div>
                {q.passage && (
                  <details className="mb-3 text-xs text-gray-400 bg-gray-950/40 border border-gray-800 rounded-lg">
                    <summary className="cursor-pointer px-3 py-2 hover:bg-gray-800/30">Show passage</summary>
                    <p className="px-3 pb-3 leading-relaxed whitespace-pre-wrap text-gray-300">{q.passage}</p>
                  </details>
                )}
                <p className="text-sm text-gray-200 mb-3">{q.question}</p>
                <p className="text-xs text-green-400 mb-2">✓ {q.options[q.answer]}</p>
                {qp.note && (
                  <div className="flex items-start gap-2 mt-2 p-2.5 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                    <StickyNote size={13} className="text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-300">{qp.note}</p>
                  </div>
                )}
                <button
                  onClick={() => updateQ(q.id, { bookmarked: false })}
                  className="mt-3 text-xs text-gray-500 hover:text-red-400 transition-colors"
                >
                  Remove bookmark
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
