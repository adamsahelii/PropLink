import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { IoLogoInstagram, IoLogoFacebook, IoLogoLinkedin, IoLogoTiktok, IoArrowForward } from 'react-icons/io5'
import LogoMark from './LogoMark'

const NAV_COLS = [
  {
    heading: 'Explore',
    links: [
      { label: 'All Listings',  to: '/listings' },
      { label: 'Apartments',    to: '/listings?propertyType=apartment' },
      { label: 'Land',          to: '/listings?propertyType=land' },
      { label: 'For Rent',      to: '/listings?purpose=rent' },
      { label: 'For Sale',      to: '/listings?purpose=sale' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About Us',      to: '/about' },
      { label: 'Contact',       to: '/contact' },
      { label: 'Privacy Policy',to: '/privacy' },
      { label: 'Terms & Conditions', to: '/terms' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'List Property', to: '/register' },
      { label: 'Owner Login',   to: '/login' },
      { label: 'My Listings',   to: '/my-listings' },
      { label: 'Saved',         to: '/favorites' },
    ],
  },
]

const SOCIALS = [
  { label: 'Instagram', Icon: IoLogoInstagram, href: '#' },
  { label: 'Facebook',  Icon: IoLogoFacebook,  href: '#' },
  { label: 'LinkedIn',  Icon: IoLogoLinkedin,  href: '#' },
  { label: 'TikTok',    Icon: IoLogoTiktok,    href: '#' },
]

export default function Footer() {
  return (
    <footer
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #07201A 0%, #0a2d22 40%, #141414 100%)',
      }}
    >
      {/* ── Top hero row ── */}
      <div className="relative z-10 border-b border-white/[0.06] py-14 px-6 sm:px-10 lg:px-14">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-12">

          {/* Logo + brand */}
          <div className="flex items-center gap-3 shrink-0">
            <LogoMark size={44} variant="gold" />
            <div>
              <div className="flex items-baseline gap-0.5">
                <span className="font-serif text-2xl font-bold text-white">PROP</span>
                <span className="font-serif text-2xl font-bold text-gold">LINK</span>
              </div>
              <p className="text-white/35 text-[10px] tracking-widest uppercase mt-0.5">
                Lebanon Real Estate
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px h-14 bg-white/8 shrink-0" />

          {/* Headline */}
          <div className="flex-1">
            <h2 className="font-serif text-2xl md:text-3xl text-white font-bold leading-snug">
              Refined Living,{' '}
              <span className="text-gold">Thoughtfully Connected.</span>
            </h2>
            <p className="text-white/40 text-sm mt-2 max-w-md">
              Lebanon's premier real estate marketplace — connecting buyers, renters, and owners.
            </p>
          </div>

          {/* CTA */}
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="shrink-0 w-full lg:w-auto">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 btn-gold rounded-full px-8 w-full lg:w-auto"
            >
              Contact Us
              <IoArrowForward className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ── Nav columns + socials ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
        {NAV_COLS.map(({ heading, links }) => (
          <div key={heading}>
            <h4 className="text-white/90 text-[10px] font-semibold tracking-[0.18em] uppercase mb-5">
              {heading}
            </h4>
            <ul className="space-y-3">
              {links.map(({ label, to }) => (
                <li key={label}>
                  <motion.div whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 400, damping: 22 }}>
                    <Link
                      to={to}
                      className="text-white/50 hover:text-gold text-sm transition-colors duration-200 inline-flex items-center gap-1.5 group"
                    >
                      <IoArrowForward className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-gold" />
                      {label}
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Social column */}
        <div>
          <h4 className="text-white/90 text-[10px] font-semibold tracking-[0.18em] uppercase mb-5">
            Follow Us
          </h4>
          <div className="flex flex-col gap-3">
            {SOCIALS.map(({ label, Icon, href }) => (
              <motion.a
                key={label}
                href={href}
                aria-label={label}
                className="flex items-center gap-3 text-white/50 hover:text-gold transition-colors duration-200 group"
                whileHover={{ x: 4 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="text-sm">{label}</span>
              </motion.a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="relative z-10 border-t border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/25 text-xs">
            © {new Date().getFullYear()} PropLink. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link to="/privacy" className="text-white/25 hover:text-white/50 text-xs transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-white/25 hover:text-white/50 text-xs transition-colors">
              Terms &amp; Conditions
            </Link>
            <span className="text-white/15 text-xs">Built in Lebanon 🇱🇧</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
