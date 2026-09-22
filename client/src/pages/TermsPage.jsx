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
    heading: '1. Acceptance of Terms',
    body: [
      'Welcome to PropLink. These Terms & Conditions govern your use of our online real estate marketplace connecting buyers, renters, and property owners across Lebanon.',
      'By accessing or using PropLink, you agree to be bound by these terms. If you do not agree, you may not use the platform.',
    ],
  },
  {
    heading: '2. Eligibility',
    body: [
      'You must be at least 18 years old and legally capable of entering into binding agreements to use PropLink. By using the platform, you represent that you meet these requirements.',
    ],
  },
  {
    heading: '3. Your Account',
    body: [
      'You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. Notify us immediately of any unauthorized use.',
      'You agree to provide accurate, current, and complete information when creating your account and to keep it up to date.',
    ],
  },
  {
    heading: '4. Property Listings',
    body: [
      'Owners are solely responsible for the accuracy of the listings they publish, including pricing, photographs, descriptions, and availability. Listings must reflect real, available properties and must not be misleading.',
      'PropLink reserves the right to review, edit, or remove any listing that violates these terms or that we believe to be fraudulent, inaccurate, or inappropriate.',
    ],
  },
  {
    heading: '5. User Conduct',
    body: [
      'You agree not to use PropLink to post false or misleading content, harass or defraud other users, publish unlawful or offensive material, or interfere with the operation of the platform.',
      'You may not scrape, copy, or redistribute listings or user data without our written permission.',
    ],
  },
  {
    heading: '6. Transactions Between Users',
    body: [
      'PropLink is a platform that connects buyers and renters directly with property owners. We are not a party to any agreement, sale, or rental arrangement made between users.',
      'We do not verify the legal ownership of listed properties, and we are not responsible for the conduct of any user or the outcome of any transaction. Always exercise due diligence before entering into any agreement.',
    ],
  },
  {
    heading: '7. Intellectual Property',
    body: [
      'The PropLink name, logo, design, and platform content are the property of PropLink and are protected by applicable laws. You may not use them without our prior written consent.',
      'By publishing a listing, you grant PropLink a non-exclusive license to display that content on the platform for the purpose of operating the service.',
    ],
  },
  {
    heading: '8. Disclaimer of Warranties',
    body: [
      'PropLink is provided "as is" and "as available" without warranties of any kind, whether express or implied. We do not guarantee that the platform will be uninterrupted, error-free, or that listings are accurate or complete.',
    ],
  },
  {
    heading: '9. Limitation of Liability',
    body: [
      'To the fullest extent permitted by law, PropLink shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform, including losses related to transactions between users.',
    ],
  },
  {
    heading: '10. Termination',
    body: [
      'We may suspend or terminate your access to PropLink at any time, without notice, if you violate these terms or engage in conduct we deem harmful to the platform or its users.',
    ],
  },
  {
    heading: '11. Governing Law',
    body: [
      'These Terms & Conditions are governed by the laws of Lebanon. Any disputes arising from your use of the platform shall be subject to the jurisdiction of the Lebanese courts.',
    ],
  },
  {
    heading: '12. Changes to These Terms',
    body: [
      'We may revise these Terms & Conditions from time to time. Updated terms will be posted on this page with a revised "last updated" date. Continued use of PropLink after changes constitutes acceptance of the revised terms.',
    ],
  },
  {
    heading: '13. Contact Us',
    body: [
      'If you have questions about these Terms & Conditions, please reach out through our contact page.',
    ],
  },
]

// ── Page ──────────────────────────────────────────────────────────────────────
export default function TermsPage() {
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
            Terms & <span className="text-gold">Conditions</span>
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
            Please read these terms carefully before using PropLink. They set out the
            rules for using our platform and the responsibilities of everyone involved.
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
              Questions about these terms?
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