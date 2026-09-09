import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  IoLocationOutline, IoCreateOutline, IoTrashOutline,
  IoImageOutline, IoOpenOutline, IoBedOutline, IoWaterOutline,
} from 'react-icons/io5'
import { fadeUp } from '../../utils/motion'
import { ApprovalBadge, AvailabilityBadge } from '../StatusBadge'

/**
 * One property in the owner dashboard. Shows the management view of a
 * listing — including pending and rejected ones, which never appear publicly.
 */
export default function OwnerListingCard({ listing, onDelete }) {
  const {
    _id, title, slug, location, price, purpose, propertyType,
    bedrooms, bathrooms, size, images, status, approvalStatus, rejectionReason,
  } = listing

  const cover = images?.[0]?.url
  // Only approved listings resolve on the public slug route
  const publicUrl = approvalStatus === 'approved' && slug ? `/listings/${slug}` : null

  return (
    <motion.article
      variants={fadeUp}
      className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl hover:shadow-forest/10 transition-shadow duration-300 flex flex-col"
    >
      {/* ── Cover ──────────────────────────────────────────────────────── */}
      <div className="relative h-48 bg-forest/[0.07] shrink-0">
        {cover ? (
          <img src={cover} alt="" className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-forest/30">
            <IoImageOutline className="w-8 h-8" aria-hidden="true" />
            <span className="text-[11px] font-medium">No photo yet</span>
          </div>
        )}

        <div className="absolute top-3 left-3">
          <span className="bg-gold text-white text-[10px] font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full">
            {purpose === 'rent' ? 'For Rent' : 'For Sale'}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <span className="bg-black/35 backdrop-blur-sm border border-white/20 text-white text-[10px] font-medium uppercase px-3 py-1.5 rounded-full">
            {propertyType}
          </span>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <ApprovalBadge status={approvalStatus} />
          <AvailabilityBadge status={status} />
        </div>

        <h3 className="font-serif text-lg font-semibold text-charcoal line-clamp-1 mb-1.5">
          {title}
        </h3>

        <div className="flex items-center gap-1.5 text-charcoal/45 text-sm mb-3">
          <IoLocationOutline className="w-4 h-4 shrink-0 text-gold" aria-hidden="true" />
          <span className="truncate">
            {location?.area ? `${location.area}, ` : ''}{location?.city}
          </span>
        </div>

        <p className="font-serif text-xl text-forest font-bold mb-3">
          ${price?.toLocaleString()}
          {purpose === 'rent' && (
            <span className="text-charcoal/40 text-sm font-sans font-normal"> /mo</span>
          )}
        </p>

        {(bedrooms != null || bathrooms != null || size != null) && (
          <div className="flex items-center gap-4 text-charcoal/45 text-xs mb-4">
            {bedrooms != null && (
              <span className="flex items-center gap-1.5">
                <IoBedOutline className="w-4 h-4" aria-hidden="true" />
                {bedrooms} {bedrooms === 1 ? 'Bed' : 'Beds'}
              </span>
            )}
            {bathrooms != null && (
              <span className="flex items-center gap-1.5">
                <IoWaterOutline className="w-4 h-4" aria-hidden="true" />
                {bathrooms} {bathrooms === 1 ? 'Bath' : 'Baths'}
              </span>
            )}
            {size != null && <span className="ml-auto">{size.toLocaleString()} m²</span>}
          </div>
        )}

        {/* Rejection feedback — the one thing an owner most needs to see */}
        {approvalStatus === 'rejected' && (
          <div className="mb-4 rounded-2xl bg-red-50 border border-red-100 px-4 py-3">
            <p className="text-[10px] font-semibold tracking-[0.14em] text-red-500 uppercase mb-1">
              Reviewer feedback
            </p>
            <p className="text-xs text-red-600/85 leading-relaxed">
              {rejectionReason || 'No reason provided.'}
            </p>
          </div>
        )}

        {approvalStatus === 'pending' && (
          <p className="mb-4 text-xs text-charcoal/45 leading-relaxed">
            Awaiting admin approval. It stays out of public listings until approved.
          </p>
        )}

        {/* ── Actions ──────────────────────────────────────────────────── */}
        <div className="mt-auto pt-4 border-t border-black/[0.06] flex items-center gap-2">
          <Link
            to={`/my-listings/${_id}/edit`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold tracking-wide py-2.5 rounded-full border border-forest text-forest hover:bg-forest hover:text-white transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
          >
            <IoCreateOutline className="w-4 h-4" aria-hidden="true" />
            Edit
          </Link>

          {publicUrl && (
            <Link
              to={publicUrl}
              className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-black/10 text-charcoal/55 hover:text-forest hover:border-forest/35 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
              aria-label={`View public page for ${title}`}
              title="View public page"
            >
              <IoOpenOutline className="w-4 h-4" aria-hidden="true" />
            </Link>
          )}

          <button
            type="button"
            onClick={() => onDelete(listing)}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-black/10 text-charcoal/45 hover:text-red-500 hover:border-red-200 hover:bg-red-50/60 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
            aria-label={`Delete ${title}`}
            title="Delete property"
          >
            <IoTrashOutline className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </motion.article>
  )
}
