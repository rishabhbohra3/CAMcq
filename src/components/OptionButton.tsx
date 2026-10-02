import { clsx } from 'clsx'
import { CheckCircle, XCircle } from 'lucide-react'

interface Props {
  index: number
  label: string
  selected: boolean
  confirmed: boolean
  isCorrect: boolean
  onClick: () => void
}

const letters = ['A', 'B', 'C', 'D', 'E']

export function OptionButton({ index, label, selected, confirmed, isCorrect, onClick }: Props) {
  const showResult = confirmed
  const isWrong = showResult && selected && !isCorrect
  const isRight = showResult && isCorrect

  return (
    <button
      onClick={onClick}
      disabled={confirmed}
      className={clsx(
        'w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
        !showResult && !selected && 'border-gray-700 bg-gray-800/60 hover:border-brand-500 hover:bg-gray-800',
        !showResult && selected && 'border-brand-500 bg-brand-500/10',
        isRight && 'border-green-500 bg-green-500/15 animate-pop-in',
        isWrong && 'border-red-500 bg-red-500/15 animate-shake',
        showResult && !selected && !isCorrect && 'border-gray-700 bg-gray-900/40 opacity-50',
      )}
    >
      <span className={clsx(
        'flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold',
        !showResult && !selected && 'bg-gray-700 text-gray-300',
        !showResult && selected && 'bg-brand-500 text-white',
        isRight && 'bg-green-500 text-white',
        isWrong && 'bg-red-500 text-white',
        showResult && !selected && !isCorrect && 'bg-gray-800 text-gray-500',
      )}>
        {letters[index]}
      </span>
      <span className="flex-1 text-sm leading-relaxed">{label}</span>
      {showResult && isRight && <CheckCircle size={18} className="text-green-400 flex-shrink-0" />}
      {isWrong && <XCircle size={18} className="text-red-400 flex-shrink-0" />}
    </button>
  )
}
