import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { IoHeartOutline, IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import PropertyCard from '../components/PropertyCard'
import { favoritesApi } from '../utils/api'
import { useFavorites } from '../context/FavoritesContext'
import { staggerContainer } from '../utils/motion'

const LIMIT = 12

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-3xl overflow-hidden animate-pulse shadow-sm">
          <div className="h-60 bg-gray-200" />
          <div className="p-5 space-y-3">
            <div className="h-4 bg-gray-100 rounded-full w-3/4" />
            <div className="h-3 bg-gray-100 rounded-full w-1/2" />
            <div className="mt-4 h-10 bg-gray-100 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center py-24"
    >
      <div className="w-20 h-20 rounded-full bg-forest/[0.07] flex items-center justify-center mx-auto mb-6">
        <IoHeartOutline className="w-8 h-8 text-forest/35" />
      </div>
      <h3 className="font-serif text-2xl text-forest font-bold mb-3">No Saved Properties Yet</h3>
      <p className="text-charcoal/50 text-sm max-w-xs mx-auto leading-relaxed mb-8">
        Tap the heart on any property to save it here for later.
      </p>
      <Link to="/listings" className="btn-gold rounded-full px-8 inline-block">
        Browse Properties
      </Link>
    </motion.div>
  )
}

export default function FavoritesPage() {
  const { isFavorite } = useFavorites()
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    favoritesApi
      .list({ page, limit: LIMIT, signal: controller.signal })
      .then((data) => {
        setItems(data.favorites.map((f) => f.listingId))
        setPages(data.pages || 1)
        setTotal(data.total)
        setLoading(false)
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        setError(err.message)
        setLoading(false)
      })
    return () => controller.abort()
  }, [page])

  // Hide cards the user just unsaved on this page
  const visible = items.filter((l) => isFavorite(l._id))

  const goTo = (p) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section
        className="relative pt-24 pb-16 px-4 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #07201A 0%, #0a2d22 55%, #0F3D2E 100%)' }}
      >
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-px w-8 bg-gold/50" />
            <p className="section-label text-gold/80">Your Collection</p>
            <div className="h-px w-8 bg-gold/50" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white font-bold mb-3">
            Saved Properties
          </h1>
          <p className="text-white/50 text-sm">
            {!loading && total > 0
              ? `${total} saved propert${total === 1 ? 'y' : 'ies'}`
              : 'Properties you love, all in one place'}
          </p>
        </div>
      </section>

      {/* Results */}
      <section className="bg-ivory py-12 px-4 min-h-[50vh]">
        <div className="max-w-7xl mx-auto">
          {loading && <LoadingSkeleton />}

          {error && !loading && (
            <p className="text-center py-20 text-charcoal/50 text-sm">{error}</p>
          )}

          {!loading && !error && visible.length === 0 && <EmptyState />}

          {!loading && !error && visible.length > 0 && (
            <motion.div
              key={page}
              variants={staggerContainer(0.07, 0.05)}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            >
              {visible.map((listing, i) => (
                <PropertyCard key={listing._id} property={listing} index={i} />
              ))}
            </motion.div>
          )}

          {!loading && !error && pages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-14">
              <button
                onClick={() => goTo(page - 1)}
                disabled={page === 1}
                className="w-10 h-10 rounded-full border border-forest/20 flex items-center justify-center text-forest disabled:opacity-30 disabled:pointer-events-none hover:bg-forest hover:text-white transition-all"
              >
                <IoChevronBackOutline className="w-4 h-4" />
              </button>
              <span className="text-sm text-charcoal/60">Page {page} of {pages}</span>
              <button
                onClick={() => goTo(page + 1)}
                disabled={page === pages}
                className="w-10 h-10 rounded-full border border-forest/20 flex items-center justify-center text-forest disabled:opacity-30 disabled:pointer-events-none hover:bg-forest hover:text-white transition-all"
              >
                <IoChevronForwardOutline className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}