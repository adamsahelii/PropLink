import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useInView, animate } from 'framer-motion'
import { staggerContainer, fadeUp, fadeIn } from '../utils/motion'

const STATS = [
  { target: 500,  suffix: '+',  label: 'Properties' },
  { target: 200,  suffix: '+',  label: 'Verified Owners' },
  { target: 1200, suffix: '+',  label: 'Happy Clients' },
]

function Counter({ target, suffix }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    const ctrl = animate(0, target, {
      duration: 2.4,
      ease: 'easeOut',
      onUpdate(v) {
        if (ref.current) ref.current.textContent = Math.round(v).toLocaleString() + suffix
      },
    })
    return ctrl.stop
  }, [isInView, target, suffix])

  return <span ref={ref}>0{suffix}</span>
}

export default function Hero() {
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '22%'])

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* Parallax image layer */}
      <motion.div className="absolute inset-0 scale-110" style={{ y: imageY }}>
        <img
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80"
          alt="Luxury property"
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Cinematic overlay — layered so the image remains visible */}
      {/* Base: very light tint — image breathes through */}
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.28)' }} />
      {/* Top vignette — dark for navbar legibility */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.58) 0%, transparent 32%)' }} />
      {/* Bottom vignette — light enough to not fog the SearchBar */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,6,2,0.52) 0%, rgba(10,6,2,0.12) 24%, transparent 50%)' }} />
      {/* Subtle warm tint on sides to frame text */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 0%, rgba(4,3,2,0.22) 100%)' }} />

      {/* Subtle gold grid texture */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#C9A24D 1px, transparent 1px), linear-gradient(90deg, #C9A24D 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* Decorative rings */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 0.12, scale: 1 }}
        transition={{ duration: 2.5, ease: 'easeOut' }}
        className="absolute top-1/4 -left-28 w-80 h-80 rounded-full border border-gold/70"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 0.08, scale: 1 }}
        transition={{ duration: 3, ease: 'easeOut', delay: 0.4 }}
        className="absolute bottom-1/4 -right-36 w-96 h-96 rounded-full border border-gold/70"
      />

      {/* Content */}
      <motion.div
        variants={staggerContainer(0.15, 0.25)}
        initial="hidden"
        animate="show"
        className="relative z-10 text-center px-6 max-w-5xl mx-auto pt-28 pb-36 sm:pb-44"
      >
        {/* Eyebrow */}
        <motion.div variants={fadeIn} className="flex items-center justify-center gap-3 mb-8">
          <div className="h-px w-10 bg-gold/60" />
          <p className="section-label text-gold/90">Lebanon's Premier Real Estate Platform</p>
          <div className="h-px w-10 bg-gold/60" />
        </motion.div>

        {/* Headline — text-shadow for guaranteed readability */}
        <motion.h1
          variants={fadeUp}
          className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white font-bold leading-[1.08] mb-6"
          style={{ textShadow: '0 2px 24px rgba(0,0,0,0.6)' }}
        >
          Find Your Perfect
          <span className="block mt-2 text-gold" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.4)' }}>
            Property in Lebanon
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          className="text-white/80 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12"
          style={{ textShadow: '0 1px 12px rgba(0,0,0,0.5)' }}
        >
          Discover, buy, rent, and list premium apartments and land across
          Lebanon. Your dream property is just a search away.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fadeUp}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <Link to="/listings" className="btn-gold w-full sm:w-auto text-center rounded-full">
            Explore Listings
          </Link>
          <Link
            to="/register"
            className="w-full sm:w-auto text-center inline-block border border-white/60 hover:border-gold text-white hover:text-gold font-sans font-medium text-sm tracking-widest uppercase px-8 py-3.5 rounded-full transition-all duration-300"
          >
            List Your Property
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={staggerContainer(0.1, 0.4)}
          initial="hidden"
          animate="show"
          className="grid grid-cols-3 gap-4 max-w-[280px] sm:max-w-xs mx-auto"
        >
          {STATS.map(({ target, suffix, label }) => (
            <motion.div key={label} variants={fadeUp} className="text-center">
              <p
                className="font-serif text-2xl md:text-3xl font-bold text-gold"
                style={{ textShadow: '0 1px 10px rgba(0,0,0,0.4)' }}
              >
                <Counter target={target} suffix={suffix} />
              </p>
              <p className="text-white/55 text-[10px] tracking-[0.2em] uppercase mt-1">{label}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

    </section>
  )
}
