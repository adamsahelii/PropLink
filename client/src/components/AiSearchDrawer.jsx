import { useState } from 'react'
import { useSearchParams, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { IoSparklesOutline, IoClose, IoSearchOutline } from 'react-icons/io5'

// Example sentences users can click to try.
const EXAMPLES = [
  'Apartment in Beirut to buy under 200000',
  'Land in Batroun for sale',
  'Apartment to rent in Jounieh',
]

// Map the AI's number to your existing price buckets (nearest bucket).
function priceToBucket({ minPrice, maxPrice }) {
  const n = Number.isFinite(maxPrice) ? maxPrice
          : Number.isFinite(minPrice) ? minPrice
          : null
  if (n === null) return ''
  if (n < 100000) return 'Under $100K'
  if (n < 300000) return '$100K – $300K'
  if (n < 700000) return '$300K – $700K'
  return '$700K+'
}

export default function AiSearchDrawer() {
  const [, setSearchParams] = useSearchParams()
  const location = useLocation()
  const [open, setOpen]       = useState(false)
  const [text, setText]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [applied, setApplied] = useState(null)

  const run = async (raw) => {
    const query = (raw ?? text).trim()
    if (!query || loading) return
    setText(query)
    setLoading(true)
    setError('')
    setApplied(null)

    try {
      const res = await fetch('/api/smart-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      if (!res.ok) throw new Error('unavailable')
      const data = await res.json()
      const f = data.filters || {}

      setSearchParams(prev => {
        const next = new URLSearchParams(prev)
        ;['keyword', 'city', 'propertyType', 'purpose', 'price', 'page'].forEach(k => next.delete(k))
        if (f.keyword)      next.set('keyword', f.keyword)
        if (f.city)         next.set('city', f.city)
        if (f.propertyType) next.set('propertyType', f.propertyType)
        if (f.purpose)      next.set('purpose', f.purpose)
        const bucket = priceToBucket(f)
        if (bucket) next.set('price', bucket)
        return next
      })

      setApplied(f)
      // Close shortly after applying so the user sees the listings update.
      setTimeout(() => setOpen(false), 900)
    } catch {
      setError('Smart search is unavailable right now — please use the filters below.')
    } finally {
      setLoading(false)
    }
  }

  if (location.pathname !== '/listings') return null

  return (
    <>
      {/* Floating button (bottom-right) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-6 z-40 flex items-center gap-2 bg-forest text-white rounded-full pl-4 pr-5 py-3 shadow-xl shadow-forest/30"
      >
        <IoSparklesOutline className="w-5 h-5" />
        <span className="text-sm font-semibold">Ask AI</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            {/* Dark overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-40"
            />

            {/* Right drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <IoSparklesOutline className="w-5 h-5 text-gold" />
                  <h3 className="font-serif text-xl text-forest font-bold">Ask AI</h3>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="text-charcoal/40 hover:text-charcoal transition-colors"
                  aria-label="Close"
                >
                  <IoClose className="w-6 h-6" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <p className="text-sm text-charcoal/55 leading-relaxed mb-5">
                  Describe what you're looking for in your own words, and we'll set the filters for you.
                </p>

                {/* Input */}
                <div className="flex items-center gap-2 border-b-2 border-gold/60 focus-within:border-gold py-2 mb-4">
                  <IoSearchOutline className="w-4 h-4 text-gold shrink-0" />
                  <input
                    type="text"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') run() }}
                    placeholder="e.g. apartment in Beirut under 200000"
                    className="flex-1 text-sm text-charcoal placeholder-charcoal/35 outline-none bg-transparent min-w-0"
                    autoFocus
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => run()}
                  disabled={loading}
                  className="btn-gold rounded-full w-full !py-2.5 !text-sm disabled:opacity-50 mb-6"
                >
                  {loading ? 'Thinking…' : 'Search'}
                </motion.button>

                {error && <p className="text-xs text-red-600 mb-4">{error}</p>}

                {applied && !error && (
                  <p className="text-xs text-forest/70 mb-4">
                    Understood:{' '}
                    {[
                      applied.propertyType,
                      applied.purpose === 'sale' ? 'for sale' : applied.purpose,
                      applied.city,
                      Number.isFinite(applied.maxPrice) ? `up to $${applied.maxPrice.toLocaleString()}` : null,
                    ].filter(Boolean).join(' · ') || 'your search'}
                  </p>
                )}

                {/* Example prompts */}
                <p className="text-[10px] font-semibold tracking-[0.15em] text-charcoal/40 uppercase mb-3">
                  Try an example
                </p>
                <div className="flex flex-col gap-2">
                  {EXAMPLES.map(ex => (
                    <button
                      key={ex}
                      onClick={() => run(ex)}
                      disabled={loading}
                      className="text-left text-sm text-charcoal/70 border border-gray-200 hover:border-gold hover:text-forest rounded-xl px-4 py-2.5 transition-colors disabled:opacity-50"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}