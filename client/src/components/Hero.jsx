import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { IoSearchOutline } from 'react-icons/io5'
import { staggerContainer, fadeUp, fadeIn } from '../utils/motion'

// ── Constants ─────────────────────────────────────────────────────────────────

const HERO_IMG =
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1920&q=85'

const CITIES  = ['Beirut', 'Jounieh', 'Jbeil', 'Tripoli', 'Sidon', 'Tyre', 'Zahle', 'Batroun']
const TYPES   = ['Apartment', 'Land']
const PRICES  = ['Under $100K', '$100K – $300K', '$300K – $700K', '$700K+']
const POPULAR = ['Beirut', 'Batroun', 'Jbeil', 'Zahle', 'Byblos']

// ── Custom dropdown — replaces native <select> ────────────────────────────────
// Native selects cannot be styled on dark backgrounds; this gives full control.

function HeroDropdown({ icon, label, value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false)
  const containerRef    = useRef(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function onOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [open])

  // Mimic the { target: { value } } shape the parent set() function expects
  const select = (val) => { onChange({ target: { value: val } }); setOpen(false) }
  const clear  = ()    => { onChange({ target: { value: ''  } }); setOpen(false) }

  return (
    <div
      ref={containerRef}
      className="flex-1 relative flex items-start gap-3.5 px-6 py-5 min-w-0 cursor-pointer select-none"
      onClick={() => setOpen(o => !o)}
    >
      {/* Icon */}
      <span className="mt-0.5 shrink-0" style={{ color: 'rgba(201,162,77,0.72)' }}>
        {icon}
      </span>

      {/* Label + current value */}
      <div className="flex-1 min-w-0">
        <p
          className="text-[10px] font-semibold tracking-[0.18em] uppercase mb-1.5"
          style={{ color: 'rgba(247,243,234,0.52)' }}
        >
          {label}
        </p>
        <div className="flex items-center gap-2">
          <span
            className="text-[14px] font-medium leading-snug truncate flex-1"
            style={{ color: value ? 'rgba(247,243,234,0.95)' : 'rgba(247,243,234,0.60)' }}
          >
            {value || placeholder}
          </span>
          <svg
            className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            style={{ color: 'rgba(201,162,77,0.62)' }}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* ── Dropdown panel ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            onClick={e => e.stopPropagation()}
            className="absolute top-full left-0 mt-2 z-[200] rounded-2xl overflow-hidden"
            style={{
              background:           'rgba(5,22,13,0.97)',
              border:               '1px solid rgba(201,162,77,0.28)',
              backdropFilter:       'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              boxShadow:            '0 24px 64px rgba(0,0,0,0.65), 0 0 0 1px rgba(201,162,77,0.06)',
              minWidth:             '200px',
              width:                '100%',
            }}
          >
            {/* Clear / placeholder row */}
            <li>
              <button
                type="button"
                role="option"
                aria-selected={!value}
                onClick={clear}
                className="w-full text-left px-4 py-3 text-[12px] font-medium transition-colors duration-150"
                style={{ color: !value ? '#C9A24D' : 'rgba(247,243,234,0.38)' }}
              >
                {placeholder}
              </button>
            </li>

            {/* Divider */}
            <li aria-hidden="true">
              <div className="mx-4 h-px" style={{ background: 'rgba(201,162,77,0.14)' }} />
            </li>

            {/* Options */}
            {options.map(o => (
              <li key={o}>
                <button
                  type="button"
                  role="option"
                  aria-selected={value === o}
                  onClick={() => select(o)}
                  className="w-full text-left px-4 py-3 text-[13.5px] font-medium transition-all duration-150"
                  style={{
                    color:      value === o ? '#C9A24D'                  : 'rgba(247,243,234,0.82)',
                    background: value === o ? 'rgba(201,162,77,0.09)'    : 'transparent',
                  }}
                  onMouseEnter={e => {
                    if (value !== o) {
                      e.currentTarget.style.background = 'rgba(201,162,77,0.08)'
                      e.currentTarget.style.color      = 'rgba(247,243,234,0.96)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (value !== o) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color      = 'rgba(247,243,234,0.82)'
                    }
                  }}
                >
                  {o}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────

export default function Hero() {
  const sectionRef = useRef(null)
  const navigate   = useNavigate()

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '22%'])

  const [form, setForm] = useState({ city: '', type: '', price: '' })
  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  function handleSearch(e) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (form.city)  params.set('city',         form.city)
    if (form.type)  params.set('propertyType', form.type.toLowerCase())
    if (form.price) params.set('price',        form.price)
    navigate(`/listings?${params.toString()}`)
  }

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center overflow-hidden"
    >

      {/* ── Panoramic parallax image ───────────────────────────────────────── */}
      <motion.div className="absolute inset-0 scale-110" style={{ y: imageY }}>
        <img
          src={HERO_IMG}
          alt="Luxury property in Lebanon"
          className="w-full h-full object-cover object-center"
        />
      </motion.div>

      {/* ── Balanced overlays ─────────────────────────────────────────────── */}
      <div className="absolute inset-0" style={{ background: 'rgba(4,16,10,0.28)' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(4,16,10,0.86) 0%, rgba(4,16,10,0.62) 38%, rgba(4,16,10,0.22) 65%, rgba(4,16,10,0.02) 100%)' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.52) 0%, transparent 24%)' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(4,20,12,0.65) 0%, rgba(4,20,12,0.20) 30%, transparent 50%)' }} />

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <motion.div
        variants={staggerContainer(0.12, 0.2)}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 xl:px-20 pt-40 pb-28 sm:pt-48 sm:pb-36"
      >

        {/* Text block */}
        <div className="mb-10">
          <motion.div variants={fadeIn} className="flex items-center gap-3 mb-7">
            <div className="h-px w-10 bg-gold/60" />
            <p className="section-label text-gold/90">
              Lebanon's Premier Real Estate Platform
            </p>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white font-bold leading-[1.04] mb-6"
            style={{ textShadow: '0 2px 28px rgba(0,0,0,0.60)' }}
          >
            Find Your Perfect
            <span className="block text-gold" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.40)' }}>
              Property in Lebanon
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-white/80 text-lg sm:text-xl leading-relaxed"
            style={{ maxWidth: '34rem', textShadow: '0 1px 14px rgba(0,0,0,0.55)' }}
          >
            Discover, buy, rent, and invest in the best properties across
            Lebanon. Your dream home or next investment is a search away.
          </motion.p>
        </div>

        {/* ── Search bar ────────────────────────────────────────────────────── */}
        {/*
          NO overflow-hidden on the form — that would clip the absolutely-positioned
          dropdown panels. The button gets its own rounded corners instead.
        */}
        <motion.form
          variants={fadeUp}
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row rounded-2xl mb-6 w-full"
          style={{
            maxWidth:             '62rem',
            background:           'rgba(5,24,14,0.80)',
            border:               '1px solid rgba(201,162,77,0.30)',
            backdropFilter:       'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow:            '0 20px 60px rgba(0,0,0,0.42)',
          }}
        >
          {/* Location */}
          <HeroDropdown
            label="Location"
            value={form.city}
            onChange={set('city')}
            options={CITIES}
            placeholder="Where do you want to live?"
            icon={
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
            }
          />

          <div className="hidden sm:block w-px shrink-0 self-stretch" style={{ background: 'rgba(201,162,77,0.15)' }} />

          {/* Property Type */}
          <HeroDropdown
            label="Property Type"
            value={form.type}
            onChange={set('type')}
            options={TYPES}
            placeholder="All Types"
            icon={
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            }
          />

          <div className="hidden sm:block w-px shrink-0 self-stretch" style={{ background: 'rgba(201,162,77,0.15)' }} />

          {/* Price Range */}
          <HeroDropdown
            label="Price Range"
            value={form.price}
            onChange={set('price')}
            options={PRICES}
            placeholder="Any Price"
            icon={
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
            }
          />

          {/* Search button — gets its own rounded corners since the form has no overflow-hidden */}
          <button
            type="submit"
            className="flex items-center justify-center gap-2.5 shrink-0 px-9 py-5 sm:py-0 bg-gold hover:bg-gold-dark text-white font-sans font-semibold text-[11px] tracking-[0.20em] uppercase transition-colors duration-300 rounded-b-2xl sm:rounded-b-none sm:rounded-r-2xl"
          >
            <IoSearchOutline className="w-[18px] h-[18px]" />
            Search Properties
          </button>
        </motion.form>

        {/* ── Popular searches ─────────────────────────────────────────────── */}
        <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3">
          <p
            className="text-[10px] font-semibold tracking-[0.22em] uppercase shrink-0"
            style={{ color: 'rgba(201,162,77,0.80)' }}
          >
            Popular Searches
          </p>
          <div className="h-px w-4" style={{ background: 'rgba(201,162,77,0.35)' }} />
          {POPULAR.map(city => (
            <button
              key={city}
              type="button"
              onClick={() => navigate(`/listings?city=${encodeURIComponent(city)}`)}
              className="text-[12px] font-medium px-4 py-1.5 rounded-full transition-all duration-200"
              style={{
                color:        'rgba(247,243,234,0.90)',
                border:       '1px solid rgba(247,243,234,0.30)',
                textShadow:   '0 1px 6px rgba(0,0,0,0.45)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(201,162,77,0.65)'
                e.currentTarget.style.color       = '#C9A24D'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(247,243,234,0.30)'
                e.currentTarget.style.color       = 'rgba(247,243,234,0.90)'
              }}
            >
              {city}
            </button>
          ))}
        </motion.div>

      </motion.div>

    </section>
  )
}
