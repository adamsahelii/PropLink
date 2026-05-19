import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const TESTIMONIALS = [
  {
    id: 1,
    quote: 'PropLink helped me find a verified apartment in Achrafieh without wasting weeks searching. Everything was clear, fast, and professional.',
    name: 'Rania K.',
    role: 'Tenant · Beirut',
    delay: 0,
    floatOffset: 0,
  },
  {
    id: 2,
    quote: 'Listing my property was simple and clean. I received serious inquiries within 48 hours, no middlemen, no hidden fees.',
    name: 'Georges M.',
    role: 'Property Owner · Jounieh',
    delay: 0.15,
    floatOffset: 30,
  },
  {
    id: 3,
    quote: 'I contacted the owner directly and booked a viewing the same day. PropLink is the only platform I trust for Lebanese real estate.',
    name: 'Sara H.',
    role: 'Buyer · Batroun',
    delay: 0.3,
    floatOffset: 0,
  },
]

export default function Testimonials() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      ref={ref}
      className="relative py-28 px-4 overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #141414 0%, #1C1C1C 50%, #111111 100%)' }}
    >
      {/* Large faded background text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <span
          className="font-serif font-bold text-white uppercase tracking-widest select-none text-center leading-none"
          style={{ fontSize: 'clamp(48px, 9vw, 130px)', opacity: 0.028, whiteSpace: 'nowrap' }}
        >
          WHAT OUR CLIENTS SAY
        </span>
      </div>

      {/* Subtle gold radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(201,162,77,0.06) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-16"
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

        {/* Cards — staggered heights on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ id, quote, name, role, delay, floatOffset }) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: floatOffset } : {}}
              transition={{ duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94], delay }}
            >
              <FloatingCard quote={quote} name={name} role={role} floatDelay={delay} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FloatingCard({ quote, name, role, floatDelay }) {
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 5.5 + floatDelay * 2, repeat: Infinity, ease: 'easeInOut', delay: floatDelay * 1.5 }}
      className="h-full rounded-3xl p-7 border border-white/8 relative overflow-hidden transition-shadow duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      {/* Gold quote mark */}
      <div className="text-gold text-5xl font-serif leading-none mb-4 select-none" style={{ opacity: 0.7 }}>
        &ldquo;
      </div>

      {/* Quote */}
      <p className="text-white/75 text-sm leading-relaxed mb-6">
        {quote}
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 border-t border-white/8 pt-5">
        <div
          className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center text-gold font-serif text-sm font-bold shrink-0"
        >
          {name[0]}
        </div>
        <div>
          <p className="text-white text-sm font-semibold">{name}</p>
          <p className="text-white/40 text-xs">{role}</p>
        </div>
      </div>

      {/* Subtle corner glow */}
      <div
        className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201,162,77,0.12) 0%, transparent 70%)' }}
      />
    </motion.div>
  )
}
