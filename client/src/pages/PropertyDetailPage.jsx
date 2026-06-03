import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  IoBedOutline, IoWaterOutline, IoLocationOutline, IoCallOutline,
  IoPersonOutline, IoArrowBackOutline, IoResizeOutline, IoHomeOutline,
  IoCalendarOutline, IoCheckmarkCircleOutline,
} from 'react-icons/io5'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { CITY_PROFILES } from '../data/cityProfiles'
import usePropertyDetail from '../hooks/usePropertyDetail'

// ── Constants ─────────────────────────────────────────────────────────────────

const EASE = [0.25, 0.46, 0.45, 0.94]

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80',
]

const CITY_COORDS = {
  Beirut:    [33.8938, 35.5018], Jounieh:   [33.9806, 35.6178],
  Jbeil:     [34.1236, 35.6519], Tripoli:   [34.4367, 35.8497],
  Sidon:     [33.5606, 35.3714], Tyre:      [33.2705, 35.2038],
  Zahle:     [33.8469, 35.9017], Batroun:   [34.2553, 35.6586],
  Baalbek:   [34.0042, 36.2144], Hermel:    [34.3894, 36.3875],
  Nabatieh:  [33.3772, 35.4836], Aley:      [33.81,   35.5994],
  Baabda:    [33.8342, 35.5486], Chouf:     [33.6947, 35.5606],
  Keserwan:  [34.0167, 35.65],   Metn:      [33.9333, 35.6],
  Akkar:     [34.55,   36.0],    Bcharre:   [34.2511, 36.0131],
  Marjayoun: [33.3622, 35.5853], Jezzine:   [33.5456, 35.5783],
  Rachaya:   [33.4986, 35.843],  Hasbaya:   [33.3986, 35.6853],
  Zgharta:   [34.3975, 35.8936],
}

const LIFESTYLE_LABELS = {
  city: 'City Living', coastal: 'Coastal', mountain: 'Mountain',
  family: 'Family', nightlife: 'Nightlife', quiet: 'Peaceful',
}

const JOURNEY_STEPS = ['Arrival', 'Area', 'Property', 'Highlights', 'Contact']

const dotIcon = L.divIcon({
  className: '',
  html: `<div style="width:14px;height:14px;background:#C9A24D;border:2.5px solid rgba(255,255,255,0.9);border-radius:50%;box-shadow:0 0 0 5px rgba(201,162,77,0.22),0 2px 10px rgba(0,0,0,0.4)"></div>`,
  iconSize: [14, 14], iconAnchor: [7, 7],
})

// ── Helpers ───────────────────────────────────────────────────────────────────

function getMapCenter(listing) {
  const coords = listing?.location?.coordinates?.coordinates
  if (Array.isArray(coords) && coords.length === 2) return [coords[1], coords[0]]
  return CITY_COORDS[listing?.location?.city] ?? [33.87, 35.83]
}

function getLifestyleTags(city) {
  const profile = CITY_PROFILES[city]
  if (!profile) return []
  return Object.entries(profile.lifestyle)
    .filter(([, v]) => v >= 6)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([k]) => LIFESTYLE_LABELS[k])
}

function deriveHighlights(listing) {
  if (!listing) return []
  const text = `${listing.title ?? ''} ${listing.description ?? ''}`.toLowerCase()
  const out = []
  if (/sea|ocean|bay|coast|beach|mediterran/.test(text))         out.push({ icon: '🌊', label: 'Sea View' })
  if (/mountain|alpine|cedar|ski|highland/.test(text))           out.push({ icon: '⛰️', label: 'Mountain View' })
  if (/invest|return|roi|yield|revenue/.test(text))              out.push({ icon: '📈', label: 'Investment Opportunity' })
  if ((listing.bedrooms ?? 0) >= 3)                              out.push({ icon: '👨‍👩‍👧', label: 'Family Friendly' })
  if (/school|university|college|education/.test(text))          out.push({ icon: '🎓', label: 'Near Schools' })
  if (/new|brand.new|modern|contemporary|luxury/.test(text))     out.push({ icon: '✨', label: 'Premium Quality' })
  if (/private|gated|secur|exclusive|compound/.test(text))       out.push({ icon: '🔒', label: 'Private & Secure' })
  if (/pool|swim/.test(text))                                    out.push({ icon: '🏊', label: 'Swimming Pool' })
  if (/garden|outdoor|terrace|balcon/.test(text))                out.push({ icon: '🌿', label: 'Outdoor Space' })
  if (/parking|garage/.test(text))                               out.push({ icon: '🚗', label: 'Parking Available' })
  if (listing.purpose === 'rent')                                out.push({ icon: '🏠', label: 'Ready to Move In' })
  if (listing.propertyType === 'land')                           out.push({ icon: '🌍', label: 'Prime Land Plot' })
  if (listing.location?.city)                                    out.push({ icon: '📍', label: `${listing.location.city} Location` })
  return out.slice(0, 8)
}

function formatPrice(price, purpose) {
  if (!price && price !== 0) return 'Price on request'
  return `$${price.toLocaleString()}${purpose === 'rent' ? ' /mo' : ''}`
}

// ── Sub-components ────────────────────────────────────────────────────────────

function JourneyNav({ activeSection, onJump }) {
  return (
    <div className="fixed right-5 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col items-center">
      {JOURNEY_STEPS.map((step, i) => (
        <div key={step} className="flex flex-col items-center">
          <motion.button
            onClick={() => onJump(i)}
            title={step}
            className="group relative flex items-center justify-center w-8 h-8"
            whileHover={{ scale: 1.25 }}
            transition={{ duration: 0.15 }}
          >
            <div className={`rounded-full transition-all duration-300 ${
              i === activeSection
                ? 'w-2.5 h-2.5 bg-gold shadow-[0_0_0_3px_rgba(201,162,77,0.22)]'
                : i < activeSection
                  ? 'w-2 h-2 bg-gold/55'
                  : 'w-1.5 h-1.5 bg-charcoal/20'
            }`} />
            <span className="absolute right-9 text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none px-2.5 py-1 rounded-lg bg-charcoal/90 text-ivory shadow-lg">
              {step}
            </span>
          </motion.button>
          {i < JOURNEY_STEPS.length - 1 && (
            <div className={`w-px h-8 transition-all duration-500 ${i < activeSection ? 'bg-gold/45' : 'bg-charcoal/12'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function PropertyDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { listing, loading, error } = usePropertyDetail(slug)

  const [activeSection, setActiveSection]   = useState(0)
  const [activeImg, setActiveImg]           = useState(0)
  const [formState, setFormState]           = useState('idle') // idle|submitting|success|auth|error
  const [form, setForm]                     = useState({ name: '', email: '', message: '' })

  const sectionRefs = useRef([null, null, null, null, null])

  // Scroll-spy — finds the last section whose top edge is above 42% of the viewport
  useEffect(() => {
    if (!listing) return
    function onScroll() {
      const mid = window.innerHeight * 0.42
      let active = 0
      sectionRefs.current.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top <= mid) active = i
      })
      setActiveSection(active)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [listing])

  function scrollToSection(idx) {
    sectionRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormState('submitting')
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: listing._id, message: form.message }),
      })
      if (res.status === 401) { setFormState('auth'); return }
      const data = await res.json()
      setFormState(data.success ? 'success' : 'error')
    } catch {
      setFormState('error')
    }
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  const images       = listing?.images?.length ? listing.images.map(i => i.url) : FALLBACK_IMAGES
  const cityProfile  = CITY_PROFILES[listing?.location?.city]
  const lifestyleTags = listing ? getLifestyleTags(listing.location?.city) : []
  const highlights   = deriveHighlights(listing)
  const mapCenter    = getMapCenter(listing)
  const owner        = listing?.ownerId

  // ── Loading / Error ───────────────────────────────────────────────────────

  if (loading) return (
    <div className="min-h-screen bg-ivory">
      <Navbar />
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-forest border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-charcoal/38 text-sm font-medium">Loading property…</p>
        </div>
      </div>
    </div>
  )

  if (error || !listing) return (
    <div className="min-h-screen bg-ivory">
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-6 text-center">
        <p className="font-serif text-2xl text-forest font-bold">Property Not Found</p>
        <p className="text-charcoal/45 text-sm max-w-xs">This listing may have been removed or the link is incorrect.</p>
        <Link to="/listings" className="btn-gold text-xs">Browse All Properties</Link>
      </div>
    </div>
  )

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />
      <JourneyNav activeSection={activeSection} onJump={scrollToSection} />

      {/* ─────────────────────────────────────────────────────────────────────
          SECTION 1 · ARRIVAL
      ───────────────────────────────────────────────────────────────────── */}
      <section
        ref={el => (sectionRefs.current[0] = el)}
        className="relative flex flex-col justify-end overflow-hidden"
        style={{ height: '88vh' }}
      >
        {/* Hero image — enters with gentle scale-down */}
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.07 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.3, ease: EASE }}
        >
          <img
            src={images[0]}
            alt={listing.title}
            className="w-full h-full object-cover"
            onError={e => { e.currentTarget.src = FALLBACK_IMAGES[0] }}
          />
        </motion.div>

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/28 to-black/12" />

        {/* Back button */}
        <motion.button
          onClick={() => navigate(-1)}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="absolute top-24 left-6 sm:left-10 z-20 flex items-center gap-2 text-white/60 hover:text-white transition-colors duration-200 group"
        >
          <IoArrowBackOutline className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform duration-150" />
          <span className="text-sm font-medium">All Listings</span>
        </motion.button>

        {/* Hero content */}
        <div className="relative z-10 px-6 sm:px-10 pb-14 max-w-5xl mx-auto w-full">
          {/* Purpose + type badges */}
          <motion.div
            className="flex items-center gap-3 mb-5"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6, ease: EASE }}
          >
            <span className="bg-gold text-white text-[10px] font-semibold tracking-widest uppercase px-3.5 py-1.5 rounded-full">
              {listing.purpose === 'rent' ? 'For Rent' : 'For Sale'}
            </span>
            <span className="border border-white/28 text-white/80 text-[10px] font-medium uppercase px-3.5 py-1.5 rounded-full capitalize">
              {listing.propertyType}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="font-serif text-3xl sm:text-4xl md:text-5xl text-white font-bold leading-tight mb-4"
            style={{ textShadow: '0 2px 24px rgba(0,0,0,0.35)' }}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7, ease: EASE }}
          >
            {listing.title}
          </motion.h1>

          {/* Price + location */}
          <motion.div
            className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.48, duration: 0.65, ease: EASE }}
          >
            <p className="font-serif text-2xl sm:text-3xl text-gold font-bold">
              {formatPrice(listing.price, listing.purpose)}
            </p>
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <IoLocationOutline className="w-4 h-4 text-gold/75 shrink-0" />
              <span>{[listing.location?.area, listing.location?.city].filter(Boolean).join(', ')}</span>
            </div>
          </motion.div>

          {/* Quick specs */}
          {(listing.bedrooms != null || listing.bathrooms != null || listing.size != null) && (
            <motion.div
              className="flex items-center gap-6 mt-5 pt-5 border-t border-white/12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.62, duration: 0.55 }}
            >
              {listing.bedrooms != null && (
                <div className="flex items-center gap-1.5 text-white/50 text-sm">
                  <IoBedOutline className="w-4 h-4" />
                  <span>{listing.bedrooms} Bed{listing.bedrooms !== 1 ? 's' : ''}</span>
                </div>
              )}
              {listing.bathrooms != null && (
                <div className="flex items-center gap-1.5 text-white/50 text-sm">
                  <IoWaterOutline className="w-4 h-4" />
                  <span>{listing.bathrooms} Bath{listing.bathrooms !== 1 ? 's' : ''}</span>
                </div>
              )}
              {listing.size != null && (
                <div className="flex items-center gap-1.5 text-white/50 text-sm">
                  <IoResizeOutline className="w-4 h-4" />
                  <span>{listing.size.toLocaleString()} m²</span>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.7 }}
        >
          <motion.div
            className="w-px h-9 bg-white/28 origin-top"
            animate={{ scaleY: [1, 0.2, 1] }}
            transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut' }}
          />
          <p className="text-white/28 text-[9px] tracking-[0.24em] uppercase font-medium">Scroll</p>
        </motion.div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          SECTION 2 · DISCOVER THE AREA
      ───────────────────────────────────────────────────────────────────── */}
      <section
        ref={el => (sectionRefs.current[1] = el)}
        className="bg-white py-20 px-6"
        style={{ scrollMarginTop: '80px' }}
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65, ease: EASE }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-6 bg-gold/45" />
              <p className="section-label">Discover</p>
            </div>
            <h2 className="section-title mb-2">Discover the Area</h2>
            <p className="text-charcoal/45 text-sm mb-10 max-w-xl">
              {cityProfile?.tagline ?? `Located in ${listing.location?.city}, Lebanon.`}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            {/* Mini-map */}
            <motion.div
              className="lg:col-span-3 rounded-[24px] overflow-hidden shadow-xl shadow-charcoal/12"
              style={{ height: 290 }}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <MapContainer
                center={mapCenter}
                zoom={13}
                scrollWheelZoom={false}
                zoomControl={false}
                attributionControl={false}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  subdomains="abcd"
                  maxZoom={19}
                />
                <Marker position={mapCenter} icon={dotIcon}>
                  <Tooltip className="pl-map-tip" direction="top" offset={[0, -10]} opacity={1} permanent>
                    {listing.location?.city}
                  </Tooltip>
                </Marker>
              </MapContainer>
            </motion.div>

            {/* Area info */}
            <motion.div
              className="lg:col-span-2 flex flex-col gap-5"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
            >
              {/* Location block */}
              <div className="bg-ivory rounded-2xl p-5">
                <p className="text-[10px] font-semibold tracking-[0.18em] text-charcoal/38 uppercase mb-3">Location Details</p>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <IoLocationOutline className="w-4 h-4 text-gold shrink-0" />
                    <span className="text-sm font-medium text-charcoal">{listing.location?.city}</span>
                  </div>
                  {listing.location?.area && (
                    <div className="flex items-center gap-2.5 pl-6 text-sm text-charcoal/55">
                      <span>{listing.location.area}</span>
                    </div>
                  )}
                  {listing.location?.address && (
                    <div className="flex items-center gap-2.5 pl-6 text-sm text-charcoal/40">
                      <span>{listing.location.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Lifestyle tags */}
              {lifestyleTags.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.18em] text-charcoal/38 uppercase mb-3">Area Character</p>
                  <div className="flex flex-wrap gap-2">
                    {lifestyleTags.map(tag => (
                      <span
                        key={tag}
                        className="text-xs font-medium px-3.5 py-1.5 rounded-full bg-forest/7 text-forest border border-forest/12"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Find My Place link */}
              <Link
                to="/find-my-place"
                className="text-xs font-medium text-gold/75 hover:text-gold transition-colors duration-150"
              >
                Not sure this area suits you? Take our Place Finder →
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          SECTION 3 · EXPLORE THE PROPERTY
      ───────────────────────────────────────────────────────────────────── */}
      <section
        ref={el => (sectionRefs.current[2] = el)}
        className="bg-ivory py-20 px-6"
        style={{ scrollMarginTop: '80px' }}
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65, ease: EASE }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-6 bg-gold/45" />
              <p className="section-label">Gallery</p>
            </div>
            <h2 className="section-title mb-10">Explore the Property</h2>
          </motion.div>

          {/* Gallery */}
          <motion.div
            className="mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            {/* Main image */}
            <div
              className="relative rounded-[24px] overflow-hidden mb-3"
              style={{ height: 'clamp(240px, 44vw, 440px)' }}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImg}
                  src={images[activeImg]}
                  alt={`${listing.title} — photo ${activeImg + 1}`}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.28 }}
                  onError={e => { e.currentTarget.src = FALLBACK_IMAGES[activeImg % FALLBACK_IMAGES.length] }}
                />
              </AnimatePresence>
              {images.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full">
                  {activeImg + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((src, i) => (
                  <motion.button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.15 }}
                    className={`shrink-0 w-20 h-14 rounded-xl overflow-hidden transition-all duration-200 ${
                      i === activeImg
                        ? 'ring-2 ring-gold ring-offset-2 opacity-100'
                        : 'opacity-50 hover:opacity-75'
                    }`}
                  >
                    <img
                      src={src}
                      alt={`Photo ${i + 1}`}
                      className="w-full h-full object-cover"
                      onError={e => { e.currentTarget.src = FALLBACK_IMAGES[i % FALLBACK_IMAGES.length] }}
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Specs grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
            {[
              { Icon: IoBedOutline,      label: 'Bedrooms',  value: listing.bedrooms  != null ? `${listing.bedrooms} Bedroom${listing.bedrooms !== 1 ? 's' : ''}` : null },
              { Icon: IoWaterOutline,    label: 'Bathrooms', value: listing.bathrooms != null ? `${listing.bathrooms} Bathroom${listing.bathrooms !== 1 ? 's' : ''}` : null },
              { Icon: IoResizeOutline,   label: 'Area',      value: listing.size      != null ? `${listing.size.toLocaleString()} m²` : null },
              { Icon: IoHomeOutline,     label: 'Type',      value: listing.propertyType ? listing.propertyType[0].toUpperCase() + listing.propertyType.slice(1) : null },
              { Icon: IoLocationOutline, label: 'City',      value: listing.location?.city ?? null },
              { Icon: IoCalendarOutline, label: 'Listed',    value: listing.createdAt ? new Date(listing.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : null },
            ].filter(s => s.value != null).map(({ Icon, label, value }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.38, ease: EASE }}
                className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-black/[0.05] shadow-sm"
              >
                <Icon className="text-gold text-lg mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.15em] text-charcoal/38 uppercase mb-0.5">{label}</p>
                  <p className="text-sm font-semibold text-charcoal">{value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, ease: EASE }}
            className="bg-white rounded-[24px] p-7 shadow-sm border border-black/[0.04]"
          >
            <p className="text-[10px] font-semibold tracking-[0.18em] text-charcoal/38 uppercase mb-4">About This Property</p>
            <div className="text-charcoal/60 text-[15px] leading-relaxed space-y-3">
              {listing.description.split('\n').filter(Boolean).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          SECTION 4 · WHY THIS PROPERTY
      ───────────────────────────────────────────────────────────────────── */}
      <section
        ref={el => (sectionRefs.current[3] = el)}
        className="py-20 px-6"
        style={{
          background: 'linear-gradient(160deg, #061812 0%, #0F3D2E 100%)',
          scrollMarginTop: '80px',
        }}
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65, ease: EASE }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-6 bg-gold/45" />
              <p className="text-[10px] font-semibold tracking-[0.22em] text-gold/60 uppercase">Highlights</p>
            </div>
            <h2 className="font-serif text-2xl md:text-3xl text-white font-bold leading-tight mb-2">
              Why This Property?
            </h2>
            <p className="text-white/35 text-sm mb-10">Key selling points derived from this listing</p>
          </motion.div>

          {highlights.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {highlights.map(({ icon, label }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.4, ease: EASE }}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
                  style={{
                    background: 'rgba(255,255,255,0.055)',
                    border: '1px solid rgba(201,162,77,0.16)',
                  }}
                >
                  <span className="text-xl leading-none select-none">{icon}</span>
                  <span className="text-sm font-medium text-white/78 leading-snug">{label}</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-white/28 text-sm">Contact the owner for a full breakdown of this property's features.</p>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          SECTION 5 · CONTACT & INQUIRY
      ───────────────────────────────────────────────────────────────────── */}
      <section
        ref={el => (sectionRefs.current[4] = el)}
        className="bg-ivory py-20 px-6"
        style={{ scrollMarginTop: '80px' }}
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65, ease: EASE }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-6 bg-gold/45" />
              <p className="section-label">Contact</p>
            </div>
            <h2 className="section-title mb-2">Get in Touch</h2>
            <p className="text-charcoal/45 text-sm mb-10">Reach the property owner directly — no intermediaries.</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Owner card */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <div
                className="rounded-[24px] p-7 shadow-xl shadow-forest/15 h-full"
                style={{ background: 'linear-gradient(145deg, #061812 0%, #0F3D2E 100%)' }}
              >
                <p className="text-[9px] font-semibold tracking-[0.22em] text-gold/55 uppercase mb-6">Listed by</p>

                <div className="flex items-center gap-4 mb-7">
                  {owner?.profileImage?.url ? (
                    <img
                      src={owner.profileImage.url}
                      alt={owner.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-gold/30 shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-white/8 flex items-center justify-center border border-gold/20 shrink-0">
                      <IoPersonOutline className="w-6 h-6 text-gold/55" />
                    </div>
                  )}
                  <div>
                    <p className="font-serif text-lg text-white font-bold leading-tight">
                      {owner?.name ?? 'Property Owner'}
                    </p>
                    <p className="text-white/28 text-xs mt-0.5">Verified on PropLink</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {owner?.phoneNumber && (
                    <a
                      href={`tel:${owner.phoneNumber}`}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-white/7 hover:bg-gold/12 transition-colors duration-200 group"
                    >
                      <IoCallOutline className="w-4 h-4 text-gold shrink-0" />
                      <span className="text-sm font-medium text-white/75 group-hover:text-white transition-colors">
                        {owner.phoneNumber}
                      </span>
                    </a>
                  )}
                  {owner?.phoneNumber && (
                    <a
                      href={`https://wa.me/${owner.phoneNumber.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-white/7 hover:bg-[#25D366]/15 transition-colors duration-200 group"
                    >
                      <span className="text-base leading-none">💬</span>
                      <span className="text-sm font-medium text-white/55 group-hover:text-white/80 transition-colors">WhatsApp</span>
                    </a>
                  )}
                </div>

                <p className="text-[10px] text-white/18 leading-relaxed mt-6">
                  PropLink connects you directly with owners. No commission. No middlemen.
                </p>
              </div>
            </motion.div>

            {/* Form */}
            <motion.div
              className="lg:col-span-3 flex flex-col gap-4"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
            >
              <div className="bg-white rounded-[24px] p-7 shadow-sm border border-black/[0.04] flex-1">
                <p className="text-[10px] font-semibold tracking-[0.18em] text-charcoal/38 uppercase mb-5">Send an Inquiry</p>

                <AnimatePresence mode="wait">
                  {formState === 'success' ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-10 text-center"
                    >
                      <IoCheckmarkCircleOutline className="w-12 h-12 text-forest mx-auto mb-3" />
                      <p className="font-serif text-xl text-forest font-bold mb-1">Inquiry Sent</p>
                      <p className="text-charcoal/45 text-sm">The owner will be in touch with you shortly.</p>
                    </motion.div>
                  ) : formState === 'auth' ? (
                    <motion.div
                      key="auth"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-10 text-center"
                    >
                      <p className="font-serif text-xl text-forest font-bold mb-2">Sign In Required</p>
                      <p className="text-charcoal/45 text-sm mb-8 max-w-xs mx-auto">
                        Please log in to send an inquiry to the owner.
                      </p>
                      <div className="flex items-center justify-center gap-3">
                        <Link to="/login"    className="btn-outline-forest text-xs py-2.5 px-6">Log In</Link>
                        <Link to="/register" className="btn-gold text-xs py-2.5 px-6">Create Account</Link>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      onSubmit={handleSubmit}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-semibold tracking-[0.14em] text-charcoal/42 uppercase block mb-1.5">
                            Your Name
                          </label>
                          <input
                            type="text"
                            value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            required
                            placeholder="Full name"
                            className="w-full px-4 py-3 rounded-xl bg-ivory border border-black/8 text-sm text-charcoal placeholder-charcoal/28 focus:outline-none focus:border-gold/55 focus:ring-1 focus:ring-gold/18 transition-colors duration-200"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold tracking-[0.14em] text-charcoal/42 uppercase block mb-1.5">
                            Email
                          </label>
                          <input
                            type="email"
                            value={form.email}
                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                            required
                            placeholder="your@email.com"
                            className="w-full px-4 py-3 rounded-xl bg-ivory border border-black/8 text-sm text-charcoal placeholder-charcoal/28 focus:outline-none focus:border-gold/55 focus:ring-1 focus:ring-gold/18 transition-colors duration-200"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-semibold tracking-[0.14em] text-charcoal/42 uppercase block mb-1.5">
                          Message
                        </label>
                        <textarea
                          value={form.message}
                          onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                          required
                          rows={5}
                          placeholder={`Hi, I'm interested in this ${listing.propertyType} in ${listing.location?.city}. Could you share more details and arrange a viewing?`}
                          className="w-full px-4 py-3 rounded-xl bg-ivory border border-black/8 text-sm text-charcoal placeholder-charcoal/28 focus:outline-none focus:border-gold/55 focus:ring-1 focus:ring-gold/18 transition-colors duration-200 resize-none"
                        />
                      </div>

                      {formState === 'error' && (
                        <p className="text-red-500 text-xs">
                          Something went wrong. Please try again or contact the owner directly.
                        </p>
                      )}

                      <motion.button
                        type="submit"
                        disabled={formState === 'submitting'}
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        className="btn-gold text-xs py-3 px-8 disabled:opacity-55 disabled:cursor-not-allowed"
                      >
                        {formState === 'submitting' ? 'Sending…' : 'Send Inquiry'}
                      </motion.button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>

              {/* Schedule viewing hint */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5, ease: EASE }}
                className="flex items-start gap-3.5 px-6 py-4 rounded-2xl bg-forest/7 border border-forest/10"
              >
                <IoCalendarOutline className="w-5 h-5 text-forest mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-forest mb-0.5">Schedule a Viewing</p>
                  <p className="text-xs text-charcoal/42 leading-relaxed">
                    Include your preferred date and time in your message above and the owner will confirm availability.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
