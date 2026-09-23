import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fadeUp } from '../utils/motion'
import { IoBedOutline, IoWaterOutline, IoLocationOutline, IoImageOutline, IoHeart, IoHeartOutline } from 'react-icons/io5'
import { useAuth } from '../context/AuthContext'
import { useFavorites } from '../context/FavoritesContext'
import noPhoto from '../assets/no-photo.jpg'
// const CARD_IMAGES = [
//   'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=75',
//   'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=75',
//   'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=75',
// ]

export default function PropertyCard({ property, index = 0 }) {
    const { title, location, price, propertyType, purpose, bedrooms, bathrooms, size, images, slug, status } = property
  const imgSrc = images?.[0]?.url || noPhoto

  const { user } = useAuth()
  const { isFavorite, toggleFavorite } = useFavorites()
  const navigate = useNavigate()
  const saved = isFavorite(property._id)
  const isOwn = user && property.ownerId && String(property.ownerId?._id ?? property.ownerId) === String(user._id)

  const onHeartClick = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) return navigate('/login')
    try {
      await toggleFavorite(property._id)
    } catch (err) {
      console.error(err.message)
    }
  }
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="group bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl hover:shadow-forest/10 transition-shadow duration-400"
    >
      {/* Image */}
      <div className="relative h-60 overflow-hidden rounded-t-3xl bg-forest/10">
        <motion.img
          src={imgSrc}
          alt={title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = noPhoto }}
        />

        {/* Dark gradient bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Purpose + availability badges */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className="bg-gold text-white text-[10px] font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full">
            {purpose === 'rent' ? 'For Rent' : 'For Sale'}
          </span>
          {status && status !== 'available' && (
            <span className="bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full">
              {status}
            </span>
          )}
        </div>

        {/* Type badge + favorite */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span className="bg-black/30 backdrop-blur-sm border border-white/20 text-white text-[10px] font-medium uppercase px-3 py-1.5 rounded-full">
            {propertyType}
          </span>
          {!isOwn && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.85 }}
              onClick={onHeartClick}
              aria-label={saved ? 'Remove from favorites' : 'Save to favorites'}
              aria-pressed={saved}
              className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/45 transition-colors"
            >
              {saved
                ? <IoHeart className="w-4 h-4 text-gold" />
                : <IoHeartOutline className="w-4 h-4" />}
            </motion.button>
          )}
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

        {(bedrooms != null || bathrooms != null || size != null) && (
          <div className="flex items-center gap-4 text-gray-400 text-sm mb-5 pb-4 border-b border-gray-100">
            {bedrooms != null && (
              <div className="flex items-center gap-1.5">
                <IoBedOutline className="w-4 h-4" />
                <span>{bedrooms} {bedrooms === 1 ? 'Bed' : 'Beds'}</span>
              </div>
            )}
            {bathrooms != null && (
              <div className="flex items-center gap-1.5">
                <IoWaterOutline className="w-4 h-4" />
                <span>{bathrooms} {bathrooms === 1 ? 'Bath' : 'Baths'}</span>
              </div>
            )}
            {size != null && (
              <span className="ml-auto text-xs text-gray-400">{size.toLocaleString()} m²</span>
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
