import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { IoCloseOutline, IoGitCompareOutline, IoTrashOutline, IoAddOutline } from 'react-icons/io5'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useCompare, MAX_COMPARE } from '../context/CompareContext'
import noPhoto from '../assets/no-photo.jpg'

// ── Constants ─────────────────────────────────────────────────────────────────

const EASE = [0.25, 0.46, 0.45, 0.94]

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPrice(price, purpose) {
  if (!price && price !== 0) return null
  return `$${price.toLocaleString()}${purpose === 'rent' ? ' /mo' : ''}`
}

const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : null)

// Each row: how to read the value, how to show it, and whether lower or higher is better
const ROWS = [
  { label: 'Price',      get: l => l.price, format: (v, l) => formatPrice(v, l.purpose), best: 'min', priceRow: true },
  { label: 'Price / m²', get: l => (l.price && l.size ? l.price / l.size : null), format: v => `$${Math.round(v).toLocaleString()}`, best: 'min', priceRow: true },
  { label: 'Purpose',    get: l => l.purpose, format: v => (v === 'rent' ? 'For Rent' : 'For Sale') },
  { label: 'Type',       get: l => l.propertyType, format: cap },
  { label: 'Location',   get: l => [l.location?.area, l.location?.city].filter(Boolean).join(', ') || null, format: v => v },
  { label: 'Area',       get: l => l.size, format: v => `${v.toLocaleString()} m²`, best: 'max' },
  { label: 'Bedrooms',   get: l => l.bedrooms, format: v => v, best: 'max' },
  { label: 'Bathrooms',  get: l => l.bathrooms, format: v => v, best: 'max' },
  { label: 'Status',     get: l => l.status, format: cap },
  { label: 'Listed',     get: l => l.createdAt, format: v => new Date(v).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) },
]

// Returns the best value in a row, or null if there's nothing meaningful to highlight
function getBestValue(row, listings, mixedPurpose) {
  if (!row.best) return null
  if (row.priceRow && mixedPurpose) return null // rent vs sale prices aren't comparable
  const values = listings.map(row.get).filter(v => v != null)
  if (values.length < 2) return null
  const best = row.best === 'min' ? Math.min(...values) : Math.max(...values)
  if (values.every(v => v === best)) return null // all equal, so no winner
  return best
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ComparePage() {
  const { compareIds, removeFromCompare, clearCompare } = useCompare()
  const [listings, setListings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  const idsKey = compareIds.join(',')

  useEffect(() => {
    if (!idsKey) { setListings([]); setLoading(false); return }
    const ctrl = new AbortController()

    fetch(`/api/listings/compare?ids=${idsKey}`, { signal: ctrl.signal })
      .then(r => r.json())
      .then(d => {
        if (d.success) { setListings(d.listings); setError(null) }
        else setError('Could not load properties.')
        setLoading(false)
      })
      .catch(err => {
        if (err.name !== 'AbortError') { setError('Could not load properties.'); setLoading(false) }
      })

    return () => ctrl.abort()
  }, [idsKey])

  // Hide removed properties instantly, without waiting for the refetch
  const shown = listings.filter(l => compareIds.includes(l._id))
  const mixedPurpose = new Set(shown.map(l => l.purpose)).size > 1

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />

      {/* ── Header ───────────────────────────────────────────────────── */}
      <section
        className="pt-32 pb-12 px-6"
        style={{ background: 'linear-gradient(160deg, #061812 0%, #0F3D2E 100%)' }}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-6 bg-gold/45" />
              <p className="text-[10px] font-semibold tracking-[0.22em] text-gold/60 uppercase">Compare</p>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl text-white font-bold">Compare Properties</h1>
            <p className="text-white/40 text-sm mt-2">
              {shown.length > 0
                ? `Comparing ${shown.length} of ${MAX_COMPARE} properties side by side`
                : 'Pick properties to see them side by side'}
            </p>
          </motion.div>

          {shown.length > 0 && (
            <button
              onClick={clearCompare}
              className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/25 text-white/75 text-xs font-semibold hover:bg-white/10 hover:text-white transition-colors duration-200"
            >
              <IoTrashOutline className="w-4 h-4" /> Clear all
            </button>
          )}
        </div>
      </section>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <section className="py-14 px-6">
        <div className="max-w-6xl mx-auto">

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-2 border-forest border-t-transparent rounded-full animate-spin" />
            </div>

          ) : error ? (
            <p className="text-center text-red-500 text-sm py-20">{error}</p>

          ) : shown.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center text-center py-16 gap-4">
              <div className="w-16 h-16 rounded-full bg-forest/7 flex items-center justify-center">
                <IoGitCompareOutline className="w-7 h-7 text-forest" />
              </div>
              <p className="font-serif text-2xl text-forest font-bold">No properties to compare yet</p>
              <p className="text-charcoal/45 text-sm max-w-sm">
                Open any property and click <span className="font-semibold">"Add to comparison table"</span>.
                You can compare up to {MAX_COMPARE} at once.
              </p>
              <Link to="/listings" className="btn-gold text-xs mt-2">Browse Properties</Link>
            </div>

          ) : (
            <>
              {mixedPurpose && (
                <p className="text-xs text-charcoal/50 bg-gold/10 border border-gold/20 rounded-xl px-4 py-3 mb-6">
                  You're comparing properties for rent and for sale, so prices aren't highlighted.
                </p>
              )}

              {/* Table, which scrolls horizontally on small screens */}
              <div className="overflow-x-auto rounded-[24px] bg-white border border-black/[0.05] shadow-sm">
                <table className="w-full border-collapse" style={{ minWidth: 180 + shown.length * 220 }}>
                  <thead>
                    <tr>
                      <th className="w-[180px] sticky left-0 bg-white z-10" />
                      {shown.map(l => (
                        <th key={l._id} className="p-4 align-top text-left font-normal">
                          <div className="relative rounded-2xl overflow-hidden h-36 mb-3">
                            <img
                              src={l.images?.[0]?.url || noPhoto}
                              alt={l.title}
                              className="w-full h-full object-cover"
                              onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = noPhoto }}
                            />
                            <button
                              onClick={() => removeFromCompare(l._id)}
                              title="Remove from comparison"
                              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/55 backdrop-blur-sm text-white flex items-center justify-center hover:bg-red-500 transition-colors duration-150"
                            >
                              <IoCloseOutline className="w-4 h-4" />
                            </button>
                          </div>
                          <Link
                            to={`/listings/${l.slug}`}
                            className="font-serif text-base font-bold text-forest hover:text-gold transition-colors duration-150 line-clamp-2"
                          >
                            {l.title}
                          </Link>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {ROWS.map(row => {
                      const best = getBestValue(row, shown, mixedPurpose)
                      return (
                        <tr key={row.label} className="border-t border-black/5">
                          <td className="sticky left-0 bg-white z-10 px-5 py-4 text-[10px] font-semibold tracking-[0.15em] text-charcoal/40 uppercase">
                            {row.label}
                          </td>
                          {shown.map(l => {
                            const value = row.get(l)
                            const isBest = best != null && value === best
                            return (
                              <td
                                key={l._id}
                                className={`px-4 py-4 text-sm ${isBest ? 'bg-forest/[0.06] text-forest font-semibold' : 'text-charcoal/75'}`}
                              >
                                {value != null ? row.format(value, l) : <span className="text-charcoal/25">—</span>}
                                {isBest && (
                                  <span className="ml-2 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-gold text-white align-middle">
                                    Best
                                  </span>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {shown.length < MAX_COMPARE && (
                <Link
                  to="/listings"
                  className="inline-flex items-center gap-2 mt-6 text-sm font-medium text-gold hover:text-gold-dark transition-colors duration-150"
                >
                  <IoAddOutline className="w-4 h-4" /> Add another property
                </Link>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}