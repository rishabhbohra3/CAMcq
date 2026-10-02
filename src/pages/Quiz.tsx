import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronRight, CheckCircle, XCircle, Trophy } from 'lucide-react'
import { fetchCourse } from '../api/courses'
import { useProgress } from '../hooks/useProgress'
import { useQuiz } from '../hooks/useQuiz'
import { QuestionCard } from '../components/QuestionCard'
import { PassagePanel } from '../components/PassagePanel'
import { XPBar } from '../components/XPBar'
import { updateSM2, defaultProgress } from '../lib/spaced'
import type { Course, QuizMode } from '../types'

function ExamSummary({
  state, queue,
}: {
  state: ReturnType<typeof useQuiz>['state']
  queue: ReturnType<typeof useQuiz>['state']['queue']
}) {
  const nav = useNavigate()
  let correct = 0
  for (const q of queue) {
    if (state.examAnswers[q.id] === q.answer) correct++
  }
  const pct = queue.length > 0 ? Math.round((correct / queue.length) * 100) : 0

  return (
    <div className="max-w-xl mx-auto px-4 py-12 text-center">
      <Trophy size={56} className="text-yellow-400 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-white mb-1">Exam Complete!</h2>
      <p className="text-gray-400 mb-6">You scored {correct} / {queue.length}</p>
      <div className="text-5xl font-black mb-8" style={{ color: pct >= 70 ? '#22c55e' : pct >= 40 ? '#eab308' : '#ef4444' }}>
        {pct}%
      </div>
      <div className="space-y-2 text-left mb-8 max-h-80 overflow-y-auto pr-1">
        {queue.map((q, i) => {
          const chosen = state.examAnswers[q.id]
          const ok = chosen === q.answer
          return (
            <div key={q.id} className={`flex items-start gap-3 p-3 rounded-xl border text-sm ${ok ? 'border-green-800 bg-green-900/20' : 'border-red-800 bg-red-900/20'}`}>
              {ok ? <CheckCircle size={15} className="text-green-400 flex-shrink-0 mt-0.5" /> : <XCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />}
              <div>
                <p className="text-gray-200 line-clamp-2">{i + 1}. {q.question}</p>
                {!ok && <p className="text-xs text-gray-400 mt-1">Correct: {q.options[q.answer]}</p>}
              </div>
            </div>
          )
        })}
      </div>
      <button onClick={() => nav(-1)} className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-medium transition-colors">
        Back to Course
      </button>
    </div>
  )
}

function QuizSession({ course, mode, filter, slug }: { course: Course; mode: QuizMode; filter?: string; slug: string }) {
  const nav = useNavigate()
  const [showExplanation, setShowExplanation] = useState(true)
  const { progress, getQ, updateQ, addXP, recordSession } = useProgress(slug)
  const { state, current, select, confirm, next, totalQ } = useQuiz(course, mode, progress, filter)

  const qProgress = current ? getQ(current.id) : defaultProgress()

  useEffect(() => {
    if (!current || !state.confirmed || mode === 'exam') return
    const correct = state.selectedOption === current.answer
    const updated = updateSM2({ ...qProgress, attempts: qProgress.attempts + 1 }, correct)
    updateQ(current.id, { ...updated, status: correct ? 'correct' : 'incorrect', lastAnswer: state.selectedOption })
    if (correct) addXP(10)
  }, [state.confirmed])

  useEffect(() => {
    if (!state.done || mode === 'exam') return
    recordSession(mode, state.sessionCorrect, state.sessionTotal)
  }, [state.done])

  useEffect(() => {
    if (!state.done || mode !== 'exam') return
    for (const q of state.queue) {
      const chosen = state.examAnswers[q.id] ?? null
      const correct = chosen === q.answer
      const qp = progress?.questions[q.id] ?? defaultProgress()
      const updated = updateSM2({ ...qp, attempts: qp.attempts + 1 }, correct)
      updateQ(q.id, { ...updated, status: correct ? 'correct' : 'incorrect', lastAnswer: chosen })
    }
    const correctCount = state.queue.filter(q => state.examAnswers[q.id] === q.answer).length
    addXP(correctCount * 5)
    recordSession(mode, correctCount, state.queue.length)
  }, [state.done])

  if (totalQ === 0) return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <p className="text-gray-400 mb-4">{mode === 'review' ? 'No questions to review — great job!' : 'No questions found.'}</p>
      <button onClick={() => nav(-1)} className="px-4 py-2 bg-gray-800 rounded-xl text-sm text-white">Go back</button>
    </div>
  )

  if (state.done && mode === 'exam') return <ExamSummary state={state} queue={state.queue} />

  if (state.done) return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <Trophy size={48} className="text-yellow-400 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-white mb-2">Session Complete!</h2>
      <p className="text-gray-400 mb-6">{state.sessionCorrect} / {state.sessionTotal} correct</p>
      <button onClick={() => nav(-1)} className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-medium transition-colors">
        Back to Course
      </button>
    </div>
  )

  const progressPct = Math.round((state.currentIndex / totalQ) * 100)
  const hasPassage = !!current?.passage
  const containerClass = hasPassage ? 'max-w-6xl mx-auto px-4 py-6' : 'max-w-2xl mx-auto px-4 py-6'

  const questionAndControls = current && (
    <>
      <QuestionCard
        question={current} qProgress={qProgress}
        selectedOption={state.selectedOption} confirmed={state.confirmed} mode={mode}
        onSelect={select}
        onBookmark={() => updateQ(current.id, { bookmarked: !qProgress.bookmarked })}
        onNote={note => updateQ(current.id, { note })}
        showExplanation={showExplanation}
      />
      <div className="flex items-center justify-end mt-4">
        {!state.confirmed ? (
          <button onClick={confirm} disabled={state.selectedOption === null}
            className="ml-auto px-5 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors">
            Confirm
          </button>
        ) : (
          <button onClick={next}
            className="ml-auto flex items-center gap-1.5 px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-sm font-medium transition-colors">
            Next <ChevronRight size={15} />
          </button>
        )}
      </div>
    </>
  )

  return (
    <div className={containerClass}>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => nav(-1)} className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={16} /> Exit
        </button>
        <div className="flex items-center gap-3">
          {progress && <XPBar xp={progress.xp} streak={state.sessionStreak} />}
          <span className="text-xs text-gray-500 bg-gray-800 px-2.5 py-1 rounded-full">{state.currentIndex + 1} / {totalQ}</span>
          <span className="text-xs text-gray-500 capitalize bg-gray-800 px-2.5 py-1 rounded-full">{mode}</span>
        </div>
      </div>
      <div className="w-full h-1 bg-gray-800 rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
      </div>

      {hasPassage && current ? (
        <div className="md:grid md:grid-cols-2 md:gap-6">
          <PassagePanel
            key={current.passageId}
            passage={current.passage!}
            title={current.passageTitle}
            index={current.passageIndex ?? 0}
            total={current.passageTotal ?? 1}
          />
          <div>{questionAndControls}</div>
        </div>
      ) : (
        questionAndControls
      )}
    </div>
  )
}

export function QuizPage() {
  const { slug = '' } = useParams()
  const [searchParams] = useSearchParams()
  const mode = (searchParams.get('mode') || 'practice') as QuizMode
  const filter = searchParams.get('filter') || undefined

  const [course, setCourse] = useState<Course | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchCourse(slug).then(setCourse).catch(() => setError(true))
  }, [slug])

  if (error) return <div className="flex items-center justify-center h-64 text-red-400">Course not found.</div>
  if (!course) return <div className="flex items-center justify-center h-64 text-gray-500">Loading…</div>

  return <QuizSession course={course} mode={mode} filter={filter} slug={slug} />
}
