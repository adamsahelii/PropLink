import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

// ── Config ────────────────────────────────────────────────────────────────────
const EASE = [0.25, 0.46, 0.45, 0.94]
const LAST_UPDATED = 'September 2026'

// ── Content ───────────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    heading: '1. Introduction',
    body: [
      'PropLink ("we", "our", or "us") operates an online real estate marketplace connecting buyers, renters, and property owners across Lebanon. This Privacy Policy explains how we collect, use, and protect your information when you use our platform.',
      'By using PropLink, you agree to the practices described in this policy. If you do not agree, please do not use the platform.',
    ],
  },
  {
    heading: '2. Information We Collect',
    body: [
      'Account information: when you register, we collect your name, email address, phone number, and account role (buyer, renter, or owner).',
      'Listing information: if you list a property, we collect the details you provide — location, price, photographs, descriptions, and contact preferences.',
      'Usage data: we automatically collect information about how you interact with the platform, such as pages viewed, searches performed, and listings saved.',
    ],
  },
  {
    heading: '3. How We Use Your Information',
    body: [
      'We use your information to create and manage your account, publish and display property listings, connect buyers and renters directly with owners, respond to your inquiries, and improve the platform.',
      'We do not sell your personal information to third parties.',
    ],
  },
  {
    heading: '4. Listings & Public Content',
    body: [
      'Any property listing you publish, including photographs and descriptions, is publicly visible to other users. Contact details you choose to display on a listing may be seen by interested buyers and renters.',
      'Please avoid including sensitive personal information in listing descriptions that you do not wish to be public.',
    ],
  },
  {
    heading: '5. Sharing Your Information',
    body: [
      'We share your information only as needed to operate the platform: with other users when you initiate contact through a listing, and with service providers who help us run PropLink (such as hosting and database providers).',
      'We may disclose information if required by Lebanese law or to protect the rights and safety of our users.',
    ],
  },
  {
    heading: '6. Cookies & Tracking',
    body: [
      'PropLink uses cookies and similar technologies to keep you signed in, remember your preferences, and understand how the platform is used. You can control cookies through your browser settings, though some features may not work correctly if disabled.',
    ],
  },
  {
    heading: '7. Data Security',
    body: [
      'We take reasonable technical and organizational measures to protect your information. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.',
    ],
  },
  {
    heading: '8. Your Rights',
    body: [
      'You may access, update, or delete your account information at any time through your profile settings. To request full deletion of your data, contact us using the details below.',
    ],
  },
  {
    heading: '9. Third-Party Links',
    body: [
      'Our platform may contain links to third-party websites. We are not responsible for the privacy practices of those sites and encourage you to review their policies.',
    ],
  },
  {
    heading: '10. Changes to This Policy',
    body: [
      'We may update this Privacy Policy from time to time. Any changes will be posted on this page with a revised "last updated" date. Continued use of PropLink after changes constitutes acceptance of the updated policy.',
    ],
  },
  {
    heading: '11. Contact Us',
    body: [
      'If you have questions about this Privacy Policy or how your information is handled, please reach out through our contact page.',
    ],
  },
]

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PrivacyPage() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />

      {/* ── Hero header ── */}
      <section
        className="relative overflow-hidden pt-36 pb-20 px-6"
        style={{ background: 'linear-gradient(160deg, #040f0c 0%, #061812 45%, #0a2318 100%)' }}
      >
        {/* Gold grid texture */}
        <div
          className="absolute inset-0 opacity-[0.018] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(#C9A24D 1px, transparent 1px), linear-gradient(90deg, #C9A24D 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <div className="h-px w-8 bg-gold/40" />
            <p className="text-[10px] font-semibold tracking-[0.28em] text-gold/65 uppercase">
              Legal
            </p>
            <div className="h-px w-8 bg-gold/40" />
          </motion.div>

          <motion.h1
            className="font-serif font-bold text-white leading-tight mb-5"
            style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7, ease: EASE }}
          >
            Privacy <span className="text-gold">Policy</span>
          </motion.h1>

          <motion.p
            className="text-white/45 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.6 }}
          >
            Last updated: {LAST_UPDATED}
          </motion.p>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="bg-ivory py-20 md:py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.p
            className="text-charcoal/55 text-[15px] leading-[1.85] mb-14"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            Your privacy matters to us. This page describes what information PropLink
            collects and how we use it. Please read it carefully.
          </motion.p>

          <div className="space-y-12">
            {SECTIONS.map((section) => (
              <motion.div
                key={section.heading}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, ease: EASE }}
              >
                <div className="w-8 h-px bg-gold/50 mb-5" />
                <h2 className="font-serif text-xl md:text-2xl text-forest font-bold mb-4">
                  {section.heading}
                </h2>
                <div className="space-y-4">
                  {section.body.map((para, i) => (
                    <p key={i} className="text-charcoal/60 text-[15px] leading-[1.85]">
                      {para}
                    </p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact CTA */}
          <motion.div
            className="mt-16 pt-10 border-t border-charcoal/10 text-center"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <p className="text-charcoal/50 text-sm mb-6">
              Have questions about your privacy on PropLink?
            </p>
            <Link to="/contact" className="btn-gold rounded-full px-8 py-3 text-sm">
              Contact Us
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}