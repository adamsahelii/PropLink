import { useRef } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'

const TESTIMONIALS = [
  {
    id: 1,
    quote: 'PropLink helped me find a verified apartment in Achrafieh without wasting weeks searching. Everything was clear, fast, and professional.',
    name: 'Rania K.',
    role: 'Tenant · Beirut',
    delay: 0,
  },
  {
    id: 2,
    quote: 'Listing my property was seamless. I received serious inquiries within 48 hours — no middlemen, no hidden fees. Exactly what Lebanon needed.',
    name: 'Georges M.',
    role: 'Property Owner · Jounieh',
    delay: 0.12,
  },
  {
    id: 3,
    quote: 'I contacted the owner directly and booked a viewing the same day. PropLink is the only platform I trust for Lebanese real estate.',
    name: 'Sara H.',
    role: 'Buyer · Batroun',
    delay: 0.22,
  },
  {
    id: 4,
    quote: 'After months on other platforms I found my dream villa on PropLink in under a week. The quality of listings is simply unmatched anywhere.',
    name: 'Karim N.',
    role: 'Buyer · Metn',
    delay: 0.08,
  },
  {
    id: 5,
    quote: 'As a property manager with multiple units, PropLink gave me the visibility I needed. Occupancy improved dramatically within the first month.',
    name: 'Layla B.',
    role: 'Property Manager · Byblos',
    delay: 0.18,
  },
]

export default function Testimonials() {
  const sectionRef = useRef(null)
  const headerRef  = useRef(null)
  const isInView   = useInView(headerRef, { once: true, margin: '-80px' })

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const bgY = useTransform(scrollYProgress, [0, 1], ['-6%', '6%'])

  return (
    <section
      ref={sectionRef}
      className="relative py-24 md:py-32 px-6 sm:px-10 lg:px-14 overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #111111 0%, #181818 55%, #0d0d0d 100%)' }}
    >
      {/* Radial gold glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[450px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(201,162,77,0.055) 0%, transparent 68%)' }}
      />

      {/* Parallax background text — two stacked lines for composition depth */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none overflow-hidden"
        style={{ y: bgY, gap: '0.15em' }}
      >
        <span
          className="font-serif font-bold text-white uppercase tracking-[0.18em] select-none leading-none"
          style={{ fontSize: 'clamp(52px, 10.5vw, 152px)', opacity: 0.026, whiteSpace: 'nowrap' }}
        >
          WHAT OUR
        </span>
        <span
          className="font-serif font-bold text-white uppercase tracking-[0.18em] select-none leading-none"
          style={{ fontSize: 'clamp(52px, 10.5vw, 152px)', opacity: 0.016, whiteSpace: 'nowrap' }}
        >
          CLIENTS SAY
        </span>
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 36 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 bg-gold/50" />
            <p className="section-label text-gold/80">Testimonials</p>
            <div className="h-px w-8 bg-gold/50" />
          </div>
          <h2 className="font-serif text-3xl md:text-4xl text-white font-bold">
            Trusted by Hundreds Across Lebanon
          </h2>
        </motion.div>

        {/* Row 1 — 3 cards, staggered vertically */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mb-5 md:mb-6">
          <div>
            <TestimonialCard {...TESTIMONIALS[0]} />
          </div>
          <div className="md:-mt-12">
            <TestimonialCard {...TESTIMONIALS[1]} />
          </div>
          <div className="md:mt-16">
            <TestimonialCard {...TESTIMONIALS[2]} />
          </div>
        </div>

        {/* Row 2 — 2 cards, centered, slightly offset */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 md:max-w-[67%] md:mx-auto">
          <div className="md:mt-6">
            <TestimonialCard {...TESTIMONIALS[3]} />
          </div>
          <div className="md:-mt-4">
            <TestimonialCard {...TESTIMONIALS[4]} />
          </div>
        </div>
      </div>
    </section>
  )
}

function TestimonialCard({ quote, name, role, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 44 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.72, ease: [0.25, 0.46, 0.45, 0.94], delay }}
      whileHover={{
        y: -8,
        boxShadow: '0 24px 64px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.09)',
        transition: { type: 'spring', stiffness: 280, damping: 22, mass: 0.8 },
      }}
      className="rounded-3xl p-7 border border-white/[0.07] relative overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.042)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      {/* Gold quote mark */}
      <div className="text-gold/85 text-5xl font-serif leading-none mb-4 select-none">
        &ldquo;
      </div>

      <p className="text-white/85 text-sm leading-relaxed mb-6">{quote}</p>

      <div className="flex items-center gap-3 border-t border-white/[0.08] pt-5">
        <div className="w-9 h-9 rounded-full bg-gold/25 flex items-center justify-center text-gold font-serif text-sm font-bold shrink-0">
          {name[0]}
        </div>
        <div>
          <p className="text-white text-sm font-semibold">{name}</p>
          <p className="text-white/60 text-xs tracking-wide">{role}</p>
        </div>
      </div>

      {/* Subtle corner accent */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201,162,77,0.13) 0%, transparent 70%)' }}
      />
    </motion.div>
  )
}
