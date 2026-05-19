import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { staggerContainer, fadeUp } from '../utils/motion'
import { IoShieldCheckmarkOutline, IoPeopleOutline, IoSearchOutline, IoLockClosedOutline } from 'react-icons/io5'

const FEATURES = [
  {
    Icon: IoShieldCheckmarkOutline,
    title: 'Verified Properties',
    description:
      'Every listing goes through a manual review by our team before appearing on the platform. No scams, no surprises.',
  },
  {
    Icon: IoPeopleOutline,
    title: 'Direct Owner Contact',
    description:
      'Reach property owners and agents directly without intermediaries. Faster decisions, better deals.',
  },
  {
    Icon: IoSearchOutline,
    title: 'Smart Search',
    description:
      'Filter by city, property type, price range, and purpose. Find exactly what you need in seconds.',
  },
  {
    Icon: IoLockClosedOutline,
    title: 'Secure Platform',
    description:
      'Your data and inquiries are protected with industry-standard encryption and secure authentication.',
  },
]

export default function WhyPropLink() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="py-28 px-4" style={{ background: '#f2ede0' }}>
      <div ref={ref} className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-18"
        >
          <p className="section-label mb-3">Our Advantage</p>
          <h2 className="section-title mx-auto max-w-md">Why Choose PropLink?</h2>
          <div className="mt-4 w-12 h-0.5 bg-gold mx-auto" />
          <p className="mt-6 text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
            We built PropLink to make real estate in Lebanon transparent, fast,
            and trustworthy — for buyers, renters, and owners alike.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={staggerContainer(0.13, 0.15)}
          initial="hidden"
          animate={isInView ? 'show' : 'hidden'}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-14"
        >
          {FEATURES.map(({ Icon, title, description }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="bg-white p-8 rounded-3xl border border-transparent
                         hover:border-gold/25 hover:shadow-xl hover:shadow-forest/5
                         transition-shadow duration-300 group"
            >
              {/* Icon circle */}
              <motion.div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5
                           transition-colors duration-300 group-hover:bg-forest"
                style={{ backgroundColor: 'rgba(15,61,46,0.08)' }}
                whileHover={{ rotate: [0, -6, 6, 0] }}
                transition={{ duration: 0.5 }}
              >
                <Icon className="w-6 h-6 text-forest group-hover:text-white transition-colors duration-300" />
              </motion.div>

              <h3 className="font-serif text-lg font-semibold text-charcoal mb-3">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
