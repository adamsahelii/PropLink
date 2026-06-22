import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'

const EASE = [0.25, 0.46, 0.45, 0.94]

const FAQS = [
  {
    q: 'Why list with PropLink?',
    a: 'PropLink connects property owners directly with serious buyers and renters across Lebanon. Every listing is presented with clarity and elegance on a platform built for trust — no hidden fees, no middlemen, no compromises.',
  },
  {
    q: 'Who can create listings?',
    a: 'Any verified property owner or authorized representative can list on PropLink. Register as an owner, submit your property details, and our team will review your listing before it goes live.',
  },
  {
    q: 'How does property approval work?',
    a: 'Every listing is reviewed manually by our team to ensure accuracy, quality, and legitimacy. This process typically takes 24–48 hours and ensures that every property shown on PropLink meets our standards.',
  },
  {
    q: 'Can I manage multiple properties?',
    a: 'Yes. Your owner dashboard allows you to manage all your listings in one place — update details, review inquiries, and track visibility across all your properties simultaneously.',
  },
  {
    q: 'How do inquiries work?',
    a: "Interested buyers and renters contact you directly through PropLink's secure inquiry system. You receive their message and details, and respond at your convenience — no intermediaries involved.",
  },
]

// ── Accordion item ────────────────────────────────────────────────────────────

function AccordionItem({ item, isOpen, onToggle }) {
  return (
    <div className="border-b border-black/[0.07] last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left group"
        aria-expanded={isOpen}
      >
        <span
          className={`font-serif text-[17px] font-semibold leading-snug pr-4 transition-colors duration-200 ${
            isOpen ? 'text-forest' : 'text-charcoal/75 group-hover:text-forest'
          }`}
        >
          {item.q}
        </span>

        <span
          className={`shrink-0 w-7 h-7 rounded-full border flex items-center justify-center transition-all duration-300 ${
            isOpen
              ? 'border-gold bg-gold'
              : 'border-black/15 group-hover:border-forest/30'
          }`}
        >
          <svg
            className={`w-3 h-3 transition-transform duration-300 ${
              isOpen ? 'rotate-45' : ''
            }`}
            style={{ color: isOpen ? '#fff' : 'rgba(30,30,30,0.4)' }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            style={{ overflow: 'hidden' }}
          >
            <p
              style={{
                color: '#7A7265',
                fontSize: '14.5px',
                lineHeight: '1.85',
                paddingBottom: '1.25rem',
                maxWidth: '36rem',
              }}
            >
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main section ──────────────────────────────────────────────────────────────

export default function CTASection() {
  const ref      = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const [open, setOpen] = useState(0)

  const toggle = (i) => setOpen((prev) => (prev === i ? -1 : i))

  return (
    <section
      ref={ref}
      className="relative py-28 sm:py-36 lg:py-44 px-6 sm:px-10 lg:px-14 bg-ivory overflow-hidden"
    >
      {/* Single very subtle tonal separator at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-20 xl:gap-28">

          {/* ── LEFT: editorial copy ────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: EASE }}
            className="lg:w-[42%] xl:w-[40%] shrink-0"
          >
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-7">
              <div className="h-px w-6 bg-gold/50" />
              <p
                className="text-[10px] font-semibold tracking-[0.22em] uppercase"
                style={{ color: 'rgba(201,162,77,0.75)' }}
              >
                For Property Owners
              </p>
            </div>

            {/* Headline */}
            <h2
              className="font-serif font-bold text-forest leading-[1.1] mb-7"
              style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.9rem)' }}
            >
              List Your Property<br />
              <span className="text-gold">With Confidence</span>
            </h2>

            {/* Primary paragraph */}
            <p style={{ color: 'rgba(30,30,30,0.6)', fontSize: '15px', lineHeight: '1.85', marginBottom: '1.25rem', maxWidth: '30rem' }}>
              Reach buyers, renters, and investors across Lebanon through a premium
              real-estate marketplace designed to showcase properties with clarity,
              trust, and elegance.
            </p>

            {/* Secondary paragraph */}
            <p style={{ color: 'rgba(30,30,30,0.42)', fontSize: '13.5px', lineHeight: '1.8', marginBottom: '3rem', maxWidth: '26rem' }}>
              Whether you're listing a family home, investment property, apartment,
              villa, or land, PropLink connects you with serious buyers and renters
              across Lebanon.
            </p>

            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
              <Link to="/register" className="btn-gold rounded-full px-10">
                List Your Property
              </Link>
            </motion.div>
          </motion.div>

          {/* ── RIGHT: accordion ────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
            className="flex-1 flex flex-col justify-center"
          >
            <div>
              {FAQS.map((item, i) => (
                <AccordionItem
                  key={item.q}
                  item={item}
                  isOpen={open === i}
                  onToggle={() => toggle(i)}
                />
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
