import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { staggerContainer, fadeUp } from '../utils/motion'
import PropertyCard from './PropertyCard'

const DEMO_PROPERTIES = [
  {
    _id: '1',
    slug: 'modern-penthouse-beirut',
    title: 'Modern Penthouse in Achrafieh',
    location: { city: 'Beirut', area: 'Achrafieh' },
    price: 2500,
    propertyType: 'apartment',
    purpose: 'rent',
    bedrooms: 3,
    bathrooms: 2,
  },
  {
    _id: '2',
    slug: 'luxury-villa-jounieh',
    title: 'Luxury Sea-View Villa in Jounieh',
    location: { city: 'Jounieh', area: 'Kaslik' },
    price: 850000,
    propertyType: 'apartment',
    purpose: 'sale',
    bedrooms: 5,
    bathrooms: 4,
  },
  {
    _id: '3',
    slug: 'prime-land-jbeil',
    title: 'Prime Land Plot in Jbeil',
    location: { city: 'Jbeil', area: 'Blat' },
    price: 220000,
    propertyType: 'land',
    purpose: 'sale',
    bedrooms: null,
    bathrooms: null,
  },
]

export default function FeaturedProperties() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="py-28 px-4 bg-ivory">
      <div ref={ref} className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-16"
        >
          <div>
            <p className="section-label mb-3">Handpicked For You</p>
            <h2 className="section-title max-w-sm">Featured Properties</h2>
            <div className="mt-4 w-12 h-0.5 bg-gold" />
          </div>

          <motion.div whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 400 }}>
            <Link
              to="/listings"
              className="text-forest hover:text-gold font-medium text-sm tracking-wide transition-colors duration-200 flex items-center gap-2 shrink-0"
            >
              View All Properties
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={staggerContainer(0.15, 0.2)}
          initial="hidden"
          animate={isInView ? 'show' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {DEMO_PROPERTIES.map((property, i) => (
            <PropertyCard key={property._id} property={property} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
