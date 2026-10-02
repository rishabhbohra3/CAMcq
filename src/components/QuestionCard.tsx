import { motion } from 'framer-motion'
import { OptionButton } from './OptionButton'
import { ExplanationPanel } from './ExplanationPanel'
import { BookmarkNote } from './BookmarkNote'
import type { QuizQuestion, QuestionProgress } from '../types'

interface Props {
  question: QuizQuestion
  qProgress: QuestionProgress
  selectedOption: number | null
  confirmed: boolean
  mode: 'practice' | 'exam' | 'review'
  onSelect: (idx: number) => void
  onBookmark: () => void
  onNote: (note: string) => void
  showExplanation?: boolean
}

export function QuestionCard({
  question, qProgress, selectedOption, confirmed, mode,
  onSelect, onBookmark, onNote, showExplanation = false,
}: Props) {
  const showResult = mode !== 'exam' && confirmed

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
    >
      <div className="mb-1 flex items-center gap-2 text-xs text-gray-500">
        <span>{question.sectionName}</span>
        <span>›</span>
        <span>{question.topicName}</span>
        <span>›</span>
        <span>{question.subtopicName}</span>
      </div>
      <p className="text-base font-medium text-gray-100 leading-relaxed mb-5">
        {question.question}
      </p>
      <div className="space-y-2.5">
        {question.options.map((opt, i) => (
          <OptionButton
            key={i}
            index={i}
            label={opt}
            selected={selectedOption === i}
            confirmed={showResult}
            isCorrect={i === question.answer}
            onClick={() => onSelect(i)}
          />
        ))}
      </div>
      {question.explanation && (
        <ExplanationPanel
          explanation={question.explanation}
          visible={showResult && showExplanation && confirmed}
        />
      )}
      <BookmarkNote
        bookmarked={qProgress.bookmarked}
        note={qProgress.note}
        onBookmark={onBookmark}
        onNote={onNote}
      />
    </motion.div>
  )
}
