import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { IoArrowForward, IoBusinessOutline, IoMapOutline, IoImagesOutline, IoCloseCircle } from 'react-icons/io5'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

// Backend Listing model: propertyType ∈ {apartment, land}, purpose ∈ {rent, sale}.
// Bedrooms/bathrooms only apply to apartments.

const EMPTY = {
  title:        '',
  description:  '',
  propertyType: 'apartment',
  purpose:      'sale',
  price:        '',
  city:         '',
  area:         '',
  address:      '',
  size:         '',
  bedrooms:     '',
  bathrooms:    '',
}

// ── Shared field styling — cream fill, gold focus, matches the Contact page ──
const FIELD =
  'w-full rounded-xl bg-[#f4efe3] border border-forest/10 px-4 py-3.5 text-charcoal ' +
  'placeholder:text-charcoal/35 transition-colors duration-200 ' +
  'focus:border-gold focus:outline-none focus:bg-[#f7f3ea]'
const LABEL =
  'block text-[11px] font-semibold uppercase tracking-widest text-charcoal/70 mb-2'

export default function AddResidencePage() {
  const { token } = useAuth()
  const navigate  = useNavigate()

  const [form,   setForm]   = useState(EMPTY)
  const [error,  setError]  = useState(null)
  const [saving, setSaving] = useState(false)
  const [images, setImages] = useState([]) // { file, preview }[]

  const isApartment = form.propertyType === 'apartment'

  function addImages(e) {
    const files = Array.from(e.target.files || [])
    const next = files.map(file => ({ file, preview: URL.createObjectURL(file) }))
    setImages(prev => [...prev, ...next].slice(0, 10)) // cap at 10
    e.target.value = '' // allow re-selecting the same file
  }

  function removeImage(idx) {
    setImages(prev => {
      URL.revokeObjectURL(prev[idx].preview)
      return prev.filter((_, i) => i !== idx)
    })
  }

  function update(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSaving(true)

    // FormData sends flat fields + files. The backend rebuilds `location`
    // from city/area/address, so we send those as separate keys.
    const fd = new FormData()
    fd.append('title',        form.title.trim())
    fd.append('description',  form.description.trim())
    fd.append('propertyType', form.propertyType)
    fd.append('purpose',      form.purpose)
    fd.append('price',        String(Number(form.price)))
    fd.append('city',         form.city.trim())
    if (form.area.trim())    fd.append('area',    form.area.trim())
    if (form.address.trim()) fd.append('address', form.address.trim())
    if (form.size)                        fd.append('size',      String(Number(form.size)))
    if (isApartment && form.bedrooms  !== '') fd.append('bedrooms',  String(Number(form.bedrooms)))
    if (isApartment && form.bathrooms !== '') fd.append('bathrooms', String(Number(form.bathrooms)))
    images.forEach(img => fd.append('images', img.file))

    try {
      const res = await fetch('/api/listings', {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` }, // no Content-Type — browser sets multipart boundary
        body:    fd,
      })
      const data = await res.json()

      if (data.success) {
        navigate('/listings')
      } else {
        setError(data.message ?? 'Could not create the listing.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
        <>
    <Navbar />
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_0.9fr]">
      {/* ── Form column ─────────────────────────────────────────────── */}
      <div className="px-6 sm:px-12 lg:px-16 pt-28 lg:pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="max-w-2xl mx-auto"
        >
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-5">
            <span className="h-px w-8 bg-gold" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              List Your Property
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-serif text-4xl sm:text-5xl font-bold leading-[1.05] mb-3">
            <span className="text-forest">Add a </span>
            <span className="text-gold">Residence</span>
          </h1>
          <div className="h-1 w-16 bg-forest rounded-full mb-4" />
          <p className="text-charcoal/50 text-sm mb-10 max-w-md">
            Fill in the details below. Every new listing goes through a quick review
            before it appears publicly.
          </p>

          {error && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={LABEL}>Title</label>
              <input name="title" value={form.title} onChange={update} required
                     className={FIELD} placeholder="Cozy 2-bedroom apartment in Achrafieh" />
            </div>

            <div>
              <label className={LABEL}>Description</label>
              <textarea name="description" value={form.description} onChange={update} required
                        rows={4} className={FIELD}
                        placeholder="Describe the property, its features, and surroundings..." />
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className={LABEL}>Property Type</label>
                <select name="propertyType" value={form.propertyType} onChange={update} className={FIELD}>
                  <option value="apartment">Apartment</option>
                  <option value="land">Land</option>
                </select>
              </div>
              <div>
                <label className={LABEL}>Purpose</label>
                <select name="purpose" value={form.purpose} onChange={update} className={FIELD}>
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                </select>
              </div>
            </div>

            <div>
              <label className={LABEL}>Price (USD)</label>
              <input name="price" value={form.price} onChange={update} required
                     type="number" min="0" className={FIELD} placeholder="150000" />
            </div>

            {/* Location group */}
            <div className="rounded-2xl border border-forest/8 bg-forest/[0.02] p-5 space-y-5">
              <div className="flex items-center gap-2 text-forest">
                <IoMapOutline className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-widest">Location</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className={LABEL}>City</label>
                  <input name="city" value={form.city} onChange={update} required
                         className={FIELD} placeholder="Beirut" />
                </div>
                <div>
                  <label className={LABEL}>Area <span className="text-charcoal/30 normal-case">(optional)</span></label>
                  <input name="area" value={form.area} onChange={update}
                         className={FIELD} placeholder="Achrafieh" />
                </div>
              </div>
              <div>
                <label className={LABEL}>Address <span className="text-charcoal/30 normal-case">(optional)</span></label>
                <input name="address" value={form.address} onChange={update}
                       className={FIELD} placeholder="Street, building, floor..." />
              </div>
            </div>

            {/* Photos group */}
            <div className="rounded-2xl border border-forest/8 bg-forest/[0.02] p-5 space-y-4">
              <div className="flex items-center gap-2 text-forest">
                <IoImagesOutline className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-widest">Photos</span>
              </div>

              <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-forest/20 bg-[#f4efe3] py-8 cursor-pointer hover:border-gold transition-colors">
                <IoImagesOutline className="w-7 h-7 text-forest/40" />
                <span className="text-sm text-charcoal/60">Click to upload photos</span>
                <span className="text-xs text-charcoal/35">JPG, PNG or WEBP · up to 10 · max 5MB each</span>
                <input type="file" accept="image/*" multiple onChange={addImages} className="hidden" />
              </label>

              {images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-forest/10">
                      <img src={img.preview} alt="" className="h-full w-full object-cover" />
                      <button type="button" onClick={() => removeImage(idx)}
                              className="absolute top-1 right-1 text-white bg-black/50 rounded-full hover:bg-red-500 transition-colors">
                        <IoCloseCircle className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Details group */}
            <div className="rounded-2xl border border-forest/8 bg-forest/[0.02] p-5 space-y-5">
              <div className="flex items-center gap-2 text-forest">
                <IoBusinessOutline className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-widest">Details</span>
              </div>
              <div className="grid grid-cols-3 gap-5">
                <div>
                  <label className={LABEL}>Size (m²)</label>
                  <input name="size" value={form.size} onChange={update}
                         type="number" min="0" className={FIELD} placeholder="120" />
                </div>
                {isApartment && (
                  <>
                    <div>
                      <label className={LABEL}>Bedrooms</label>
                      <input name="bedrooms" value={form.bedrooms} onChange={update}
                             type="number" min="0" className={FIELD} placeholder="2" />
                    </div>
                    <div>
                      <label className={LABEL}>Bathrooms</label>
                      <input name="bathrooms" value={form.bathrooms} onChange={update}
                             type="number" min="0" className={FIELD} placeholder="1" />
                    </div>
                  </>
                )}
              </div>
            </div>

            <button type="submit" disabled={saving}
                    className="btn-gold w-full py-4 rounded-full !tracking-widest uppercase text-sm
                               flex items-center justify-center gap-2 disabled:opacity-60">
              {saving ? 'Publishing...' : <>Add Residence <IoArrowForward className="w-4 h-4" /></>}
            </button>
          </form>
        </motion.div>
      </div>

      {/* ── Image column ────────────────────────────────────────────── */}
      <div className="relative hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80"
          alt="Modern residence"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest/85 via-forest/25 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-12">
          <p className="font-serif text-3xl font-bold text-white leading-tight mb-2">
            Reach thousands of<br />serious buyers.
          </p>
          <p className="text-white/70 text-sm max-w-xs">
            List your property on PropLink and connect with the right people across Lebanon.
          </p>
        </div>
      </div>
    </div>
    </>
  )
}