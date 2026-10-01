import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { IoSearchOutline } from 'react-icons/io5'

// Map the AI's number to your existing price buckets (nearest bucket).
function priceToBucket({ minPrice, maxPrice }) {
  const n = Number.isFinite(maxPrice) ? maxPrice
          : Number.isFinite(minPrice) ? minPrice
          : null
  if (n === null) return ''
  if (n < 100000)  return 'Under $100K'
  if (n < 300000)  return '$100K – $300K'
  if (n < 700000)  return '$300K – $700K'
  return '$700K+'
}

export default function AiSearchBar() {
  const [, setSearchParams] = useSearchParams()
  const [text, setText]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [applied, setApplied] = useState(null) // what we understood, for feedback

  const run = async () => {
    const query = text.trim()
    if (!query || loading) return
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

      // Write AI filters into the URL — same params your buttons use.
      setSearchParams(prev => {
        const next = new URLSearchParams(prev)
        // clear old filter values first
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
    } catch {
      // AI down / network blocked → tell the user to use the buttons
      setError('Smart search is unavailable right now — please use the filters below.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-7">
      <div className="flex items-center gap-3 border-b-2 border-gold/60 focus-within:border-gold py-2 transition-colors">
        <IoSearchOutline className="w-4 h-4 text-gold shrink-0" />
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') run() }}
          placeholder='Try: "apartment in Beirut to buy under 200000"'
          className="flex-1 text-sm text-charcoal placeholder-charcoal/35 outline-none bg-transparent min-w-0"
        />
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={run}
          disabled={loading}
          className="btn-gold rounded-full !px-5 !py-2 !text-xs shrink-0 disabled:opacity-50"
        >
          {loading ? 'Thinking…' : 'Ask AI'}
        </motion.button>
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      )}

      {applied && !error && (
        <p className="mt-2 text-xs text-forest/70">
          Understood:{' '}
          {[
            applied.propertyType,
            applied.purpose === 'sale' ? 'for sale' : applied.purpose,
            applied.city,
            Number.isFinite(applied.maxPrice) ? `up to $${applied.maxPrice.toLocaleString()}` : null,
          ].filter(Boolean).join(' · ') || 'your search'}
        </p>
      )}
    </div>
  )
}