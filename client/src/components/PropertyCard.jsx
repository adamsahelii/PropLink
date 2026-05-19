import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fadeUp } from '../utils/motion'
import { IoBedOutline, IoWaterOutline, IoLocationOutline } from 'react-icons/io5'

const CARD_IMAGES = [
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=75',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=75',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=75',
]

export default function PropertyCard({ property, index = 0 }) {
  const { title, location, price, propertyType, purpose, bedrooms, bathrooms, slug } = property

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="group bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl hover:shadow-forest/10 transition-shadow duration-400"
    >
      {/* Image */}
      <div className="relative h-60 overflow-hidden rounded-t-3xl">
        <motion.img
          src={CARD_IMAGES[index % CARD_IMAGES.length]}
          alt={title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        />

        {/* Dark gradient bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Purpose badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-gold text-white text-[10px] font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full">
            {purpose === 'rent' ? 'For Rent' : 'For Sale'}
          </span>
        </div>

        {/* Type badge */}
        <div className="absolute top-4 right-4">
          <span className="bg-black/30 backdrop-blur-sm border border-white/20 text-white text-[10px] font-medium uppercase px-3 py-1.5 rounded-full">
            {propertyType}
          </span>
        </div>

        {/* Price */}
        <div className="absolute bottom-4 left-4">
          <p className="text-white font-serif text-xl font-bold drop-shadow-md">
            ${price?.toLocaleString()}
            {purpose === 'rent' && (
              <span className="text-white/70 text-sm font-sans font-normal"> /mo</span>
            )}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <h3 className="font-serif text-lg font-semibold text-charcoal group-hover:text-forest transition-colors duration-200 line-clamp-1 mb-2">
          {title}
        </h3>

        <div className="flex items-center gap-1.5 text-gray-400 text-sm mb-4">
          <IoLocationOutline className="w-4 h-4 shrink-0 text-gold" />
          <span className="truncate">
            {location?.area ? `${location.area}, ` : ''}{location?.city}
          </span>
        </div>

        {(bedrooms != null || bathrooms != null) && (
          <div className="flex items-center gap-4 text-gray-400 text-sm mb-5 pb-4 border-b border-gray-100">
            {bedrooms != null && (
              <div className="flex items-center gap-1.5">
                <IoBedOutline className="w-4 h-4" />
                <span>{bedrooms} Beds</span>
              </div>
            )}
            {bathrooms != null && (
              <div className="flex items-center gap-1.5">
                <IoWaterOutline className="w-4 h-4" />
                <span>{bathrooms} Baths</span>
              </div>
            )}
          </div>
        )}

        <Link
          to={`/listings/${slug}`}
          className="block text-center btn-outline-forest text-xs py-2.5 w-full rounded-full"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  )
}
