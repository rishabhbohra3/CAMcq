import { useState } from 'react'
import { Bookmark, StickyNote } from 'lucide-react'
import { clsx } from 'clsx'

interface Props {
  bookmarked: boolean
  note: string
  onBookmark: () => void
  onNote: (note: string) => void
}

export function BookmarkNote({ bookmarked, note, onBookmark, onNote }: Props) {
  const [showNote, setShowNote] = useState(false)
  const [draft, setDraft] = useState(note)

  return (
    <div className="flex items-start gap-2 mt-3">
      <button
        onClick={onBookmark}
        className={clsx(
          'p-1.5 rounded-lg transition-colors',
          bookmarked ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
        )}
        title="Bookmark"
      >
        <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} />
      </button>
      <button
        onClick={() => setShowNote(v => !v)}
        className={clsx(
          'p-1.5 rounded-lg transition-colors',
          showNote || note ? 'text-blue-400 bg-blue-400/10' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
        )}
        title="Add note"
      >
        <StickyNote size={16} />
      </button>
      {showNote && (
        <textarea
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500 resize-none focus:outline-none focus:border-brand-500"
          rows={2}
          placeholder="Your notes…"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={() => onNote(draft)}
        />
      )}
    </div>
  )
}
