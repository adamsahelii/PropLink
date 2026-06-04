import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { IoLogOutOutline, IoChevronDownOutline, IoPersonOutline } from 'react-icons/io5'
import LogoMark from './LogoMark'
import { useAuth } from '../context/AuthContext'

const NAV_LINKS = [
  { label: 'Home',          to: '/' },
  { label: 'Listings',      to: '/listings' },
  { label: 'Find My Place', to: '/find-my-place' },
  { label: 'About',         to: '/about' },
  { label: 'Contact',       to: '/contact' },
]

const ROLE_BADGE = {
  owner: { label: 'Owner', cls: 'bg-gold/15 text-gold-dark' },
  admin: { label: 'Admin', cls: 'bg-forest/15 text-forest' },
  user:  null,
}

function UserInitial({ name, size = 30 }) {
  const initial = name?.trim()?.[0]?.toUpperCase() ?? '?'
  return (
    <div
      className="flex items-center justify-center rounded-full bg-gold font-serif font-bold text-white shrink-0 select-none"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {initial}
    </div>
  )
}

export default function Navbar() {
  const { user, loading, logout } = useAuth()
  const navigate   = useNavigate()
  const location   = useLocation()

  const [scrolled,     setScrolled]     = useState(false)
  const [menuOpen,     setMenuOpen]     = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on navigation
  useEffect(() => { setMenuOpen(false); setUserMenuOpen(false) }, [location])

  // Close user dropdown on outside click
  useEffect(() => {
    if (!userMenuOpen) return
    function onClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [userMenuOpen])

  function handleLogout() {
    logout()
    setUserMenuOpen(false)
    setMenuOpen(false)
    navigate('/')
  }

  const onDark = !scrolled
  const badge  = user ? ROLE_BADGE[user.role] : null
  const firstName = user?.name?.split(' ')[0] ?? ''

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
        {/* ── Logo ─────────────────────────────────────────────────── */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <LogoMark size={38} variant="gold" className="transition-transform duration-300 group-hover:scale-105" />
          <div className="flex items-baseline gap-0.5">
            <span className={`font-serif text-xl font-bold tracking-wide transition-colors duration-300 ${scrolled ? 'text-forest' : 'text-white'}`}>
              PROP
            </span>
            <span className="font-serif text-xl font-bold text-gold tracking-wide">LINK</span>
          </div>
        </Link>

        {/* ── Desktop nav links ─────────────────────────────────────── */}
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

        {/* ── Desktop CTA ───────────────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-3">
          {loading ? (
            // Subtle skeleton while hydrating token
            <div className={`h-8 w-28 rounded-full animate-pulse ${scrolled ? 'bg-black/6' : 'bg-white/10'}`} />
          ) : user ? (
            // ── Logged in ────────────────────────────────────────────
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserMenuOpen(o => !o)}
                className="flex items-center gap-2.5 rounded-full pl-1.5 pr-3 py-1 transition-all duration-200 hover:bg-black/8"
              >
                <UserInitial name={user.name} size={30} />
                <span className={`text-sm font-medium transition-colors duration-200 ${scrolled ? 'text-charcoal/80' : 'text-white/85'}`}>
                  {firstName}
                </span>
                {badge && (
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full tracking-wide ${
                    scrolled ? badge.cls : 'bg-white/15 text-white/70'
                  }`}>
                    {badge.label}
                  </span>
                )}
                <IoChevronDownOutline className={`w-3.5 h-3.5 transition-all duration-200 ${scrolled ? 'text-charcoal/40' : 'text-white/40'} ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown */}
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl shadow-charcoal/12 border border-black/[0.06] overflow-hidden"
                  >
                    {/* User info header */}
                    <div className="px-4 py-3.5 border-b border-black/5">
                      <p className="text-sm font-semibold text-charcoal truncate">{user.name}</p>
                      <p className="text-xs text-charcoal/40 truncate">{user.email}</p>
                      {badge && (
                        <span className={`inline-block mt-1.5 text-[9px] font-semibold px-2 py-0.5 rounded-full ${badge.cls}`}>
                          {badge.label}
                        </span>
                      )}
                    </div>

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-charcoal/65 hover:text-red-500 hover:bg-red-50/60 transition-colors duration-150"
                    >
                      <IoLogOutOutline className="w-4 h-4" />
                      Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            // ── Logged out ───────────────────────────────────────────
            <>
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
            </>
          )}
        </div>

        {/* ── Mobile hamburger ──────────────────────────────────────── */}
        <button
          className="md:hidden flex flex-col gap-[5px] p-2"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <motion.span animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }} className={`block w-5 h-0.5 rounded-full ${scrolled ? 'bg-charcoal' : 'bg-white'}`} />
          <motion.span animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}             className={`block w-5 h-0.5 rounded-full ${scrolled ? 'bg-charcoal' : 'bg-white'}`} />
          <motion.span animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }} className={`block w-5 h-0.5 rounded-full ${scrolled ? 'bg-charcoal' : 'bg-white'}`} />
        </button>
      </motion.div>

      {/* ── Mobile drawer ─────────────────────────────────────────── */}
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
              {/* Nav links */}
              {NAV_LINKS.map(({ label, to }) => (
                <Link
                  key={to}
                  to={to}
                  className={`text-sm font-medium tracking-wide transition-colors ${location.pathname === to ? 'text-gold' : 'text-charcoal/70 hover:text-forest'}`}
                >
                  {label}
                </Link>
              ))}

              {/* Auth section */}
              <div className="border-t border-black/5 pt-4">
                {loading ? (
                  <div className="h-10 rounded-xl bg-black/5 animate-pulse" />
                ) : user ? (
                  // Logged in — show user info + logout
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 px-1">
                      <UserInitial name={user.name} size={36} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-charcoal truncate">{user.name}</p>
                        <p className="text-xs text-charcoal/40 truncate">{user.email}</p>
                      </div>
                      {badge && (
                        <span className={`shrink-0 text-[9px] font-semibold px-2 py-0.5 rounded-full ${badge.cls}`}>
                          {badge.label}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 text-sm font-medium text-charcoal/55 hover:text-red-500 transition-colors duration-150 px-1"
                    >
                      <IoLogOutOutline className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                ) : (
                  // Logged out — show Login + Get Started
                  <div className="flex flex-col gap-3">
                    <Link to="/login"    className="text-charcoal/65 text-sm font-medium hover:text-forest">Login</Link>
                    <Link to="/register" className="btn-gold text-center text-xs py-3 rounded-full">Get Started</Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
