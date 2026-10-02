import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Zap, Clock, ChevronRight, FolderOpen } from 'lucide-react'
import { listCourses } from '../api/courses'
import { loadProgress } from '../api/progress'
import { ProgressRing } from '../components/ProgressRing'
import type { CourseMeta, CourseProgress } from '../types'

interface CourseCard extends CourseMeta {
  progress: CourseProgress | null
}

export function Dashboard() {
  const [cards, setCards] = useState<CourseCard[]>([])
  const [loading, setLoading] = useState(true)
  const nav = useNavigate()

  useEffect(() => {
    listCourses().then(async metas => {
      const withProgress = await Promise.all(
        metas.map(async m => ({ ...m, progress: await loadProgress(m.slug) }))
      )
      setCards(withProgress)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  function pct(card: CourseCard) {
    if (!card.progress || card.totalQuestions === 0) return 0
    const answered = Object.values(card.progress.questions).filter(q => q.status !== 'unanswered').length
    return Math.round((answered / card.totalQuestions) * 100)
  }

  function lastStudied(card: CourseCard) {
    if (!card.progress?.sessions.length) return null
    return new Date(card.progress.sessions[0].date).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading courses…
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Your Courses</h1>
        <p className="text-gray-400">Drop a JSON file into <code className="text-brand-400 bg-gray-800 px-1 rounded">data/questions/</code> to add a course.</p>
      </div>

      {cards.length === 0 ? (
        <div className="border-2 border-dashed border-gray-700 rounded-2xl p-16 text-center">
          <FolderOpen size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg font-medium mb-2">No courses yet</p>
          <p className="text-gray-600 text-sm">Add a <code>.json</code> file to the <code>data/questions/</code> folder and refresh.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map(card => {
            const p = pct(card)
            const xp = card.progress?.xp ?? 0
            const last = lastStudied(card)
            return (
              <button
                key={card.slug}
                onClick={() => nav(`/course/${card.slug}`)}
                className="bg-gray-900 border border-gray-800 hover:border-brand-500 rounded-2xl p-5 text-left transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-brand-500/10 rounded-xl">
                    <BookOpen size={20} className="text-brand-400" />
                  </div>
                  <ProgressRing value={p} size={44} />
                </div>
                <h2 className="font-semibold text-white text-sm leading-tight mb-1 group-hover:text-brand-400 transition-colors">
                  {card.title}
                </h2>
                {card.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{card.description}</p>}
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                  <span>{card.totalQuestions} questions</span>
                  <span className="text-brand-400 font-medium">{p}%</span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Zap size={12} className="text-yellow-400" />{xp} XP</span>
                    {last && <span className="flex items-center gap-1"><Clock size={12} />{last}</span>}
                  </div>
                  <ChevronRight size={14} className="text-gray-600 group-hover:text-brand-400 transition-colors" />
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
