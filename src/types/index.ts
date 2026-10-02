export interface Question {
  id: string
  question: string
  options: string[]
  answer: number
  explanation?: string
}

export interface Passage {
  id: string
  title?: string
  passage: string
  questions: Question[]
}

export interface Subtopic {
  name: string
  questions?: Question[]
  passages?: Passage[]
}

export interface Topic {
  name: string
  subtopics: Subtopic[]
}

export interface Section {
  name: string
  topics: Topic[]
}

export interface Course {
  slug: string
  title: string
  description?: string
  sections: Section[]
}

export interface CourseMeta {
  slug: string
  title: string
  description?: string
  totalQuestions: number
}

export type QuestionStatus = 'unanswered' | 'correct' | 'incorrect'
export type QuizMode = 'practice' | 'exam' | 'review'

export interface QuestionProgress {
  status: QuestionStatus
  attempts: number
  lastAnswer: number | null
  lastSeen: string | null
  interval: number
  easeFactor: number
  bookmarked: boolean
  note: string
}

export interface SessionRecord {
  date: string
  mode: QuizMode
  correct: number
  total: number
  topicFilter?: string
}

export interface CourseProgress {
  courseId: string
  xp: number
  streak: number
  questions: Record<string, QuestionProgress>
  sessions: SessionRecord[]
}

export interface QuizQuestion extends Question {
  courseSlug: string
  sectionName: string
  topicName: string
  subtopicName: string
  passage?: string
  passageId?: string
  passageTitle?: string
  passageIndex?: number
  passageTotal?: number
}

export interface QuizState {
  mode: QuizMode
  queue: QuizQuestion[]
  currentIndex: number
  selectedOption: number | null
  confirmed: boolean
  sessionCorrect: number
  sessionTotal: number
  sessionStreak: number
  done: boolean
  examAnswers: Record<string, number | null>
}
