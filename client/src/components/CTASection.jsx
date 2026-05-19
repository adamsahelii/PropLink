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
    <section ref={ref} className="py-20 px-4 bg-ivory">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="max-w-5xl mx-auto"
      >
        {/* Contained card — dark green, rounded, not full-bleed */}
        <div
          className="relative rounded-3xl overflow-hidden px-10 py-16 md:px-16 md:py-20"
          style={{ background: 'linear-gradient(135deg, #08281F 0%, #0F3D2E 60%, #1a5c44 100%)' }}
        >
          {/* Decorative rings inside the card */}
          <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full border border-gold/10" />
          <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full border border-gold/8" />

          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.025] pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(#C9A24D 1px, transparent 1px), linear-gradient(90deg, #C9A24D 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-start gap-10">
            {/* Text column */}
            <motion.div
              variants={staggerContainer(0.12, 0.1)}
              initial="hidden"
              animate={isInView ? 'show' : 'hidden'}
              className="flex-1 text-center lg:text-left"
            >
              <motion.div variants={fadeIn} className="flex items-center justify-center lg:justify-start gap-2 mb-5">
                <div className="h-px w-6 bg-gold/60" />
                <p className="section-label text-gold/80">For Property Owners</p>
              </motion.div>

              <motion.h2
                variants={fadeUp}
                className="font-serif text-3xl md:text-4xl text-white font-bold leading-tight mb-5"
                style={{ textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}
              >
                Start Listing Your{' '}
                <span className="text-gold">Properties Today</span>
              </motion.h2>

              <motion.p
                variants={fadeUp}
                className="text-white/65 text-sm md:text-base max-w-md leading-relaxed"
              >
                Join hundreds of verified property owners on PropLink. Reach
                thousands of qualified buyers and renters across Lebanon — for free.
              </motion.p>
            </motion.div>

            {/* Right column: benefits + CTA */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.25 }}
              className="flex flex-col items-center lg:items-end gap-6 shrink-0"
            >
              <div className="flex flex-col gap-3">
                {BENEFITS.map(({ text }) => (
                  <div key={text} className="flex items-center gap-3 text-white/75 text-sm">
                    <div className="w-5 h-5 rounded-full border border-gold/40 flex items-center justify-center shrink-0">
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
      </motion.div>
    </section>
  )
}
