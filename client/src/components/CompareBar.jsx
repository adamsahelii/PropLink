import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { IoGitCompareOutline } from 'react-icons/io5'
import { useCompare } from '../context/CompareContext'

export default function CompareBar() {
  const { compareIds } = useCompare()
  const location = useLocation()

  const visible = compareIds.length > 0 && location.pathname !== '/compare'

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-8 z-50"
        >
          <Link
            to="/compare"
            className="inline-flex items-center gap-2 pl-4 pr-2 py-2 rounded-full bg-gold hover:bg-gold/90 text-white text-xs font-semibold tracking-wide shadow-xl shadow-black/20 transition-all duration-200 hover:-translate-y-0.5"
          >
            <IoGitCompareOutline className="w-4 h-4" />
            Compare
            <span className="min-w-[20px] h-5 px-1.5 inline-flex items-center justify-center rounded-full bg-white text-gold text-[11px] font-bold">
              {compareIds.length}
            </span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  )
}