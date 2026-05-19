import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeUp } from '../utils/motion'

const CITIES   = ['Beirut', 'Jounieh', 'Jbeil', 'Tripoli', 'Sidon', 'Tyre', 'Zahle', 'Batroun']
const TYPES    = ['Apartment', 'Land']
const PURPOSES = ['For Rent', 'For Sale']
const PRICES   = ['Under $100K', '$100K – $300K', '$300K – $700K', '$700K+']

function SelectField({ label, value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return
    const onOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onOutside)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onOutside)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const select = (opt) => {
    onChange({ target: { value: opt } })
    setOpen(false)
  }

  const clear = () => {
    onChange({ target: { value: '' } })
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-1.5 flex-1 min-w-0 relative">
      <label className="text-[10px] font-semibold tracking-[0.15em] text-forest/72 uppercase">
        {label}
      </label>

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center justify-between w-full border-b py-2 text-sm text-left outline-none cursor-pointer transition-colors duration-200 gap-2 ${
          open ? 'border-gold' : 'border-gray-200 hover:border-forest/30'
        } ${value ? 'text-charcoal' : 'text-charcoal/50'}`}
      >
        <span className="truncate">{value || placeholder}</span>
        <svg
          className={`w-3 h-3 text-forest/55 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Custom dropdown panel */}
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
            {/* Placeholder / clear row */}
            <li>
              <button
                type="button"
                role="option"
                aria-selected={!value}
                onClick={clear}
                className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors duration-150 ${
                  !value
                    ? 'text-forest bg-forest/[0.06] font-semibold'
                    : 'text-charcoal/40 hover:bg-ivory hover:text-forest/70'
                }`}
              >
                {placeholder}
              </button>
            </li>

            {/* Separator */}
            <li aria-hidden="true">
              <div className="mx-3 border-t border-gray-100" />
            </li>

            {/* Options */}
            {options.map((opt) => (
              <li key={opt}>
                <button
                  type="button"
                  role="option"
                  aria-selected={value === opt}
                  onClick={() => select(opt)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 ${
                    value === opt
                      ? 'text-gold font-semibold bg-gold/[0.07]'
                      : 'text-charcoal/70 hover:bg-ivory hover:text-forest'
                  }`}
                >
                  {opt}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function SearchBar() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ city: '', type: '', purpose: '', price: '' })

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (form.city)    params.set('city',         form.city)
    if (form.type)    params.set('propertyType', form.type.toLowerCase())
    if (form.purpose) params.set('purpose',      form.purpose === 'For Rent' ? 'rent' : 'sale')
    if (form.price)   params.set('price',        form.price)
    navigate(`/listings?${params.toString()}`)
  }

  return (
    <section className="relative z-20 -mt-16 px-4 pb-2">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.9 }}
        className="max-w-5xl mx-auto"
      >
        <form
          onSubmit={handleSearch}
          className="bg-white/97 backdrop-blur-xl shadow-2xl rounded-[30px] p-7 md:p-9"
        >
          <p className="text-[10px] font-semibold tracking-[0.2em] text-charcoal/55 uppercase mb-6">
            Smart Property Search
          </p>

          <div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-6">
            {/* Fields */}
            <div className="flex flex-col sm:flex-row gap-6 flex-1">
              <SelectField
                label="Location"
                value={form.city}
                onChange={set('city')}
                options={CITIES}
                placeholder="Any City"
              />
              <div className="hidden sm:block w-px bg-gray-100 self-stretch" />
              <SelectField
                label="Property Type"
                value={form.type}
                onChange={set('type')}
                options={TYPES}
                placeholder="Any Type"
              />
              <div className="hidden sm:block w-px bg-gray-100 self-stretch" />
              <SelectField
                label="Purpose"
                value={form.purpose}
                onChange={set('purpose')}
                options={PURPOSES}
                placeholder="Rent or Buy"
              />
              <div className="hidden sm:block w-px bg-gray-100 self-stretch" />
              <SelectField
                label="Price Range"
                value={form.price}
                onChange={set('price')}
                options={PRICES}
                placeholder="Any Price"
              />
            </div>

            {/* Search button */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="btn-gold rounded-full px-10 shrink-0 flex items-center gap-2 justify-center"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              Search
            </motion.button>
          </div>
        </form>
      </motion.div>
    </section>
  )
}
