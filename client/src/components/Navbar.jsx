import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import LogoMark from './LogoMark'

const NAV_LINKS = [
  { label: 'Home',           to: '/' },
  { label: 'Listings',       to: '/listings' },
  { label: 'Find My Place',  to: '/find-my-place' },
  { label: 'About',          to: '/about' },
  { label: 'Contact',        to: '/contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location])

  const onDark = !scrolled

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`max-w-7xl mx-auto rounded-2xl px-5 lg:px-7 flex items-center justify-between h-16 transition-all duration-500 ${
          scrolled
            ? 'bg-white/96 backdrop-blur-xl shadow-xl border border-black/5'
            : 'bg-black/20 backdrop-blur-md border border-white/10'
        }`}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <LogoMark size={38} variant="gold" className="transition-transform duration-300 group-hover:scale-105" />
          <div className="flex items-baseline gap-0.5">
            <span className={`font-serif text-xl font-bold tracking-wide transition-colors duration-300 ${scrolled ? 'text-forest' : 'text-white'}`}>
              PROP
            </span>
            <span className="font-serif text-xl font-bold text-gold tracking-wide">LINK</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className={`relative text-sm font-medium tracking-wide transition-colors duration-200 group ${
                location.pathname === to
                  ? 'text-gold'
                  : scrolled ? 'text-charcoal/70 hover:text-forest' : 'text-white/85 hover:text-white'
              }`}
            >
              {label}
              <span className={`absolute -bottom-0.5 left-0 h-px bg-gold transition-all duration-300 ${
                location.pathname === to ? 'w-full' : 'w-0 group-hover:w-full'
              }`} />
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/login"
            className={`text-sm font-medium transition-colors duration-200 ${
              scrolled ? 'text-charcoal/65 hover:text-forest' : 'text-white/80 hover:text-white'
            }`}
          >
            Login
          </Link>
          <Link to="/register" className="btn-gold text-xs py-2.5 px-6 rounded-full !tracking-widest">
            Get Started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-[5px] p-2"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <motion.span animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }} className={`block w-5 h-0.5 rounded-full ${scrolled ? 'bg-charcoal' : 'bg-white'}`} />
          <motion.span animate={menuOpen ? { opacity: 0 } : { opacity: 1 }} className={`block w-5 h-0.5 rounded-full ${scrolled ? 'bg-charcoal' : 'bg-white'}`} />
          <motion.span animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }} className={`block w-5 h-0.5 rounded-full ${scrolled ? 'bg-charcoal' : 'bg-white'}`} />
        </button>
      </motion.div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="md:hidden mx-4 mt-2 rounded-2xl bg-white/97 backdrop-blur-xl shadow-2xl border border-black/5 overflow-hidden"
          >
            <div className="px-6 py-5 flex flex-col gap-4">
              {NAV_LINKS.map(({ label, to }) => (
                <Link
                  key={to}
                  to={to}
                  className={`text-sm font-medium tracking-wide transition-colors ${location.pathname === to ? 'text-gold' : 'text-charcoal/70 hover:text-forest'}`}
                >
                  {label}
                </Link>
              ))}
              <div className="border-t border-black/5 pt-4 flex flex-col gap-3">
                <Link to="/login" className="text-charcoal/65 text-sm font-medium hover:text-forest">Login</Link>
                <Link to="/register" className="btn-gold text-center text-xs py-3 rounded-full">Get Started</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
