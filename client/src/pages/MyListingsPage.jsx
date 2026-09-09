import { useState, useEffect } from 'react'
import { Link, useSearchParams, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IoAddOutline, IoHomeOutline, IoRefreshOutline,
  IoAlertCircleOutline, IoCheckmarkCircle,
} from 'react-icons/io5'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Pagination from '../components/Pagination'
import ConfirmDialog from '../components/ConfirmDialog'
import OwnerListingCard from '../components/owner/OwnerListingCard'
import useMyListings from '../hooks/useMyListings'
import { listingsApi } from '../utils/api'
import { staggerContainer } from '../utils/motion'

const PAGE_SIZE = 9
const EASE = [0.25, 0.46, 0.45, 0.94]

// ── Loading skeleton ──────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-3xl overflow-hidden animate-pulse shadow-sm">
          <div className="h-48 bg-gray-200" />
          <div className="p-5 space-y-3">
            <div className="h-5 bg-gray-100 rounded-full w-1/2" />
            <div className="h-4 bg-gray-100 rounded-full w-3/4" />
            <div className="h-3 bg-gray-100 rounded-full w-1/2" />
            <div className="mt-4 h-10 bg-gray-100 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function MyListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
  const { listings, total, pages, loading, error, refetch } = useMyListings({
    page,
    limit: PAGE_SIZE,
  })

  // Success message handed over by the create/edit form via router state
  const [flash, setFlash] = useState(location.state?.flash ?? '')
  const [target, setTarget] = useState(null)       // listing queued for deletion
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // Clear the router state so a refresh doesn't resurrect the message
  useEffect(() => {
    if (location.state?.flash) {
      window.history.replaceState({}, '')
    }
  }, [location.state])

  useEffect(() => {
    if (!flash) return
    const t = setTimeout(() => setFlash(''), 6000)
    return () => clearTimeout(t)
  }, [flash])

  const setPage = (p) => {
    setSearchParams(p > 1 ? { page: String(p) } : {})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDelete() {
    if (!target) return
    setDeleting(true)
    setDeleteError('')

    try {
      await listingsApi.remove(target._id)
      setTarget(null)
      setFlash('Property deleted.')

      // Stepping back a page keeps the view from landing on an empty last page
      if (listings.length === 1 && page > 1) setPage(page - 1)
      else refetch()
    } catch (err) {
      setDeleteError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <section
        className="relative pt-28 pb-14 px-4 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #07201A 0%, #0a2d22 55%, #0F3D2E 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-[0.022] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(#C9A24D 1px, transparent 1px), linear-gradient(90deg, #C9A24D 1px, transparent 1px)',
            backgroundSize: '52px 52px',
          }}
          aria-hidden="true"
        />
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full border border-gold/12 pointer-events-none" aria-hidden="true" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-6"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-gold/50" />
                <p className="section-label text-gold/80">Owner Dashboard</p>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl text-white font-bold leading-tight mb-2">
                My Properties
              </h1>
              <p className="text-white/50 text-sm">
                {loading
                  ? 'Loading your properties…'
                  : total > 0
                    ? `${total} propert${total === 1 ? 'y' : 'ies'} — including those awaiting review`
                    : 'Add your first property to get started'}
              </p>
            </div>

            <Link
              to="/my-listings/new"
              className="btn-gold inline-flex items-center justify-center gap-2 rounded-full text-xs py-3.5 px-7 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-forest-dark"
            >
              <IoAddOutline className="w-4 h-4" aria-hidden="true" />
              Add Property
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <section className="flex-1 bg-ivory py-10 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Flash message */}
          <AnimatePresence>
            {flash && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                role="status"
                className="mb-8 flex items-center gap-3 rounded-2xl bg-forest/[0.07] border border-forest/15 px-5 py-4"
              >
                <IoCheckmarkCircle className="w-5 h-5 text-forest shrink-0" aria-hidden="true" />
                <p className="text-sm text-forest font-medium">{flash}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Delete failure */}
          {deleteError && (
            <div
              role="alert"
              className="mb-8 flex items-center gap-3 rounded-2xl bg-red-50 border border-red-100 px-5 py-4"
            >
              <IoAlertCircleOutline className="w-5 h-5 text-red-500 shrink-0" aria-hidden="true" />
              <p className="text-sm text-red-600">{deleteError}</p>
            </div>
          )}

          {/* Loading */}
          {loading && <LoadingSkeleton />}

          {/* Error + retry */}
          {!loading && error && (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
                <IoAlertCircleOutline className="w-7 h-7 text-red-400" aria-hidden="true" />
              </div>
              <h2 className="font-serif text-2xl text-forest font-bold mb-3">
                Could not load your properties
              </h2>
              <p className="text-charcoal/50 text-sm max-w-sm mx-auto leading-relaxed mb-8">{error}</p>
              <button
                onClick={refetch}
                className="btn-outline-forest inline-flex items-center gap-2 rounded-full text-xs py-3 px-7 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
              >
                <IoRefreshOutline className="w-4 h-4" aria-hidden="true" />
                Try again
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && listings.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 rounded-full bg-forest/[0.07] flex items-center justify-center mx-auto mb-6">
                <IoHomeOutline className="w-8 h-8 text-forest/35" aria-hidden="true" />
              </div>
              <h2 className="font-serif text-2xl text-forest font-bold mb-3">No properties yet</h2>
              <p className="text-charcoal/50 text-sm max-w-xs mx-auto leading-relaxed mb-8">
                List your first property. Our team reviews each submission before it
                appears publicly.
              </p>
              <Link to="/my-listings/new" className="btn-gold inline-flex items-center gap-2 rounded-full px-8">
                <IoAddOutline className="w-4 h-4" aria-hidden="true" />
                Add Property
              </Link>
            </motion.div>
          )}

          {/* Grid */}
          {!loading && !error && listings.length > 0 && (
            <motion.div
              key={page}
              variants={staggerContainer(0.07, 0.04)}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            >
              {listings.map((listing) => (
                <OwnerListingCard
                  key={listing._id}
                  listing={listing}
                  onDelete={(l) => { setDeleteError(''); setTarget(l) }}
                />
              ))}
            </motion.div>
          )}

          {!loading && !error && <Pagination current={page} total={pages} onChange={setPage} />}
        </div>
      </section>

      <Footer />

      <ConfirmDialog
        open={Boolean(target)}
        title="Delete this property?"
        message={
          target
            ? `“${target.title}” will be removed from your dashboard and from public listings. This cannot be undone from here.`
            : ''
        }
        confirmLabel="Delete property"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => { setTarget(null); setDeleteError('') }}
      />
    </div>
  )
}
