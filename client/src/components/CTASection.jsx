import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { staggerContainer, fadeUp, fadeIn } from '../utils/motion'

const BENEFITS = [
  { text: 'Free to list' },
  { text: 'Reach 10,000+ buyers' },
  { text: 'No commission' },
]

export default function CTASection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="relative py-24 sm:py-32 px-6 sm:px-10 bg-ivory overflow-hidden">

      {/* Decorative rings */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full border border-forest/8 pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full border border-gold/10 pointer-events-none" />
      <div className="absolute top-1/2 -translate-y-1/2 right-[12%] w-52 h-52 rounded-full border border-forest/5 pointer-events-none" />

      {/* Subtle gold grid — matches hero/CTA card language */}
      <div
        className="absolute inset-0 opacity-[0.018] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#C9A24D 1px, transparent 1px), linear-gradient(90deg, #C9A24D 1px, transparent 1px)',
          backgroundSize: '52px 52px',
        }}
      />

      {/* Ghost headline — editorial depth */}
      <div
        className="absolute right-[-1%] top-1/2 -translate-y-1/2 font-serif font-bold uppercase select-none pointer-events-none"
        style={{
          fontSize: 'clamp(100px, 17vw, 260px)',
          lineHeight: 1,
          color: '#0F3D2E',
          opacity: 0.038,
          letterSpacing: '-0.02em',
        }}
        aria-hidden="true"
      >
        OWN
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center lg:items-center gap-12 lg:gap-20">

          {/* Left: text */}
          <motion.div
            variants={staggerContainer(0.12, 0.1)}
            initial="hidden"
            animate={isInView ? 'show' : 'hidden'}
            className="flex-1 text-center lg:text-left"
          >
            <motion.div
              variants={fadeIn}
              className="flex items-center justify-center lg:justify-start gap-2 mb-5"
            >
              <div className="h-px w-6 bg-gold/60" />
              <p className="section-label">For Property Owners</p>
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="font-serif text-4xl md:text-5xl text-forest font-bold leading-tight mb-6"
            >
              Start Listing Your{' '}
              <span className="text-gold">Properties Today</span>
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="text-charcoal/62 text-base max-w-md leading-relaxed"
            >
              Join hundreds of verified property owners on PropLink. Reach
              thousands of qualified buyers and renters across Lebanon — for free.
            </motion.p>
          </motion.div>

          {/* Right: benefits + CTA */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.28 }}
            className="flex flex-col items-center lg:items-end gap-8 shrink-0"
          >
            <div className="flex flex-col gap-4">
              {BENEFITS.map(({ text }) => (
                <div key={text} className="flex items-center gap-3 text-forest/80 text-sm font-medium">
                  <div className="w-5 h-5 rounded-full border border-gold/50 flex items-center justify-center shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                  </div>
                  {text}
                </div>
              ))}
            </div>

            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link to="/register" className="btn-gold rounded-full px-10">
                Become an Owner
              </Link>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
