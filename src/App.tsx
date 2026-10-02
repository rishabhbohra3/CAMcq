import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { BookOpen, Github } from 'lucide-react'
import { Dashboard } from './pages/Dashboard'
import { CoursePage } from './pages/Course'
import { QuizPage } from './pages/Quiz'
import { BookmarksPage } from './pages/Bookmarks'

function Header() {
  return (
    <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-white hover:text-brand-400 transition-colors">
          <BookOpen size={20} className="text-brand-400" />
          CAMcq
        </Link>
        <span className="text-xs text-gray-600">Local MCQ Learning</span>
      </div>
    </header>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/course/:slug" element={<CoursePage />} />
            <Route path="/quiz/:slug" element={<QuizPage />} />
            <Route path="/bookmarks/:slug" element={<BookmarksPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
