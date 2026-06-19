import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

// ── Constants ─────────────────────────────────────────────────────────────────

const EASE = [0.25, 0.46, 0.45, 0.94]
const VIEW = { once: true, margin: '-70px' }

// ── Story section image ───────────────────────────────────────────────────────

const STORY_IMAGE =
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=85'

// ── Discover Lebanon ──────────────────────────────────────────────────────────

const CITIES = [
  {
    name:  'Beirut',
    label: 'The Capital',
    desc:  'From restored Ottoman facades in Gemmayzeh to glass towers along the Corniche — Beirut offers the most layered, dynamic real estate in the Mediterranean.',
    img:   'https://images.unsplash.com/photo-1641304009599-e994aba69b5a?auto=format&fit=crop&w=900&q=80',
    to:    '/listings?city=Beirut',
  },
  {
    name:  'Batroun',
    label: 'The Coastal Escape',
    desc:  'Ancient Phoenician walls, crystal coves, and a growing wine trail. Lebanon\'s most coveted coastal destination for buyers who refuse to compromise on beauty.',
    img:   'https://images.unsplash.com/photo-1706970683779-37c7cf7d5778?auto=format&fit=crop&w=900&q=80',
    to:    '/listings?city=Batroun',
  },
  {
    name:  'Jbeil',
    label: 'The Ancient Port',
    desc:  'One of the world\'s oldest continuously inhabited cities. Stone-paved alleys, a working harbour, and a community that has always known how to live beautifully.',
    img:   'https://images.unsplash.com/photo-1571249246946-f0fc69085ef5?auto=format&fit=crop&w=900&q=80',
    to:    '/listings?city=Jbeil',
  },
  {
    name:  'Zahle',
    label: 'The Bride of the Bekaa',
    desc:  'Surrounded by vineyards and the Anti-Lebanon peaks, Zahle is the country\'s most underrated destination for long-term living and serious investment.',
    img:   'https://images.unsplash.com/photo-1589207562662-fd1a236afde3?auto=format&fit=crop&w=900&q=80',
    to:    '/listings?city=Zahle',
  },
]

// ── Why we built PropLink ─────────────────────────────────────────────────────

const PILLARS = [
  {
    title: 'Real owners. Direct connections.',
    body:  'We connect buyers and renters directly to property owners. No agencies inflating the price. No middlemen obscuring the facts. Just honest, direct conversations between the people who matter.',
  },
  {
    title: 'Lebanon, first and always.',
    body:  'PropLink was built by people who care deeply about this country. Every feature, every decision is guided by one question: does this serve the Lebanese real estate market better than what existed before?',
  },
  {
    title: 'Transparency above all else.',
    body:  'Every listing must tell the complete truth. Accurate pricing. Real photographs. Honest descriptions. That is the only way to build trust — and trust is the only foundation worth building on.',
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function SectionLabel({ children, light = false }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="h-px w-6" style={{ background: light ? '#C9A24D' : 'rgba(201,162,77,0.45)' }} />
      <p
        className="text-[10px] font-semibold tracking-[0.24em] uppercase"
        style={{ color: light ? '#C9A24D' : 'rgba(201,162,77,0.70)' }}
      >
        {children}
      </p>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        className="relative flex items-center justify-center overflow-hidden"
        style={{ minHeight: '100svh' }}
      >
        {/* Dark editorial background */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(160deg, #040f0c 0%, #061812 45%, #0a2318 100%)' }}
        />

        {/* Gold grid texture */}
        <div
          className="absolute inset-0 opacity-[0.018] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(#C9A24D 1px, transparent 1px), linear-gradient(90deg, #C9A24D 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        {/* Decorative rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-white/[0.03] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[440px] h-[440px] rounded-full border border-gold/[0.06] pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 px-6 text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="flex items-center justify-center gap-3 mb-8"
          >
            <div className="h-px w-8 bg-gold/40" />
            <p className="text-[10px] font-semibold tracking-[0.28em] text-gold/65 uppercase">
              About PropLink
            </p>
            <div className="h-px w-8 bg-gold/40" />
          </motion.div>

          <motion.h1
            className="font-serif font-bold text-white leading-[1.06] mb-8"
            style={{ fontSize: 'clamp(2.6rem, 7vw, 5.8rem)' }}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, ease: EASE }}
          >
            We Believe Everyone<br />
            Deserves to Find<br />
            <span className="text-gold">Their Place in Lebanon</span>
          </motion.h1>

          <motion.p
            className="text-white/60 text-base sm:text-lg max-w-lg mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7, ease: EASE }}
          >
            A platform built on transparency, built for a country worth investing in.
          </motion.p>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.6 }}
        >
          <motion.div
            className="w-px h-10 bg-white/35 origin-top"
            animate={{ scaleY: [1, 0.2, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <p className="text-white/38 text-[9px] tracking-[0.26em] uppercase">Scroll</p>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 2 — OUR STORY
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-ivory">
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-2">

          {/* Image — fills left column edge-to-edge */}
          <motion.div
            className="relative overflow-hidden"
            style={{ minHeight: 'clamp(300px, 50vw, 640px)' }}
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={VIEW}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <img
              src={STORY_IMAGE}
              alt="A luxury property in Lebanon"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Subtle right edge gradient to merge with text column */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-ivory/30 pointer-events-none hidden lg:block" />
          </motion.div>

          {/* Text */}
          <motion.div
            className="flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-20 py-20 lg:py-24"
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={VIEW}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
          >
            <SectionLabel>Our Story</SectionLabel>

            <h2
              className="font-serif font-bold text-forest leading-tight mb-8"
              style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.9rem)' }}
            >
              A Simpler Way<br />to Find Home
            </h2>

            <div className="space-y-5 text-charcoal/60 text-[15px] leading-[1.85]">
              <p>
                PropLink started with one question: why is finding a home in Lebanon so hard?
              </p>
              <p>
                Too many listings were outdated. Too many photos were misleading. Too many platforms
                put the agency ahead of the person looking. We saw owners who couldn't reach the
                right buyers, and buyers who couldn't trust what they saw.
              </p>
              <p>
                So we built something different — a platform designed around the people using it,
                not around impressions, clicks, or commissions. A platform that takes Lebanon
                seriously, because we do.
              </p>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 3 — OUR MISSION
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-28 md:py-40 px-6">
        <div className="max-w-4xl mx-auto text-center">

          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={VIEW}
            transition={{ duration: 0.6, ease: EASE }}
            className="w-12 h-px bg-gold mx-auto mb-10 origin-center"
          />

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEW}
            transition={{ duration: 0.75, ease: EASE }}
          >
            <p className="text-[10px] font-semibold tracking-[0.28em] text-gold/65 uppercase mb-8">
              Our Mission
            </p>

            <blockquote
              className="font-serif font-bold text-forest leading-[1.15] italic"
              style={{ fontSize: 'clamp(1.7rem, 3.8vw, 3rem)' }}
            >
              "To make Lebanese real estate transparent, accessible,
              and beautiful — for everyone looking to plant roots
              in this extraordinary country."
            </blockquote>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={VIEW}
            transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
            className="w-12 h-px bg-gold mx-auto mt-10 origin-center"
          />

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 4 — DISCOVER LEBANON
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-ivory py-24 md:py-32 px-4 sm:px-6">
        <div className="max-w-screen-xl mx-auto">

          {/* Header */}
          <motion.div
            className="max-w-xl mb-12 px-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEW}
            transition={{ duration: 0.65, ease: EASE }}
          >
            <SectionLabel>Discover Lebanon</SectionLabel>
            <h2
              className="font-serif font-bold text-forest leading-tight"
              style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)' }}
            >
              Four Cities.<br />Infinite Possibilities.
            </h2>
            <p className="text-charcoal/48 text-sm mt-4 leading-relaxed">
              Lebanon's real estate story is written across its coastline, its mountains,
              and its valleys. Here are four places worth knowing.
            </p>
          </motion.div>

          {/* 2 × 2 city grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
            {CITIES.map((city, i) => (
              <motion.div
                key={city.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEW}
                transition={{ delay: i * 0.1, duration: 0.55, ease: EASE }}
              >
                <Link
                  to={city.to}
                  className="group relative block overflow-hidden rounded-[28px]"
                  style={{ aspectRatio: '4 / 3' }}
                >
                  {/* Photo */}
                  <motion.img
                    src={city.img}
                    alt={city.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  {/* Permanent gradient for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-7 sm:p-8">
                    {/* Label chip */}
                    <span className="inline-flex self-start text-[10px] font-semibold tracking-[0.2em] uppercase text-gold/80 border border-gold/30 px-3 py-1 rounded-full mb-3 backdrop-blur-sm bg-black/10">
                      {city.label}
                    </span>

                    <h3 className="font-serif text-2xl sm:text-3xl text-white font-bold leading-none mb-2">
                      {city.name}
                    </h3>

                    {/* Description — visible on hover on desktop, always on mobile */}
                    <p className="text-white/60 text-[13px] leading-relaxed max-w-xs
                      lg:max-h-0 lg:overflow-hidden lg:opacity-0
                      lg:group-hover:max-h-32 lg:group-hover:opacity-100
                      transition-all duration-500 ease-out">
                      {city.desc}
                    </p>

                    {/* CTA arrow */}
                    <div className="flex items-center gap-1.5 mt-4 text-gold/70 group-hover:text-gold text-[11px] font-semibold tracking-wide uppercase transition-colors duration-200">
                      Explore
                      <svg className="w-3.5 h-3.5 -translate-x-0.5 group-hover:translate-x-0.5 transition-transform duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 5 — WHY WE BUILT PROPLINK
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        className="relative py-28 md:py-40 px-6 overflow-hidden"
        style={{ background: 'linear-gradient(155deg, #061812 0%, #0a2318 50%, #0F3D2E 100%)' }}
      >
        {/* Decorative diagonal rule */}
        <div
          className="absolute inset-0 opacity-[0.016] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(#C9A24D 1px, transparent 1px), linear-gradient(90deg, #C9A24D 1px, transparent 1px)',
            backgroundSize: '72px 72px',
          }}
        />

        <div className="relative z-10 max-w-screen-xl mx-auto">

          {/* Section heading */}
          <motion.div
            className="max-w-2xl mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEW}
            transition={{ duration: 0.65, ease: EASE }}
          >
            <SectionLabel light>Why We Built PropLink</SectionLabel>
            <h2
              className="font-serif font-bold text-white leading-tight"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}
            >
              Because Lebanon<br />
              <span className="text-gold">Deserves Better</span>
            </h2>
          </motion.div>

          {/* Three editorial pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 lg:gap-16">
            {PILLARS.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEW}
                transition={{ delay: i * 0.12, duration: 0.6, ease: EASE }}
              >
                {/* Gold top rule */}
                <div className="w-10 h-px bg-gold/50 mb-7" />

                <h3 className="font-serif text-xl text-white font-bold leading-snug mb-5">
                  {pillar.title}
                </h3>

                <p style={{ color: '#E8E3D8', fontSize: '14.5px', lineHeight: '1.85' }}>
                  {pillar.body}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 6 — PREMIUM CTA
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-ivory py-28 md:py-36 px-6">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEW}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-8 bg-gold/40" />
            <p className="text-[10px] font-semibold tracking-[0.26em] text-gold/65 uppercase">
              Begin Your Journey
            </p>
            <div className="h-px w-8 bg-gold/40" />
          </div>

          <h2
            className="font-serif font-bold text-forest leading-tight mb-6"
            style={{ fontSize: 'clamp(2rem, 4.5vw, 3.4rem)' }}
          >
            Find Your Place<br />in Lebanon
          </h2>

          <p className="text-charcoal/48 text-base md:text-lg leading-relaxed mb-12 max-w-xl mx-auto">
            Browse our curated collection of properties across Lebanon's most
            sought-after cities and districts.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
              <Link to="/listings" className="btn-gold rounded-full px-10 py-4 text-sm">
                Explore Listings
              </Link>
            </motion.div>

            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
              <Link to="/contact" className="btn-outline-forest rounded-full px-10 py-4 text-sm">
                Contact Us
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  )
}
