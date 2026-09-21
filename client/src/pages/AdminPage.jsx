import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import {
  IoCheckmarkCircleOutline, IoCloseCircleOutline, IoLocationOutline,
  IoBedOutline, IoWaterOutline, IoResizeOutline, IoPersonOutline,
  IoTimeOutline,
} from 'react-icons/io5'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const EASE = [0.25, 0.46, 0.45, 0.94]

function formatPrice(price, purpose) {
  if (!price && price !== 0) return 'Price on request'
  return `$${price.toLocaleString()}${purpose === 'rent' ? ' /mo' : ''}`
}

export default function AdminPage() {
  const { token } = useAuth()

  const [listings, setListings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(false)
  const [busyId, setBusyId]     = useState(null) // id currently being approved/rejected

  // ── Fetch the pending queue ────────────────────────────────────────────────
  const loadPending = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/listings/admin/pending', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) setListings(data.listings)
      else setError(true)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { loadPending() }, [loadPending])

  // ── Approve / Reject ───────────────────────────────────────────────────────
  async function handleDecision(id, action) {
    setBusyId(id)
    try {
      const body = action === 'reject'
        ? JSON.stringify({ reason: 'Does not meet listing guidelines.' })
        : undefined
      const res = await fetch(`/api/listings/${id}/${action}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body,
      })
      const data = await res.json()
      if (data.success) {
        // Remove the decided listing from the queue without a full refetch
        setListings(prev => prev.filter(l => l._id !== id))
      } else {
        alert(data.message || 'Something went wrong.')
      }
    } catch {
      alert('Network error. Please try again.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />

      <section className="max-w-5xl mx-auto px-6 pt-28 pb-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-6 bg-gold/45" />
            <p className="section-label">Admin</p>
          </div>
          <h1 className="section-title mb-2">Review Queue</h1>
          <p className="text-charcoal/45 text-sm">
            Listings awaiting approval, oldest first. Approve to publish, or reject to send back to the owner.
          </p>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-2 border-forest border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-20">
            <p className="text-charcoal/55 text-sm mb-4">Couldn’t load the review queue.</p>
            <button onClick={loadPending} className="btn-outline-forest text-xs py-2.5 px-6">Try Again</button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && listings.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <IoCheckmarkCircleOutline className="w-12 h-12 text-forest/40 mx-auto mb-4" />
            <p className="font-serif text-xl text-forest font-bold mb-1">All caught up</p>
            <p className="text-charcoal/45 text-sm">There are no listings waiting for review.</p>
          </motion.div>
        )}

        {/* Queue */}
        {!loading && !error && listings.length > 0 && (
          <div className="flex flex-col gap-5">
            <AnimatePresence mode="popLayout">
              {listings.map((listing, i) => (
                <motion.div
                  key={listing._id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: i * 0.04, duration: 0.4, ease: EASE }}
                  className="bg-white rounded-[24px] shadow-sm border border-black/[0.04] overflow-hidden flex flex-col sm:flex-row"
                >
                  {/* Thumbnail */}
                  <div className="sm:w-56 h-44 sm:h-auto shrink-0 bg-ivory">
                    {listing.images?.[0]?.url ? (
                      <img
                        src={listing.images[0].url}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-charcoal/25 text-xs">
                        No photo provided
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex-1 p-5 flex flex-col">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="bg-gold/12 text-gold text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full">
                          {listing.purpose === 'rent' ? 'For Rent' : 'For Sale'}
                        </span>
                        <span className="ml-2 text-charcoal/40 text-[10px] uppercase tracking-wider capitalize">
                          {listing.propertyType}
                        </span>
                      </div>
                      <p className="font-serif text-lg text-forest font-bold shrink-0">
                        {formatPrice(listing.price, listing.purpose)}
                      </p>
                    </div>

                    <h3 className="font-serif text-lg text-charcoal font-bold leading-snug mb-1.5">
                      {listing.title}
                    </h3>

                    <div className="flex items-center gap-1.5 text-charcoal/45 text-xs mb-3">
                      <IoLocationOutline className="w-3.5 h-3.5 text-gold/70" />
                      <span>{[listing.location?.area, listing.location?.city].filter(Boolean).join(', ')}</span>
                    </div>

                    {/* Mini specs */}
                    <div className="flex items-center gap-4 text-charcoal/50 text-xs mb-3">
                      {listing.bedrooms != null && (
                        <span className="flex items-center gap-1"><IoBedOutline className="w-3.5 h-3.5" />{listing.bedrooms}</span>
                      )}
                      {listing.bathrooms != null && (
                        <span className="flex items-center gap-1"><IoWaterOutline className="w-3.5 h-3.5" />{listing.bathrooms}</span>
                      )}
                      {listing.size != null && (
                        <span className="flex items-center gap-1"><IoResizeOutline className="w-3.5 h-3.5" />{listing.size.toLocaleString()} m²</span>
                      )}
                    </div>

                    {/* Owner + submitted time */}
                    <div className="flex items-center gap-4 text-charcoal/38 text-[11px] mb-4">
                      <span className="flex items-center gap-1.5">
                        <IoPersonOutline className="w-3.5 h-3.5" />
                        {listing.ownerId?.name ?? 'Unknown owner'}
                      </span>
                      {listing.createdAt && (
                        <span className="flex items-center gap-1.5">
                          <IoTimeOutline className="w-3.5 h-3.5" />
                          {new Date(listing.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-auto flex items-center gap-3 pt-1">
                      <button
                        onClick={() => handleDecision(listing._id, 'approve')}
                        disabled={busyId === listing._id}
                        className="flex items-center gap-2 text-xs font-semibold px-5 py-2.5 rounded-xl bg-forest text-ivory hover:bg-forest/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <IoCheckmarkCircleOutline className="w-4 h-4" />
                        {busyId === listing._id ? 'Working…' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleDecision(listing._id, 'reject')}
                        disabled={busyId === listing._id}
                        className="flex items-center gap-2 text-xs font-semibold px-5 py-2.5 rounded-xl border border-red-300 text-red-500 hover:bg-red-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <IoCloseCircleOutline className="w-4 h-4" />
                        Reject
                      </button>
                      <Link
                        to={`/listings/${listing.slug}`}
                        className="ml-auto text-xs font-medium text-gold/75 hover:text-gold transition-colors"
                      >
                        Preview →
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      <Footer />
    </div>
  )
}