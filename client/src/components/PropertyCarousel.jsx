import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { IoChevronBackOutline, IoChevronForwardOutline, IoLocationOutline, IoBedOutline, IoWaterOutline } from 'react-icons/io5'
import { Link } from 'react-router-dom'
import { fadeUp } from '../utils/motion'

const PROPERTIES = [
  {
    id: 1, slug: 'modern-penthouse-achrafieh',
    title: 'Modern Penthouse in Achrafieh',
    location: 'Achrafieh, Beirut',
    rawPrice: 2500, suffix: '/mo', purpose: 'rent', type: 'Apartment', beds: 3, baths: 2,
    img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=75',
  },
  {
    id: 2, slug: 'luxury-sea-view-villa',
    title: 'Luxury Sea-View Villa',
    location: 'Kaslik, Jounieh',
    rawPrice: 850000, suffix: '', purpose: 'sale', type: 'Villa', beds: 5, baths: 4,
    img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=75',
  },
  {
    id: 3, slug: 'boutique-apartment-verdun',
    title: 'Boutique Apartment, Verdun',
    location: 'Verdun, Beirut',
    rawPrice: 1200, suffix: '/mo', purpose: 'rent', type: 'Apartment', beds: 2, baths: 1,
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=75',
  },
  {
    id: 4, slug: 'cliffside-retreat-batroun',
    title: 'Cliffside Retreat',
    location: 'Batroun',
    rawPrice: 420000, suffix: '', purpose: 'sale', type: 'Villa', beds: 4, baths: 3,
    img: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=75',
  },
  {
    id: 5, slug: 'mediterranean-estate-jounieh',
    title: 'Mediterranean Estate',
    location: 'Jounieh',
    rawPrice: 1200000, suffix: '', purpose: 'sale', type: 'Villa', beds: 6, baths: 5,
    img: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=75',
  },
]

const N = PROPERTIES.length
const wrap = (i) => ((i % N) + N) % N

function relPos(idx, active) {
  let r = idx - active
  if (r > Math.floor(N / 2)) r -= N
  if (r < -Math.ceil(N / 2)) r += N
  return r
}

export default function PropertyCarousel() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640)
  const headerRef = useRef(null)
  const isInView = useInView(headerRef, { once: true, margin: '-60px' })

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', update, { passive: true })
    return () => window.removeEventListener('resize', update)
  }, [])

  // Drag tracking
  const dragStartX = useRef(null)
  const hasDragged = useRef(false)

  const prev = useCallback(() => { setPaused(true); setActive(a => wrap(a - 1)) }, [])
  const next = useCallback(() => { setPaused(true); setActive(a => wrap(a + 1)) }, [])

  // Auto-advance
  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setActive(a => wrap(a + 1)), 4200)
    return () => clearInterval(t)
  }, [paused])

  // Pointer drag handlers
  const onPtrDown = (e) => { dragStartX.current = e.clientX; hasDragged.current = false }
  const onPtrMove = (e) => {
    if (dragStartX.current !== null && Math.abs(e.clientX - dragStartX.current) > 8) hasDragged.current = true
  }
  const onPtrUp = (e) => {
    if (hasDragged.current && dragStartX.current !== null) {
      const delta = e.clientX - dragStartX.current
      if (delta < -60) next()
      else if (delta > 60) prev()
    }
    dragStartX.current = null
    hasDragged.current = false
  }

  return (
    <section className="py-24 bg-ivory overflow-hidden">
      {/* Header */}
      <div ref={headerRef} className="max-w-7xl mx-auto px-6 text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <p className="section-label mb-3">Curated Selection</p>
          <h2 className="section-title">Find Your Next Property</h2>
          <div className="mt-4 w-12 h-0.5 bg-gold mx-auto" />
          <p className="mt-5 text-gray-500 max-w-lg mx-auto text-sm leading-relaxed">
            Luxury curated properties across Lebanon's most sought-after neighbourhoods.
          </p>
        </motion.div>
      </div>

      {/* Carousel stage */}
      <div
        className="relative h-[420px] sm:h-[460px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onPointerDown={onPtrDown}
        onPointerMove={onPtrMove}
        onPointerUp={onPtrUp}
        onPointerCancel={() => { dragStartX.current = null; hasDragged.current = false }}
      >
        {PROPERTIES.map((prop, i) => {
          const rel = relPos(i, active)
          const abs = Math.abs(rel)
          const maxVisible = isMobile ? 1 : 2
          if (abs > maxVisible) return null

          const xPx   = rel * (isMobile ? 215 : 310)
          const scale = 1 - abs * (isMobile ? 0.13 : 0.115)
          const opac  = abs === 0 ? 1 : abs === 1 ? (isMobile ? 0.55 : 0.72) : 0.38
          const blur  = abs === 0 ? 0 : abs === 1 ? 1.5 : 3
          const zIdx  = 20 - abs * 5

          const animProps = { x: xPx, scale, opacity: opac, filter: `blur(${blur}px)` }
          return (
            <motion.div
              key={prop.id}
              initial={animProps}
              animate={animProps}
              transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{ position: 'absolute', zIndex: zIdx, willChange: 'transform' }}
              className="w-[260px] sm:w-[280px] md:w-[300px]"
              onClick={() => { if (!hasDragged.current && rel !== 0) { setActive(i); setPaused(true) } }}
            >
              <CarouselCard prop={prop} isCenter={abs === 0} />
            </motion.div>
          )
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-5 mt-10">
        <button
          onClick={prev}
          className="w-11 h-11 rounded-full border border-forest/20 flex items-center justify-center text-forest hover:bg-forest hover:text-white hover:border-forest transition-all duration-200"
          aria-label="Previous"
        >
          <IoChevronBackOutline className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          {PROPERTIES.map((_, i) => (
            <button
              key={i}
              onClick={() => { setActive(i); setPaused(true) }}
              className={`rounded-full transition-all duration-300 ${i === active ? 'w-6 h-2 bg-gold' : 'w-2 h-2 bg-forest/20 hover:bg-gold/50'}`}
              aria-label={`Go to property ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="w-11 h-11 rounded-full border border-forest/20 flex items-center justify-center text-forest hover:bg-forest hover:text-white hover:border-forest transition-all duration-200"
          aria-label="Next"
        >
          <IoChevronForwardOutline className="w-5 h-5" />
        </button>
      </div>
    </section>
  )
}

function CarouselCard({ prop, isCenter }) {
  const { title, location, rawPrice, suffix, purpose, type, beds, baths, img, slug } = prop

  return (
    <div
      className={`bg-white rounded-3xl overflow-hidden transition-shadow duration-400 ${
        isCenter ? 'shadow-2xl shadow-charcoal/15' : 'shadow-lg'
      }`}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={img}
          alt={title}
          className={`w-full h-full object-cover transition-transform duration-700 ${isCenter ? 'scale-100' : 'scale-105'}`}
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />

        <div className="absolute top-3 left-3">
          <span className="bg-gold text-white text-[9px] font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full">
            {purpose === 'rent' ? 'For Rent' : 'For Sale'}
          </span>
        </div>

        <div className="absolute bottom-3 left-4">
          <p className="text-white font-serif text-lg font-bold drop-shadow-md">
            ${rawPrice.toLocaleString()}
            <span className="text-white/70 text-xs font-sans font-normal">{suffix}</span>
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-serif text-[15px] font-semibold text-charcoal line-clamp-1 mb-1.5">{title}</h3>

        <div className="flex items-center gap-1 text-gray-400 text-xs mb-3">
          <IoLocationOutline className="w-3.5 h-3.5 text-gold shrink-0" />
          <span>{location}</span>
        </div>

        <div className="flex items-center gap-3 text-gray-400 text-[11px] mb-4">
          <div className="flex items-center gap-1"><IoBedOutline className="w-3.5 h-3.5" />{beds} Beds</div>
          <div className="flex items-center gap-1"><IoWaterOutline className="w-3.5 h-3.5" />{baths} Baths</div>
          <span className="ml-auto text-[10px] bg-forest/8 text-forest px-2 py-0.5 rounded-full font-medium">{type}</span>
        </div>

        <Link
          to={`/listings/${slug}`}
          onClick={e => e.stopPropagation()}
          className="flex items-center justify-between w-full text-forest text-[11px] font-semibold border-t border-gray-100 pt-3 group"
        >
          <span className="tracking-wide">View Details</span>
          <span className="w-6 h-6 rounded-full bg-forest flex items-center justify-center transition-transform duration-200 group-hover:translate-x-0.5">
            <IoChevronForwardOutline className="w-3 h-3 text-white" />
          </span>
        </Link>
      </div>
    </div>
  )
}
