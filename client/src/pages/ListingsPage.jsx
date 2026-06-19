import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoSearchOutline,
} from 'react-icons/io5'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import PropertyCard from '../components/PropertyCard'
import LebanonMap from '../components/LebanonMap'
import CityProfiles from '../components/CityProfiles'
import useListings from '../hooks/useListings'
import useMarketData from '../hooks/useMarketData'
import { staggerContainer } from '../utils/motion'

// ── Filter data ───────────────────────────────────────────────────────────────

const CITIES = [
  'Beirut', 'Tripoli', 'Sidon', 'Tyre', 'Zahle', 'Baalbek',
  'Jounieh', 'Jbeil', 'Batroun', 'Akkar', 'Zgharta', 'Hermel',
  'Bcharre', 'Keserwan', 'Metn', 'Baabda', 'Aley', 'Chouf',
  'Nabatieh', 'Jezzine', 'Marjayoun', 'Hasbaya', 'Rachaya',
]

const TYPE_OPTS = [
  { label: 'Apartment', value: 'apartment' },
  { label: 'Land',      value: 'land' },
]

const PURPOSE_OPTS = [
  { label: 'For Rent', value: 'rent' },
  { label: 'For Sale', value: 'sale' },
]

const PRICE_OPTS = [
  { label: 'Under $100K',   value: 'Under $100K' },
  { label: '$100K – $300K', value: '$100K – $300K' },
  { label: '$300K – $700K', value: '$300K – $700K' },
  { label: '$700K+',        value: '$700K+' },
]

const SORT_OPTS = [
  { label: 'Newest First',     value: 'newest' },
  { label: 'Oldest First',     value: 'oldest' },
  { label: 'Price: Low → High', value: 'price-asc' },
  { label: 'Price: High → Low', value: 'price-desc' },
]

// ── Shared dropdown (white-card style, matching SearchBar) ────────────────────

function FilterSelect({ label, value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onOutside = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    const onKey     = e => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onOutside)
    document.addEventListener('keydown',   onKey)
    return () => {
      document.removeEventListener('mousedown', onOutside)
      document.removeEventListener('keydown',   onKey)
    }
  }, [open])

  const selected = options.find(o => o.value === value)

  return (
    <div ref={ref} className="flex flex-col gap-1.5 flex-1 min-w-0 relative">
      <label className="text-[10px] font-semibold tracking-[0.15em] text-forest/72 uppercase">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`flex items-center justify-between w-full border-b py-2 text-sm text-left outline-none cursor-pointer transition-colors duration-200 gap-2 ${
          open ? 'border-gold' : 'border-gray-200 hover:border-forest/30'
        } ${value ? 'text-charcoal' : 'text-charcoal/50'}`}
      >
        <span className="truncate">{selected?.label || placeholder}</span>
        <svg
          className={`w-3 h-3 text-forest/55 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            className="absolute top-full left-0 mt-2 z-50 bg-white rounded-2xl shadow-xl shadow-charcoal/10 border border-black/[0.06] overflow-hidden min-w-full"
          >
            <li>
              <button
                type="button"
                role="option"
                aria-selected={!value}
                onClick={() => { onChange(''); setOpen(false) }}
                className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors duration-150 ${
                  !value
                    ? 'text-forest bg-forest/[0.06] font-semibold'
                    : 'text-charcoal/40 hover:bg-ivory hover:text-forest/70'
                }`}
              >
                {placeholder}
              </button>
            </li>
            <li aria-hidden="true">
              <div className="mx-3 border-t border-gray-100" />
            </li>
            {options.map(opt => (
              <li key={opt.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={value === opt.value}
                  onClick={() => { onChange(opt.value); setOpen(false) }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 ${
                    value === opt.value
                      ? 'text-gold font-semibold bg-gold/[0.07]'
                      : 'text-charcoal/70 hover:bg-ivory hover:text-forest'
                  }`}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── City chip ─────────────────────────────────────────────────────────────────

function CityChip({ label, active, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
        active
          ? 'bg-gold text-white shadow-md shadow-gold/20'
          : 'border border-forest/20 text-charcoal/65 hover:border-gold hover:text-gold'
      }`}
    >
      {label}
    </motion.button>
  )
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-3xl overflow-hidden animate-pulse shadow-sm">
          <div className="h-60 bg-gray-200" />
          <div className="p-5 space-y-3">
            <div className="h-4 bg-gray-100 rounded-full w-3/4" />
            <div className="h-3 bg-gray-100 rounded-full w-1/2" />
            <div className="h-3 bg-gray-100 rounded-full w-2/3" />
            <div className="mt-4 h-10 bg-gray-100 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ onClear, hasFilters }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="text-center py-24"
    >
      <div className="w-20 h-20 rounded-full bg-forest/[0.07] flex items-center justify-center mx-auto mb-6">
        <IoSearchOutline className="w-8 h-8 text-forest/35" />
      </div>
      <h3 className="font-serif text-2xl text-forest font-bold mb-3">No Properties Found</h3>
      <p className="text-charcoal/50 text-sm max-w-xs mx-auto leading-relaxed mb-8">
        {hasFilters
          ? 'Try adjusting your filters to discover more properties.'
          : 'No properties are available right now. Check back soon.'
        }
      </p>
      {hasFilters && (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onClear}
          className="btn-gold rounded-full px-8"
        >
          Clear Filters
        </motion.button>
      )}
    </motion.div>
  )
}

// ── Pagination ────────────────────────────────────────────────────────────────

function PageBtn({ n, current, onClick }) {
  return (
    <button
      onClick={() => onClick(n)}
      className={`w-10 h-10 rounded-full text-sm font-medium transition-all duration-200 ${
        n === current
          ? 'bg-gold text-white shadow-md shadow-gold/25'
          : 'border border-forest/20 text-charcoal/70 hover:border-gold hover:text-gold'
      }`}
    >
      {n}
    </button>
  )
}

function Pagination({ current, total, onChange }) {
  const start = Math.max(1, current - 2)
  const end   = Math.min(total, current + 2)
  const pages = []
  for (let i = start; i <= end; i++) pages.push(i)

  return (
    <div className="flex items-center justify-center gap-2 mt-14">
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className="w-10 h-10 rounded-full border border-forest/20 flex items-center justify-center text-forest disabled:opacity-30 hover:bg-forest hover:text-white hover:border-forest transition-all duration-200 disabled:pointer-events-none"
      >
        <IoChevronBackOutline className="w-4 h-4" />
      </button>

      {start > 1 && (
        <>
          <PageBtn n={1} current={current} onClick={onChange} />
          {start > 2 && <span className="text-charcoal/30 text-sm px-1">…</span>}
        </>
      )}

      {pages.map(n => (
        <PageBtn key={n} n={n} current={current} onClick={onChange} />
      ))}

      {end < total && (
        <>
          {end < total - 1 && <span className="text-charcoal/30 text-sm px-1">…</span>}
          <PageBtn n={total} current={current} onClick={onChange} />
        </>
      )}

      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        className="w-10 h-10 rounded-full border border-forest/20 flex items-center justify-center text-forest disabled:opacity-30 hover:bg-forest hover:text-white hover:border-forest transition-all duration-200 disabled:pointer-events-none"
      >
        <IoChevronForwardOutline className="w-4 h-4" />
      </button>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [localKeyword, setLocalKeyword] = useState(searchParams.get('keyword') || '')

  const city         = searchParams.get('city')         || ''
  const propertyType = searchParams.get('propertyType') || ''
  const purpose      = searchParams.get('purpose')      || ''
  const price        = searchParams.get('price')        || ''
  const sort         = searchParams.get('sort')         || 'newest'
  const keyword      = searchParams.get('keyword')      || ''
  const page         = parseInt(searchParams.get('page') || '1')

  const hasFilters = !!(keyword || city || propertyType || purpose || price)

  const { listings, total, pages, loading, error } = useListings({
    keyword, city, propertyType, purpose, price, sort, page,
  })

  const { cityTotals, loading: marketLoading } = useMarketData()

  const setFilter = (key, value) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      next.delete('page')
      return next
    })
  }

  const clearFilters = () => {
    setLocalKeyword('')
    setSearchParams({ sort: 'newest' })
  }

  const applyKeyword = () => setFilter('keyword', localKeyword.trim())

  const setPage = p => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('page', String(p))
      return next
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ── Dark hero header ─────────────────────────────────────────────────── */}
      <section
        className="relative pt-24 pb-32 px-4 overflow-hidden"
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
          BROWSE
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
              <p className="section-label text-gold/80">Browse Our Collection</p>
              <div className="h-px w-8 bg-gold/50" />
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white font-bold leading-tight mb-3">
              Property Listings
            </h1>
            <p className="text-white/50 text-sm">
              {!loading && total > 0
                ? `${total.toLocaleString()} properties available across Lebanon`
                : 'Discover premium properties across Lebanon'
              }
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Filter card (overlaps hero bottom edge) ──────────────────────────── */}
      <div className="relative z-20 -mt-16 px-4 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="max-w-5xl mx-auto"
        >
          <div className="bg-white/97 backdrop-blur-xl shadow-2xl rounded-[30px] p-7 md:p-9">
            <p className="text-[10px] font-semibold tracking-[0.2em] text-charcoal/55 uppercase mb-6">
              Smart Property Search
            </p>

            {/* Keyword search */}
            <div className="flex items-center gap-3 border-b border-gray-200 focus-within:border-gold hover:border-forest/30 py-2 transition-colors duration-200 mb-7">
              <IoSearchOutline className="w-4 h-4 text-forest/50 shrink-0" />
              <input
                type="text"
                value={localKeyword}
                onChange={e => setLocalKeyword(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') applyKeyword() }}
                placeholder="Search by title, area, keyword..."
                className="flex-1 text-sm text-charcoal placeholder-charcoal/35 outline-none bg-transparent min-w-0"
              />
              {localKeyword && (
                <button
                  onClick={() => { setLocalKeyword(''); setFilter('keyword', '') }}
                  className="text-charcoal/30 hover:text-charcoal/60 transition-colors"
                  aria-label="Clear search"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={applyKeyword}
                className="btn-gold rounded-full !px-5 !py-2 !text-xs shrink-0"
              >
                Search
              </motion.button>
            </div>

            {/* Filter dropdowns */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-5 lg:gap-0">
              <FilterSelect
                label="Location"
                value={city}
                onChange={v => setFilter('city', v)}
                options={CITIES.map(c => ({ label: c, value: c }))}
                placeholder="Any City"
              />
              <div className="hidden lg:block w-px bg-gray-100 self-stretch mx-4" />
              <FilterSelect
                label="Property Type"
                value={propertyType}
                onChange={v => setFilter('propertyType', v)}
                options={TYPE_OPTS}
                placeholder="Any Type"
              />
              <div className="hidden lg:block w-px bg-gray-100 self-stretch mx-4" />
              <FilterSelect
                label="Purpose"
                value={purpose}
                onChange={v => setFilter('purpose', v)}
                options={PURPOSE_OPTS}
                placeholder="Rent or Buy"
              />
              <div className="hidden lg:block w-px bg-gray-100 self-stretch mx-4" />
              <FilterSelect
                label="Price Range"
                value={price}
                onChange={v => setFilter('price', v)}
                options={PRICE_OPTS}
                placeholder="Any Price"
              />
              <div className="hidden lg:block w-px bg-gray-100 self-stretch mx-4" />
              <FilterSelect
                label="Sort By"
                value={sort}
                onChange={v => setFilter('sort', v || 'newest')}
                options={SORT_OPTS}
                placeholder="Newest"
              />

              {hasFilters && (
                <div className="flex items-end lg:ml-5">
                  <button
                    onClick={clearFilters}
                    className="text-xs text-charcoal/45 hover:text-forest transition-colors border-b border-transparent hover:border-forest/30 pb-2 whitespace-nowrap"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── City quick-filter chips ───────────────────────────────────────────── */}
      <div className="bg-ivory border-b border-forest/[0.07] py-5 px-4">
        <div className="max-w-5xl mx-auto">
          <div
            className="flex items-center gap-2.5 overflow-x-auto pb-0.5"
            style={{ scrollbarWidth: 'none' }}
          >
            <CityChip label="All Cities" active={!city} onClick={() => setFilter('city', '')} />
            {CITIES.map(c => (
              <CityChip
                key={c}
                label={c}
                active={city === c}
                onClick={() => setFilter('city', city === c ? '' : c)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Explore Lebanon map ───────────────────────────────────────────────── */}
      <LebanonMap
        city={city}
        onCitySelect={c => setFilter('city', c)}
        total={total}
        loading={loading}
      />

      {/* ── City profiles ─────────────────────────────────────────────────────── */}
      <CityProfiles
        cityTotals={cityTotals}
        loading={marketLoading}
        onCitySelect={c => setFilter('city', c)}
      />

      {/* ── Listings results ──────────────────────────────────────────────────── */}
      <section className="bg-ivory py-12 px-4 min-h-[50vh]">
        <div className="max-w-7xl mx-auto">

          {/* Result count row */}
          {!loading && !error && (
            <div className="flex items-center justify-between mb-8">
              <p className="text-charcoal/50 text-sm">
                {total > 0
                  ? `Showing ${listings.length} of ${total} propert${total === 1 ? 'y' : 'ies'}`
                  : ''
                }
              </p>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-gold hover:text-gold-dark transition-colors font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Loading */}
          {loading && <LoadingSkeleton />}

          {/* Error */}
          {error && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-charcoal/50 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Empty */}
          {!loading && !error && listings.length === 0 && (
            <EmptyState onClear={clearFilters} hasFilters={hasFilters} />
          )}

          {/* Grid */}
          {!loading && !error && listings.length > 0 && (
            <motion.div
              key={`${city}-${propertyType}-${purpose}-${price}-${sort}-${page}`}
              variants={staggerContainer(0.07, 0.05)}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            >
              {listings.map((property, i) => (
                <PropertyCard key={property._id} property={property} index={i} />
              ))}
            </motion.div>
          )}

          {/* Pagination */}
          {!loading && !error && pages > 1 && (
            <Pagination current={page} total={pages} onChange={setPage} />
          )}

        </div>
      </section>

      <Footer />
    </div>
  )
}
