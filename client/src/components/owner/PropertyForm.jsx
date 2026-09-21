import { useState } from 'react'
import { motion } from 'framer-motion'
import { IoAlertCircleOutline, IoInformationCircleOutline } from 'react-icons/io5'
import LocationPicker from './LocationPicker'
import ImageUploader from './ImageUploader'
import { CITIES } from '../../data/cities'

// ── Schema-mirrored options (server/models/Listing.js) ────────────────────────

const TYPE_OPTS = [
  { value: 'apartment', label: 'Apartment', hint: 'A residential unit' },
  { value: 'land',      label: 'Land',      hint: 'A plot with no building' },
]

const PURPOSE_OPTS = [
  { value: 'sale', label: 'For Sale' },
  { value: 'rent', label: 'For Rent' },
]

// 'pending' is the admin review queue's own value, so owners never set it here
const STATUS_OPTS = [
  { value: 'available', label: 'Available' },
  { value: 'rented',    label: 'Rented' },
  { value: 'sold',      label: 'Sold' },
]

const MAX_TITLE = 200
const MAX_DESCRIPTION = 5000

// ── Empty state ───────────────────────────────────────────────────────────────

export const EMPTY_FORM = {
  title: '',
  description: '',
  propertyType: 'apartment',
  purpose: 'sale',
  price: '',
  size: '',
  bedrooms: '',
  bathrooms: '',
  city: '',
  area: '',
  address: '',
  status: 'available',
  pin: null,      // [lat, lng] — flipped to GeoJSON on submit
  images: [],
}

/** Maps a listing document from the API onto the form's flat shape. */
export function listingToForm(listing) {
  const coords = listing.location?.coordinates?.coordinates // [lng, lat]

  return {
    title:        listing.title ?? '',
    description:  listing.description ?? '',
    propertyType: listing.propertyType ?? 'apartment',
    purpose:      listing.purpose ?? 'sale',
    price:        listing.price != null ? String(listing.price) : '',
    size:         listing.size != null ? String(listing.size) : '',
    bedrooms:     listing.bedrooms != null ? String(listing.bedrooms) : '',
    bathrooms:    listing.bathrooms != null ? String(listing.bathrooms) : '',
    city:         listing.location?.city ?? '',
    area:         listing.location?.area ?? '',
    address:      listing.location?.address ?? '',
    status:       STATUS_OPTS.some((o) => o.value === listing.status) ? listing.status : 'available',
    // Leaflet wants [lat, lng]; the API stores [lng, lat]
    pin: Array.isArray(coords) && coords.length === 2 ? [coords[1], coords[0]] : null,
    images: Array.isArray(listing.images)
      ? listing.images.map(({ url, publicId }) => ({ url, publicId }))
      : [],
  }
}

// ── Validation ────────────────────────────────────────────────────────────────

const isBlank = (v) => !v || !String(v).trim()

/** Positive finite number check that rejects "12abc" and empty strings. */
const numberError = (value, label, { required = false, integer = false } = {}) => {
  if (isBlank(value)) return required ? `${label} is required.` : null
  const n = Number(value)
  if (!Number.isFinite(n)) return `${label} must be a number.`
  if (n < 0) return `${label} cannot be negative.`
  if (integer && !Number.isInteger(n)) return `${label} must be a whole number.`
  return null
}

export function validateForm(form) {
  const errors = {}
  const isLand = form.propertyType === 'land'

  if (isBlank(form.title)) errors.title = 'Title is required.'
  else if (form.title.trim().length > MAX_TITLE) errors.title = `Title cannot exceed ${MAX_TITLE} characters.`

  if (isBlank(form.description)) errors.description = 'Description is required.'
  else if (form.description.trim().length > MAX_DESCRIPTION) {
    errors.description = `Description cannot exceed ${MAX_DESCRIPTION} characters.`
  }

  if (!TYPE_OPTS.some((o) => o.value === form.propertyType)) errors.propertyType = 'Choose a property type.'
  if (!PURPOSE_OPTS.some((o) => o.value === form.purpose)) errors.purpose = 'Choose sale or rent.'

  const priceError = numberError(form.price, 'Price', { required: true })
  if (priceError) errors.price = priceError

  const sizeError = numberError(form.size, 'Area')
  if (sizeError) errors.size = sizeError

  if (!isLand) {
    const bedError  = numberError(form.bedrooms, 'Bedrooms', { integer: true })
    const bathError = numberError(form.bathrooms, 'Bathrooms', { integer: true })
    if (bedError)  errors.bedrooms  = bedError
    if (bathError) errors.bathrooms = bathError
  }

  if (isBlank(form.city)) errors.city = 'City is required.'

  return errors
}

/**
 * Builds the API payload. Only fields the server's allowlist accepts are sent;
 * coordinates are converted to GeoJSON here — longitude first.
 */
export function formToPayload(form) {
  const isLand = form.propertyType === 'land'
  const toNum = (v) => (isBlank(v) ? undefined : Number(v))

  const location = {
    city: form.city.trim(),
    area: form.area.trim(),
    address: form.address.trim(),
  }

  if (form.pin) {
    const [lat, lng] = form.pin
    location.coordinates = { type: 'Point', coordinates: [lng, lat] } // [lng, lat]
  }

  return {
    title: form.title.trim(),
    description: form.description.trim(),
    propertyType: form.propertyType,
    purpose: form.purpose,
    price: toNum(form.price),
    size: toNum(form.size),
    bedrooms: isLand ? null : (toNum(form.bedrooms) ?? null),
    bathrooms: isLand ? null : (toNum(form.bathrooms) ?? null),
    status: form.status,
    location,
    images: form.images,
  }
}

// ── Field primitives ──────────────────────────────────────────────────────────

const INPUT_CLS =
  'w-full px-4 py-3.5 rounded-xl bg-ivory border text-sm text-charcoal placeholder-charcoal/28 ' +
  'focus:outline-none focus:ring-1 transition-all duration-200'

const okCls  = 'border-black/8 focus:border-gold/55 focus:ring-gold/18'
const badCls = 'border-red-300 focus:border-red-400 focus:ring-red-200'

function Field({ id, label, error, hint, required, children }) {
  return (
    <div>
      <label htmlFor={id} className="text-[10px] font-semibold tracking-[0.16em] text-charcoal/42 uppercase block mb-1.5">
        {label}
        {required && <span className="text-gold ml-1" aria-hidden="true">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-charcoal/40">{hint}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  )
}

function TextField({ id, label, value, onChange, error, hint, required, ...rest }) {
  return (
    <Field id={id} label={label} error={error} hint={hint} required={required}>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${INPUT_CLS} ${error ? badCls : okCls}`}
        {...rest}
      />
    </Field>
  )
}

function SelectField({ id, label, value, onChange, error, options, required, hint }) {
  return (
    <Field id={id} label={label} error={error} required={required} hint={hint}>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${INPUT_CLS} ${error ? badCls : okCls} cursor-pointer appearance-none bg-no-repeat`}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230F3D2E' stroke-width='2.5' stroke-linecap='round'%3e%3cpolyline points='6 9 12 15 18 9'/%3e%3c/svg%3e\")",
          backgroundPosition: 'right 1rem center',
          backgroundSize: '0.85rem',
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </Field>
  )
}

/** Radio group rendered as cards — larger targets, still keyboard-native. */
function ChoiceGroup({ name, label, value, onChange, options, error }) {
  return (
    <fieldset>
      <legend className="text-[10px] font-semibold tracking-[0.16em] text-charcoal/42 uppercase mb-2">
        {label}
        <span className="text-gold ml-1" aria-hidden="true">*</span>
      </legend>

      <div className="grid grid-cols-2 gap-3">
        {options.map((o) => {
          const active = value === o.value
          return (
            <label
              key={o.value}
              className={`relative cursor-pointer rounded-2xl border px-4 py-3.5 transition-all duration-200 focus-within:ring-2 focus-within:ring-gold focus-within:ring-offset-2 ${
                active
                  ? 'border-gold bg-gold/[0.07] shadow-sm'
                  : 'border-black/10 bg-ivory hover:border-forest/30'
              }`}
            >
              <input
                type="radio"
                name={name}
                value={o.value}
                checked={active}
                onChange={() => onChange(o.value)}
                className="sr-only"
              />
              <span className={`block text-sm font-semibold ${active ? 'text-gold-dark' : 'text-charcoal/70'}`}>
                {o.label}
              </span>
              {o.hint && (
                <span className="block text-[11px] text-charcoal/40 mt-0.5">{o.hint}</span>
              )}
            </label>
          )
        })}
      </div>

      {error && <p role="alert" className="mt-1.5 text-xs text-red-500">{error}</p>}
    </fieldset>
  )
}

function Section({ title, description, children }) {
  return (
    <section className="bg-white rounded-[26px] shadow-sm border border-black/[0.05] p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="font-serif text-xl text-forest font-bold">{title}</h2>
        {description && (
          <p className="text-sm text-charcoal/45 mt-1 leading-relaxed">{description}</p>
        )}
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  )
}

// ── Form ──────────────────────────────────────────────────────────────────────

/**
 * Shared create/edit form.
 *
 * Field state lives here; the parent page owns submission. On a failed request
 * the parent re-renders with the same state, so nothing the owner typed is lost.
 */
export default function PropertyForm({ mode, initialValues, submitting, submitError, onSubmit, onCancel }) {
  const [form, setForm]     = useState(initialValues ?? EMPTY_FORM)
  const [errors, setErrors] = useState({})

  const isLand = form.propertyType === 'land'
  const set = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return // guards against a double-click submitting twice

    const found = validateForm(form)
    setErrors(found)

    if (Object.keys(found).length > 0) {
      // Move the owner to the first problem rather than leaving them guessing
      const firstId = Object.keys(found)[0]
      document.getElementById(firstId)?.focus()
      document.getElementById(firstId)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    onSubmit(formToPayload(form))
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">

      {/* Review notice — the rule owners most need to know up front */}
      <div className="flex items-start gap-3 rounded-2xl bg-gold/[0.08] border border-gold/25 px-5 py-4">
        <IoInformationCircleOutline className="w-5 h-5 text-gold-dark shrink-0 mt-px" aria-hidden="true" />
        <p className="text-sm text-charcoal/65 leading-relaxed">
          {mode === 'edit' ? (
            <>
              Saving changes sends this property back to <strong className="font-semibold text-forest">pending review</strong>.
              It stays out of public listings until an admin approves it again.
            </>
          ) : (
            <>
              New properties are <strong className="font-semibold text-forest">reviewed by an admin</strong> before
              they appear in public listings. You can edit or delete yours at any time.
            </>
          )}
        </p>
      </div>

      {/* ── Basics ───────────────────────────────────────────────────────── */}
      <Section title="Basics" description="What is this property, and how are you offering it?">
        <TextField
          id="title"
          label="Title"
          required
          value={form.title}
          onChange={set('title')}
          error={errors.title}
          placeholder="Sunlit two-bedroom near Achrafieh"
          maxLength={MAX_TITLE}
          hint={`${form.title.length}/${MAX_TITLE} characters`}
        />

        <Field id="description" label="Description" error={errors.description} required
               hint={`${form.description.length}/${MAX_DESCRIPTION} characters`}>
          <textarea
            id="description"
            rows={6}
            value={form.description}
            onChange={(e) => set('description')(e.target.value)}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={errors.description ? 'description-error' : undefined}
            maxLength={MAX_DESCRIPTION}
            placeholder="Describe the layout, condition, view, nearby amenities…"
            className={`${INPUT_CLS} ${errors.description ? badCls : okCls} resize-y leading-relaxed`}
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-6">
          <ChoiceGroup
            name="propertyType"
            label="Property type"
            value={form.propertyType}
            onChange={set('propertyType')}
            options={TYPE_OPTS}
            error={errors.propertyType}
          />
          <ChoiceGroup
            name="purpose"
            label="Listing purpose"
            value={form.purpose}
            onChange={set('purpose')}
            options={PURPOSE_OPTS}
            error={errors.purpose}
          />
        </div>
      </Section>

      {/* ── Details ──────────────────────────────────────────────────────── */}
      <Section
        title="Details"
        description={isLand
          ? 'Land plots only need a price and a plot size.'
          : 'Price, size, and room counts.'}
      >
        <div className="grid sm:grid-cols-2 gap-6">
          <TextField
            id="price"
            label={form.purpose === 'rent' ? 'Monthly price (USD)' : 'Price (USD)'}
            required
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={form.price}
            onChange={set('price')}
            error={errors.price}
            placeholder="250000"
          />
          <TextField
            id="size"
            label={isLand ? 'Plot area (m²)' : 'Area (m²)'}
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={form.size}
            onChange={set('size')}
            error={errors.size}
            placeholder="140"
          />
        </div>

        {/* Room counts are meaningless for land */}
        {!isLand && (
          <div className="grid sm:grid-cols-2 gap-6">
            <TextField
              id="bedrooms"
              label="Bedrooms"
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              value={form.bedrooms}
              onChange={set('bedrooms')}
              error={errors.bedrooms}
              placeholder="2"
            />
            <TextField
              id="bathrooms"
              label="Bathrooms"
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              value={form.bathrooms}
              onChange={set('bathrooms')}
              error={errors.bathrooms}
              placeholder="1"
            />
          </div>
        )}

        <SelectField
          id="status"
          label="Availability"
          value={form.status}
          onChange={set('status')}
          options={STATUS_OPTS}
          hint="Mark a property rented or sold to keep it visible but flagged as taken."
        />
      </Section>

      {/* ── Location ─────────────────────────────────────────────────────── */}
      <Section title="Location" description="Where is the property?">
        <div className="grid sm:grid-cols-2 gap-6">
          <SelectField
            id="city"
            label="City"
            required
            value={form.city}
            onChange={set('city')}
            error={errors.city}
            options={[{ value: '', label: 'Select a city' }, ...CITIES.map((c) => ({ value: c, label: c }))]}
          />
          <TextField
            id="area"
            label="Area / neighbourhood"
            value={form.area}
            onChange={set('area')}
            error={errors.area}
            placeholder="Achrafieh"
          />
        </div>

        <TextField
          id="address"
          label="Street address"
          value={form.address}
          onChange={set('address')}
          error={errors.address}
          placeholder="Rue Sursock, building name, floor"
          hint="Optional. Shown to interested buyers on the property page."
        />

        <LocationPicker
          value={form.pin}
          city={form.city}
          onChange={set('pin')}
        />
      </Section>

      {/* ── Photos ───────────────────────────────────────────────────────── */}
      <Section title="Photos" description="Good photos are the single biggest driver of enquiries.">
        <ImageUploader
          images={form.images}
          onChange={set('images')}
          disabled={submitting}
        />
      </Section>

      {/* ── Submit ───────────────────────────────────────────────────────── */}
      {submitError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl bg-red-50 border border-red-100 px-5 py-4"
        >
          <IoAlertCircleOutline className="w-5 h-5 text-red-500 shrink-0 mt-px" aria-hidden="true" />
          <div>
            <p className="text-sm text-red-600 font-medium">{submitError}</p>
            <p className="text-xs text-red-500/70 mt-1">
              Nothing was lost — your details are still here. Fix the issue and try again.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end items-stretch sm:items-center gap-3 pb-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-8 py-3.5 rounded-full text-sm font-medium text-charcoal/65 border border-black/10 hover:border-forest/35 hover:text-forest transition-colors duration-200 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
        >
          Cancel
        </button>

        <motion.button
          type="submit"
          disabled={submitting}
          whileHover={submitting ? undefined : { y: -1 }}
          whileTap={submitting ? undefined : { scale: 0.99 }}
          className="btn-gold text-sm py-4 px-10 rounded-full disabled:opacity-55 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              {mode === 'edit' ? 'Saving…' : 'Submitting…'}
            </span>
          ) : (
            mode === 'edit' ? 'Save changes' : 'Submit for review'
          )}
        </motion.button>
      </div>
    </form>
  )
}
