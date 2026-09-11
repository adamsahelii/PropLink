import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  IoAddOutline, IoTrashOutline, IoCreateOutline,
  IoHomeOutline, IoEyeOffOutline, IoEyeOutline,
} from 'react-icons/io5'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import PropertyCard from '../components/PropertyCard'

// Derives a single display status from the listing's status field.
function displayStatus(listing) {
  if (listing.status === 'inactive') return 'inactive'
  if (listing.status === 'rented')   return 'rented'
  if (listing.status === 'sold')     return 'sold'
  return 'active'
}

const STATUS_STYLES = {
  active:   'bg-forest/15 text-forest',
  inactive: 'bg-charcoal/15 text-charcoal/70',
  rented:   'bg-blue-100 text-blue-600',
  sold:     'bg-charcoal/15 text-charcoal',
}

const STATUS_LABELS = {
  active:   'Active',
  inactive: 'Inactive',
  rented:   'Rented',
  sold:     'Sold',
}

const TABS = [
  { key: 'all',      label: 'All' },
  { key: 'active',   label: 'Active' },
  { key: 'inactive', label: 'Inactive' },
  { key: 'rented',   label: 'Rented' },
  { key: 'sold',     label: 'Sold' },
]

export default function MyPropertiesPage() {
  const { token } = useAuth()

  const [listings, setListings] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [tab,      setTab]      = useState('all')

  const fetchListings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch('/api/listings/my', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) setListings(data.listings)
      else setError('Could not load your properties.')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetchListings() }, [fetchListings])

  async function handleToggleStatus(id, currentStatus) {
    const goingInactive = currentStatus !== 'inactive'
    const nextStatus = goingInactive ? 'inactive' : 'available'
    const msg = goingInactive
      ? 'Deactivate this listing? It will be hidden from buyers.'
      : 'Reactivate this listing? It will be visible to buyers again.'
    if (!window.confirm(msg)) return
    try {
      const res  = await fetch(`/api/listings/${id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ status: nextStatus }),
      })
      const data = await res.json()
      if (data.success) {
        setListings(prev => prev.map(l => l._id === id ? data.listing : l))
      } else {
        alert(data.message ?? 'Could not update the listing.')
      }
    } catch {
      alert('Network error. Please try again.')
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this listing? This cannot be undone.')) return
    try {
      const res  = await fetch(`/api/listings/${id}`, {
        method:  'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) setListings(prev => prev.filter(l => l._id !== id))
      else alert(data.message ?? 'Could not delete the listing.')
    } catch {
      alert('Network error. Please try again.')
    }
  }

  const counts = listings.reduce((acc, l) => {
    const s = displayStatus(l)
    acc[s] = (acc[s] || 0) + 1
    return acc
  }, {})
  counts.all = listings.length

  const visible = tab === 'all'
    ? listings
    : listings.filter(l => displayStatus(l) === tab)

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />

      {/* ── Dark forest hero ─────────────────────────────────────────────────── */}
      <section
        className="relative pt-24 pb-28 px-4 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #07201A 0%, #0a2d22 55%, #0F3D2E 100%)' }}
      >
        {/* Gold grid texture */}
        <div
          className="absolute inset-0 opacity-[0.022] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(#C9A24D 1px, transparent 1px), linear-gradient(90deg, #C9A24D 1px, transparent 1px)',
            backgroundSize: '52px 52px',
          }}
        />

        {/* Decorative rings */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full border border-gold/12 pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full border border-white/6 pointer-events-none" />

        {/* Ghost watermark */}
        <div
          className="absolute right-[-1%] bottom-8 font-serif font-bold uppercase select-none pointer-events-none"
          style={{
            fontSize: 'clamp(80px, 14vw, 200px)',
            lineHeight: 1,
            color: '#ffffff',
            opacity: 0.03,
            letterSpacing: '-0.02em',
          }}
          aria-hidden="true"
        >
          MINE
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="h-px w-8 bg-gold/50" />
              <p className="section-label text-gold/80">Owner Workspace</p>
              <div className="h-px w-8 bg-gold/50" />
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white font-bold leading-tight mb-3">
              My Properties
            </h1>
            <p className="text-white/50 text-sm">
              {!loading && listings.length > 0
                ? `Managing ${listings.length} propert${listings.length === 1 ? 'y' : 'ies'}`
                : 'Manage everything you\u2019ve listed on PropLink'}
            </p>

            <div className="mt-7">
              <Link
                to="/add-residence"
                className="btn-gold inline-flex items-center gap-2 text-sm py-3 px-7 rounded-full !tracking-widest uppercase"
              >
                <IoAddOutline className="w-5 h-5" />
                Add Residence
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Tabs + grid ──────────────────────────────────────────────────────── */}
      <section className="py-12 px-6 sm:px-10 lg:px-16 min-h-[50vh]">
        <div className="max-w-7xl mx-auto">

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-10 border-b border-forest/10">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`relative px-4 py-3 text-sm font-medium transition-colors ${
                  tab === key ? 'text-forest' : 'text-charcoal/50 hover:text-forest'
                }`}
              >
                {label}
                {counts[key] > 0 && (
                  <span className={`ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    tab === key ? 'bg-forest/15 text-forest' : 'bg-charcoal/8 text-charcoal/50'
                  }`}>
                    {counts[key]}
                  </span>
                )}
                {tab === key && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Body */}
          {loading ? (
            <div className="text-center text-charcoal/50 py-20">Loading your properties...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-20">{error}</div>
          ) : visible.length === 0 ? (
            <EmptyState tab={tab} />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {visible.map((listing, i) => {
                const s = displayStatus(listing)
                return (
                  <div key={listing._id} className="relative">
                    <span className={`absolute z-10 top-4 left-1/2 -translate-x-1/2 text-[10px] font-semibold
                                      uppercase tracking-widest px-3 py-1.5 rounded-full shadow ${STATUS_STYLES[s]}`}>
                      {STATUS_LABELS[s]}
                    </span>

                    <PropertyCard property={listing} index={i} />

                    {/* Owner actions */}
                    <div className="flex gap-2 mt-3">
                      <Link
                        to={`/edit-residence/${listing._id}`}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium
                                   text-forest border border-forest/20 rounded-full py-2 hover:bg-forest/5 transition-colors"
                      >
                        <IoCreateOutline className="w-4 h-4" /> Edit
                      </Link>
                      <button
                        onClick={() => handleToggleStatus(listing._id, listing.status)}
                        className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium
                                    rounded-full py-2 transition-colors border ${
                          listing.status === 'inactive'
                            ? 'text-forest border-forest/20 hover:bg-forest/5'
                            : 'text-charcoal/60 border-charcoal/20 hover:bg-charcoal/5'
                        }`}
                      >
                        {listing.status === 'inactive'
                          ? <><IoEyeOutline className="w-4 h-4" /> Activate</>
                          : <><IoEyeOffOutline className="w-4 h-4" /> Deactivate</>}
                      </button>
                      <button
                        onClick={() => handleDelete(listing._id)}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium
                                   text-red-500 border border-red-200 rounded-full py-2 hover:bg-red-50 transition-colors"
                      >
                        <IoTrashOutline className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

function EmptyState({ tab }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-20"
    >
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-forest/8 text-forest mb-5">
        <IoHomeOutline className="w-7 h-7" />
      </div>
      <p className="text-charcoal/60 mb-6">
        {tab === 'all'
          ? "You haven't added any properties yet."
          : `No ${tab} properties.`}
      </p>
      {tab === 'all' && (
        <Link to="/add-residence" className="btn-gold text-sm py-3 px-7 rounded-full !tracking-widest uppercase">
          Add Your First Residence
        </Link>
      )}
    </motion.div>
  )
}