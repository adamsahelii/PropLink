import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IoWarningOutline } from 'react-icons/io5'

/**
 * Modal confirmation. Closes on Escape or backdrop click, moves focus to the
 * cancel button on open, and traps Tab inside the dialog while it is showing.
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  busy = false,
  onConfirm,
  onCancel,
}) {
  const panelRef  = useRef(null)
  const cancelRef = useRef(null)

  useEffect(() => {
    if (!open) return

    cancelRef.current?.focus()

    function onKeyDown(e) {
      if (e.key === 'Escape' && !busy) {
        onCancel()
        return
      }
      if (e.key !== 'Tab') return

      // Keep keyboard focus inside the dialog
      const focusables = panelRef.current?.querySelectorAll('button:not([disabled])')
      if (!focusables?.length) return
      const first = focusables[0]
      const last  = focusables[focusables.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, busy, onCancel])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => !busy && onCancel()}
            className="absolute inset-0 bg-charcoal/45 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-message"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative w-full max-w-md bg-white rounded-[26px] shadow-2xl shadow-charcoal/20 border border-black/[0.05] p-7"
          >
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-5">
              <IoWarningOutline className="w-6 h-6 text-red-500" aria-hidden="true" />
            </div>

            <h2 id="confirm-dialog-title" className="font-serif text-xl text-forest font-bold mb-2">
              {title}
            </h2>
            <p id="confirm-dialog-message" className="text-sm text-charcoal/55 leading-relaxed mb-7">
              {message}
            </p>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <button
                ref={cancelRef}
                type="button"
                onClick={onCancel}
                disabled={busy}
                className="px-6 py-3 rounded-full text-sm font-medium text-charcoal/65 border border-black/10 hover:border-forest/35 hover:text-forest transition-colors duration-200 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={busy}
                className="px-6 py-3 rounded-full text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
              >
                {busy ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Deleting…
                  </span>
                ) : (
                  confirmLabel
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
