import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react'

interface Props {
  passage: string
  title?: string
  index: number
  total: number
}

export function PassagePanel({ passage, title, index, total }: Props) {
  const [openMobile, setOpenMobile] = useState(true)

  return (
    <>
      {/* Mobile: collapsible card on top */}
      <div className="md:hidden bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden mb-4">
        <button
          onClick={() => setOpenMobile(v => !v)}
          className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-800/50 transition-colors"
        >
          <BookOpen size={16} className="text-brand-400" />
          <span className="text-sm font-medium text-white flex-1 text-left">
            {title || 'Passage'}
            <span className="ml-2 text-xs text-gray-500 font-normal">Q {index + 1} of {total}</span>
          </span>
          {openMobile ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
        </button>
        <AnimatePresence>
          {openMobile && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="px-4 pb-4"
            >
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                {passage}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop: sticky side panel */}
      <div className="hidden md:flex flex-col bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden md:sticky md:top-20 max-h-[calc(100vh-6rem)]">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800 bg-gray-900/95 backdrop-blur">
          <BookOpen size={16} className="text-brand-400 flex-shrink-0" />
          <span className="text-sm font-medium text-white flex-1 truncate">
            {title || 'Passage'}
          </span>
          <span className="text-xs text-gray-500 flex-shrink-0">Q {index + 1} of {total}</span>
        </div>
        <div className="overflow-y-auto px-4 py-4 flex-1">
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
            {passage}
          </p>
        </div>
      </div>
    </>
  )
}
