import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { staggerContainer, fadeUp } from '../utils/motion'
import {
  IoShieldCheckmarkOutline,
  IoPeopleOutline,
  IoSearchOutline,
  IoLockClosedOutline,
} from 'react-icons/io5'

const EASE = [0.25, 0.46, 0.45, 0.94]

const FEATURES = [
  {
    Icon: IoShieldCheckmarkOutline,
    title: 'Verified Properties',
    description:
      'Every listing is reviewed by our team before going live. No scams, no misleading photos, no surprises.',
  },
  {
    Icon: IoPeopleOutline,
    title: 'Direct Owner Contact',
    description:
      'Connect with property owners directly — no agencies, no intermediaries. Faster conversations, better outcomes.',
  },
  {
    Icon: IoSearchOutline,
    title: 'Precision Search',
    description:
      'Filter by city, type, price, and purpose. Find exactly what you need across Lebanon in seconds.',
  },
  {
    Icon: IoLockClosedOutline,
    title: 'Secure Platform',
    description:
      'Your data and every inquiry are protected with industry-standard encryption and secure authentication.',
  },
]

export default function WhyPropLink() {
  const ref      = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="pt-8 pb-20 lg:pt-10 lg:pb-24 bg-ivory px-6 sm:px-10 lg:px-14">
      <div ref={ref} className="max-w-7xl mx-auto">

        {/* ── Section header ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: EASE }}
          className="text-center mb-12"
        >
          {/* Eyebrow — matches Testimonials and Carousel pattern */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 bg-gold/45" />
            <p className="section-label text-gold/80">Our Advantage</p>
            <div className="h-px w-8 bg-gold/45" />
          </div>

          <h2 className="font-serif text-3xl md:text-4xl text-forest font-bold leading-tight mb-4">
            Why Choose PropLink?
          </h2>

          <p className="text-charcoal/52 max-w-lg mx-auto text-sm leading-relaxed">
            We built PropLink to make Lebanese real estate transparent, direct,
            and trustworthy — for every buyer, renter, and owner.
          </p>
        </motion.div>

        {/* ── Feature cards ─────────────────────────────────────────────────── */}
        <motion.div
          variants={staggerContainer(0.10, 0.12)}
          initial="hidden"
          animate={isInView ? 'show' : 'hidden'}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {FEATURES.map(({ Icon, title, description }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              className="bg-white rounded-2xl border border-black/[0.05] p-7 flex flex-col group
                         hover:border-gold/22 hover:shadow-lg hover:shadow-forest/[0.06]
                         transition-all duration-300"
            >
              {/* Gold expanding rule — replaces SaaS icon box */}
              <div className="w-8 h-px bg-gold/55 mb-6 group-hover:w-14 transition-all duration-300 ease-out" />

              {/* Icon — clean, no container box */}
              <Icon className="w-5 h-5 text-forest/60 group-hover:text-forest mb-5 transition-colors duration-300 shrink-0" />

              <h3 className="font-serif text-[15px] font-bold text-forest mb-3 leading-snug">
                {title}
              </h3>

              <p className="text-charcoal/52 text-[13.5px] leading-[1.75]">
                {description}
              </p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}
