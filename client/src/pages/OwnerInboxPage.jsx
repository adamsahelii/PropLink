import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IoMailOpenOutline, IoLocationOutline, IoCallOutline, IoMailOutline,
  IoPersonOutline, IoRefreshOutline, IoCheckmarkDoneOutline,
  IoCloseCircleOutline, IoArrowUndoOutline,
} from 'react-icons/io5'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import useOwnerInquiries from '../hooks/useOwnerInquiries'

const EASE = [0.25, 0.46, 0.45, 0.94]
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80'

const TABS = [
  { key: 'new',       label: 'New' },
  { key: 'responded', label: 'Responded' },
  { key: 'closed',    label: 'Closed' },
  { key: '',          label: 'All' },
]

const STATUS_STYLES = {
  new:       { label: 'New',       cls: 'bg-gold/12 text-gold border-gold/25' },
  responded: { label: 'Responded', cls: 'bg-forest/10 text-forest border-forest/20' },
  closed:    { label: 'Closed',    cls: 'bg-charcoal/6 text-charcoal/45 border-charcoal/12' },
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function formatPrice(price) {
  if (price == null) return null
  return `$${price.toLocaleString()}`
}

function openEmail(email, listingTitle) {
  const subject = encodeURIComponent(`Re: your inquiry about ${listingTitle ?? 'my property'}`)
  window.location.href = `mailto:${email}?subject=${subject}`
}

function openCall(phone) {
  window.location.href = `tel:${phone}`
}

function openWhatsApp(phone) {
  window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank', 'noopener,noreferrer')
}

const contactBtn = 'flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl transition-colors'

function InboxCard({ inquiry, index, onStatusChange }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr]   = useState('')
  const listing = inquiry.listingId   // populated: title slug price location images
  const buyer   = inquiry.userId      // populated: name email phoneNumber profileImage
  const status  = STATUS_STYLES[inquiry.status] ?? STATUS_STYLES.new
  const img     = listing?.images?.[0]?.url || FALLBACK_IMG
  const phone   = inquiry.contactPhone || buyer?.phoneNumber

  async function change(newStatus) {
    setBusy(true)
    setErr('')
    const ok = await onStatusChange(inquiry._id, newStatus)
    if (!ok) { setErr('Could not update status. Try again.'); setBusy(false) }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4, ease: EASE }}
      className={`bg-white rounded-[24px] border shadow-sm overflow-hidden ${
        inquiry.status === 'new' ? 'border-gold/30' : 'border-black/[0.05]'
      }`}
    >
      {/* Listing strip */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-black/5 bg-ivory/60">
        <img
          src={img}
          alt={listing?.title ?? 'Listing'}
          className="w-14 h-14 rounded-xl object-cover shrink-0"
          onError={e => { e.currentTarget.src = FALLBACK_IMG }}
        />
        <div className="min-w-0 flex-1">
          {listing ? (
            <Link
              to={`/listings/${listing.slug}`}
              className="font-serif text-base font-bold text-forest hover:text-gold transition-colors truncate block"
            >
              {listing.title}
            </Link>
          ) : (
            <p className="font-serif text-base font-bold text-charcoal/40">Listing no longer available</p>
          )}
          <div className="flex items-center gap-3 mt-0.5 text-xs text-charcoal/45">
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
        <span className={`shrink-0 text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full border ${status.cls}`}>
          {status.label}
        </span>
      </div>

      <div className="p-6 flex flex-col gap-4">
        {/* Buyer */}
        <div className="flex items-center gap-3">
          {buyer?.profileImage?.url ? (
            <img src={buyer.profileImage.url} alt={buyer.name} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-forest/8 flex items-center justify-center">
              <IoPersonOutline className="w-5 h-5 text-forest/60" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-charcoal">{buyer?.name ?? 'PropLink user'}</p>
            <p className="text-xs text-charcoal/45 truncate">
              {[buyer?.email, phone].filter(Boolean).join(' · ')}
            </p>
          </div>
          <p className="ml-auto text-[11px] text-charcoal/35 shrink-0">{formatDate(inquiry.createdAt)}</p>
        </div>

        {/* Message */}
        <div className="bg-ivory rounded-2xl px-4 py-3">
          <p className="text-sm text-charcoal/75 whitespace-pre-line">{inquiry.message}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {buyer?.email && (
              <button type="button" onClick={() => openEmail(buyer.email, listing?.title)}
                className={`${contactBtn} bg-forest/7 text-forest hover:bg-forest/12`}>
                <IoMailOutline className="w-3.5 h-3.5" /> Email
              </button>
            )}
            {phone && (
              <button type="button" onClick={() => openCall(phone)}
                className={`${contactBtn} bg-forest/7 text-forest hover:bg-forest/12`}>
                <IoCallOutline className="w-3.5 h-3.5" /> Call
              </button>
            )}
            {phone && (
              <button type="button" onClick={() => openWhatsApp(phone)}
                className={`${contactBtn} bg-[#25D366]/10 text-[#128C4B] hover:bg-[#25D366]/18`}>
                💬 WhatsApp
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {inquiry.status === 'new' && (
              <button type="button" disabled={busy} onClick={() => change('responded')}
                className={`${contactBtn} bg-gold text-white hover:bg-gold/85 disabled:opacity-50`}>
                <IoCheckmarkDoneOutline className="w-3.5 h-3.5" /> Mark responded
              </button>
            )}
            {inquiry.status !== 'closed' && (
              <button type="button" disabled={busy} onClick={() => change('closed')}
                className={`${contactBtn} border border-black/10 text-charcoal/60 hover:text-charcoal disabled:opacity-50`}>
                <IoCloseCircleOutline className="w-3.5 h-3.5" /> Close
              </button>
            )}
            {inquiry.status === 'closed' && (
              <button type="button" disabled={busy} onClick={() => change('responded')}
                className={`${contactBtn} border border-black/10 text-charcoal/60 hover:text-charcoal disabled:opacity-50`}>
                <IoArrowUndoOutline className="w-3.5 h-3.5" /> Reopen
              </button>
            )}
          </div>
        </div>

        {err && <p className="text-xs text-red-500">{err}</p>}
      </div>
    </motion.div>
  )
}

export default function OwnerInboxPage() {
  const [tab, setTab] = useState('new')
  const { inquiries, total, loading, error, refresh, updateStatus } = useOwnerInquiries(tab)

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
              <h1 className="section-title mb-1">Inbox</h1>
              <p className="text-charcoal/45 text-sm">Inquiries from buyers across all your listings.</p>
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
            <IoMailOpenOutline className="w-12 h-12 text-gold/60 mx-auto mb-4" />
            <p className="font-serif text-xl text-forest font-bold mb-2">
              {tab === 'new' ? "You're all caught up" : 'Nothing here'}
            </p>
            <p className="text-charcoal/45 text-sm max-w-xs mx-auto">
              {tab === 'new'
                ? 'New inquiries from buyers will appear here.'
                : 'No inquiries match this filter.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <AnimatePresence>
              {inquiries.map((inq, i) => (
                <InboxCard key={inq._id} inquiry={inq} index={i} onStatusChange={updateStatus} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}