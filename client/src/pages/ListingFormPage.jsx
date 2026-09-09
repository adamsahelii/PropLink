import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { IoArrowBackOutline, IoAlertCircleOutline, IoRefreshOutline } from 'react-icons/io5'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import PropertyForm, { EMPTY_FORM, listingToForm } from '../components/owner/PropertyForm'
import useOwnedListing from '../hooks/useOwnedListing'
import { listingsApi } from '../utils/api'

const EASE = [0.25, 0.46, 0.45, 0.94]

/**
 * Serves both /my-listings/new and /my-listings/:id/edit.
 *
 * In edit mode the listing is loaded from /api/listings/my/:id — the owner-scoped
 * endpoint — because the public slug route only returns approved listings.
 */
export default function ListingFormPage({ mode = 'create' }) {
  const { id } = useParams()
  const navigate = useNavigate()

  const isEdit = mode === 'edit'
  const { listing, loading, error } = useOwnedListing(isEdit ? id : null)

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  async function handleSubmit(payload) {
    setSubmitting(true)
    setSubmitError('')

    try {
      if (isEdit) {
        await listingsApi.update(id, payload)
        navigate('/my-listings', {
          state: { flash: 'Changes saved. Your property is pending review again.' },
        })
      } else {
        await listingsApi.create(payload)
        navigate('/my-listings', { state: { flash: 'Property submitted for review.' } })
      }
    } catch (err) {
      // Stay on the page — PropertyForm keeps every value the owner entered
      setSubmitError(err.message)
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    } finally {
      setSubmitting(false)
    }
  }

  const heading  = isEdit ? 'Edit Property' : 'Add a Property'
  const subtitle = isEdit
    ? 'Update the details below. Saved changes go back through review.'
    : 'Tell us about the property. An admin reviews it before it goes live.'

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

        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <Link
              to="/my-listings"
              className="inline-flex items-center gap-2 text-white/55 hover:text-gold text-xs font-medium tracking-wide transition-colors duration-200 mb-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
            >
              <IoArrowBackOutline className="w-4 h-4" aria-hidden="true" />
              Back to my properties
            </Link>

            <h1 className="font-serif text-3xl sm:text-4xl text-white font-bold leading-tight mb-2">
              {heading}
            </h1>
            <p className="text-white/50 text-sm">{subtitle}</p>
          </motion.div>
        </div>
      </section>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <section className="flex-1 bg-ivory py-10 px-4">
        <div className="max-w-3xl mx-auto">

          {/* Loading the listing being edited */}
          {isEdit && loading && (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-[26px] p-8 animate-pulse shadow-sm">
                  <div className="h-5 bg-gray-100 rounded-full w-1/3 mb-6" />
                  <div className="space-y-4">
                    <div className="h-12 bg-gray-100 rounded-xl" />
                    <div className="h-12 bg-gray-100 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Could not load it */}
          {isEdit && !loading && error && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
                <IoAlertCircleOutline className="w-7 h-7 text-red-400" aria-hidden="true" />
              </div>
              <h2 className="font-serif text-2xl text-forest font-bold mb-3">
                Could not load this property
              </h2>
              <p className="text-charcoal/50 text-sm max-w-sm mx-auto leading-relaxed mb-8">{error}</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="btn-outline-forest inline-flex items-center gap-2 rounded-full text-xs py-3 px-7"
                >
                  <IoRefreshOutline className="w-4 h-4" aria-hidden="true" />
                  Try again
                </button>
                <Link to="/my-listings" className="btn-gold rounded-full text-xs py-3 px-7">
                  Back to my properties
                </Link>
              </div>
            </div>
          )}

          {/* The form itself — mounted only once its values are known, so
              `initialValues` is never stale */}
          {(!isEdit || (!loading && !error && listing)) && (
            <PropertyForm
              mode={mode}
              initialValues={isEdit ? listingToForm(listing) : EMPTY_FORM}
              submitting={submitting}
              submitError={submitError}
              onSubmit={handleSubmit}
              onCancel={() => navigate('/my-listings')}
            />
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
