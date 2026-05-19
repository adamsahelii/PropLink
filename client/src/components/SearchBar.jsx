import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fadeUp } from '../utils/motion'

const CITIES   = ['Beirut', 'Jounieh', 'Jbeil', 'Tripoli', 'Sidon', 'Tyre', 'Zahle', 'Batroun']
const TYPES    = ['Apartment', 'Land']
const PURPOSES = ['For Rent', 'For Sale']
const PRICES   = ['Any Price', 'Under $100K', '$100K – $300K', '$300K – $700K', '$700K+']

function SelectField({ label, value, onChange, options, placeholder }) {
  return (
    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
      <label className="text-[10px] font-semibold tracking-[0.15em] text-forest/50 uppercase">
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        className="border-b border-gray-200 focus:border-gold outline-none text-sm text-charcoal py-2 bg-transparent cursor-pointer transition-colors duration-200 appearance-none"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
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
          className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-[30px] p-7 md:p-9"
        >
          {/* Label row */}
          <p className="text-[10px] font-semibold tracking-[0.2em] text-forest/40 uppercase mb-6">
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
                options={PRICES.slice(1)}
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
