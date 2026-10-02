import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb } from 'lucide-react'

interface Props {
  explanation: string
  visible: boolean
}

export function ExplanationPanel({ explanation, visible }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.25 }}
          className="mt-4 p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5"
        >
          <div className="flex items-start gap-2">
            <Lightbulb size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-300 leading-relaxed">{explanation}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
