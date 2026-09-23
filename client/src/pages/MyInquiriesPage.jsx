import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IoChatbubblesOutline, IoLocationOutline, IoCallOutline,
  IoPersonOutline, IoRefreshOutline,
} from 'react-icons/io5'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import useMyInquiries from '../hooks/useMyInquiries'

const EASE = [0.25, 0.46, 0.45, 0.94]
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80'

const TABS = [
  { key: '',          label: 'All' },
  { key: 'new',       label: 'Awaiting Reply' },
  { key: 'responded', label: 'Responded' },
  { key: 'closed',    label: 'Closed' },
]

const STATUS_STYLES = {
  new:       { label: 'Awaiting reply', cls: 'bg-gold/12 text-gold border-gold/25' },
  responded: { label: 'Responded',      cls: 'bg-forest/10 text-forest border-forest/20' },
  closed:    { label: 'Closed',         cls: 'bg-charcoal/6 text-charcoal/45 border-charcoal/12' },
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatPrice(price) {
  if (price == null) return null
  return `$${price.toLocaleString()}`
}

function callOwner(phone) {
  window.location.href = `tel:${phone}`
}

function whatsappOwner(phone) {
  window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank', 'noopener,noreferrer')
}

function InquiryCard({ inquiry, index }) {
  const listing = inquiry.listingId   // populated: title slug price location images
  const owner   = inquiry.ownerId     // populated: name phoneNumber profileImage
  const status  = STATUS_STYLES[inquiry.status] ?? STATUS_STYLES.new
  const img     = listing?.images?.[0]?.url || FALLBACK_IMG

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4, ease: EASE }}
      className="bg-white rounded-[24px] border border-black/[0.05] shadow-sm overflow-hidden flex flex-col sm:flex-row"
    >
      {/* Listing thumbnail */}
      <div className="sm:w-52 h-40 sm:h-auto shrink-0">
        <img
          src={img}
          alt={listing?.title ?? 'Listing'}
          className="w-full h-full object-cover"
          onError={e => { e.currentTarget.src = FALLBACK_IMG }}
        />
      </div>

      <div className="flex-1 p-6 flex flex-col gap-4">
        {/* Header: title + status */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            {listing ? (
              <Link
                to={`/listings/${listing.slug}`}
                className="font-serif text-lg font-bold text-forest hover:text-gold transition-colors"
              >
                {listing.title}
              </Link>
            ) : (
              <p className="font-serif text-lg font-bold text-charcoal/40">Listing no longer available</p>
            )}
            <div className="flex items-center gap-3 mt-1 text-xs text-charcoal/45">
              {listing?.location?.city && (
                <span className="flex items-center gap-1">
                  <IoLocationOutline className="w-3.5 h-3.5 text-gold" />
                  {[listing.location.area, listing.location.city].filter(Boolean).join(', ')}
                </span>
              )}
              {formatPrice(listing?.price) && (
                <span className="font-semibold text-gold">{formatPrice(listing.price)}</span>
              )}
            </div>
          </div>
          <span className={`text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full border ${status.cls}`}>
            {status.label}
          </span>
        </div>

        {/* Message */}
        <div className="bg-ivory rounded-2xl px-4 py-3">
          <p className="text-[10px] font-semibold tracking-[0.15em] text-charcoal/38 uppercase mb-1">
            Your message · {formatDate(inquiry.createdAt)}
          </p>
          <p className="text-sm text-charcoal/70 whitespace-pre-line line-clamp-4">{inquiry.message}</p>
        </div>

        {/* Owner */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2.5">
            {owner?.profileImage?.url ? (
              <img src={owner.profileImage.url} alt={owner.name} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-forest/8 flex items-center justify-center">
                <IoPersonOutline className="w-4 h-4 text-forest/60" />
              </div>
            )}
            <div>
              <p className="text-[10px] text-charcoal/38 uppercase tracking-wider">Owner</p>
              <p className="text-sm font-medium text-charcoal">{owner?.name ?? 'Property Owner'}</p>
            </div>
          </div>

          {owner?.phoneNumber && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => callOwner(owner.phoneNumber)}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl bg-forest/7 text-forest hover:bg-forest/12 transition-colors"
              >
                <IoCallOutline className="w-3.5 h-3.5" /> Call
              </button>
              <button
                type="button"
                onClick={() => whatsappOwner(owner.phoneNumber)}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl bg-[#25D366]/10 text-[#128C4B] hover:bg-[#25D366]/18 transition-colors"
              >
                💬 WhatsApp
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function MyInquiriesPage() {
  const [tab, setTab] = useState('')
  const { inquiries, total, loading, error, refresh } = useMyInquiries(tab)

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 pt-32 pb-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-6 bg-gold/45" />
            <p className="section-label">Messaging</p>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="section-title mb-1">My Inquiries</h1>
              <p className="text-charcoal/45 text-sm">Every inquiry you've sent to property owners, in one place.</p>
            </div>
            <button
              onClick={refresh}
              className="flex items-center gap-1.5 text-xs font-medium text-charcoal/50 hover:text-forest transition-colors"
            >
              <IoRefreshOutline className="w-4 h-4" /> Refresh
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-8">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 text-xs font-semibold px-4 py-2 rounded-full transition-all duration-200 ${
                tab === t.key
                  ? 'bg-forest text-white'
                  : 'bg-white border border-black/8 text-charcoal/55 hover:text-forest'
              }`}
            >
              {t.label}
              {tab === t.key && !loading && <span className="ml-1.5 opacity-70">({total})</span>}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-10 h-10 border-2 border-forest border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 text-sm mb-4">{error}</p>
            <button onClick={refresh} className="btn-outline-forest text-xs py-2.5 px-6">Try again</button>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[24px] border border-black/[0.04]">
            <IoChatbubblesOutline className="w-12 h-12 text-gold/60 mx-auto mb-4" />
            <p className="font-serif text-xl text-forest font-bold mb-2">
              {tab ? 'Nothing here yet' : 'No inquiries yet'}
            </p>
            <p className="text-charcoal/45 text-sm mb-6 max-w-xs mx-auto">
              {tab
                ? 'No inquiries match this filter.'
                : 'When you contact an owner about a property, it will show up here.'}
            </p>
            {!tab && <Link to="/listings" className="btn-gold text-xs">Browse Properties</Link>}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <AnimatePresence>
              {inquiries.map((inq, i) => (
                <InquiryCard key={inq._id} inquiry={inq} index={i} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}