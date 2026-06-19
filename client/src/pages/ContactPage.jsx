import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IoCheckmarkCircleOutline,
  IoArrowForwardOutline,
} from 'react-icons/io5'
import Navbar from '../components/Navbar'

const EASE = [0.25, 0.46, 0.45, 0.94]

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=85'

const SUBJECTS = [
  'Property Inquiry',
  'Schedule a Viewing',
  'List My Property',
  'Investment Advice',
  'General Question',
]

const EMPTY_FORM = {
  firstName: '', lastName: '', email: '',
  phone: '', subject: '', message: '',
}

// ── Shared input style ────────────────────────────────────────────────────────

const inputCls =
  'w-full px-4 py-3.5 rounded-xl bg-ivory border border-black/[0.08] text-sm text-charcoal ' +
  'placeholder-charcoal/28 focus:outline-none focus:border-gold/55 focus:ring-1 ' +
  'focus:ring-gold/18 transition-all duration-200'

function Field({ label, children }) {
  return (
    <div>
      <label className="text-[10px] font-semibold tracking-[0.16em] text-charcoal/42 uppercase block mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ContactPage() {
  const [form,       setForm]       = useState(EMPTY_FORM)
  const [formStatus, setFormStatus] = useState('idle') // idle | submitting | success

  function setField(key, value) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormStatus('submitting')
    // No backend contact route — clean UX delay before success state
    await new Promise(r => setTimeout(r, 900))
    setFormStatus('success')
  }

  function resetForm() {
    setForm(EMPTY_FORM)
    setFormStatus('idle')
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="flex flex-col lg:flex-row">

        {/* ── Mobile hero banner (above form on small screens) ─────── */}
        <div className="lg:hidden relative h-52 sm:h-64 overflow-hidden shrink-0">
          <img
            src={HERO_IMAGE}
            alt="Luxury property interior"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-forest/35 via-forest/10 to-transparent" />
        </div>

        {/* ── LEFT: Form panel ──────────────────────────────────────── */}
        <div className="flex-1 bg-white">
          <div className="max-w-xl lg:max-w-none px-6 sm:px-10 lg:pl-16 xl:pl-24 2xl:pl-32 lg:pr-10 xl:pr-16 mx-auto lg:mx-0 pt-10 lg:pt-32 pb-16 lg:pb-24">

            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="flex items-center gap-3 mb-5"
            >
              <div className="h-px w-6 bg-gold/50" />
              <p className="text-[11px] font-semibold tracking-[0.24em] text-gold uppercase">
                Find Your Next Property
              </p>
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="font-serif leading-[1.06] font-bold text-forest mb-10 lg:mb-12"
              style={{ fontSize: 'clamp(2.4rem, 4.5vw, 3.8rem)' }}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.65, ease: EASE }}
            >
              Talk to Our<br />
              Property<br />
              <span className="text-gold">Experts</span>
            </motion.h1>

            {/* Form / Success state */}
            <AnimatePresence mode="wait">
              {formStatus === 'success' ? (

                /* ── Success ── */
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  <div className="w-14 h-14 rounded-full bg-forest/8 flex items-center justify-center mb-6">
                    <IoCheckmarkCircleOutline className="w-7 h-7 text-forest" />
                  </div>
                  <h2 className="font-serif text-2xl text-forest font-bold mb-3">
                    Message Received
                  </h2>
                  <p className="text-charcoal/52 text-sm leading-relaxed mb-8 max-w-sm">
                    Thank you for reaching out. A PropLink property expert will be in touch with you within 24 hours.
                  </p>
                  <button
                    onClick={resetForm}
                    className="text-sm font-medium text-gold hover:text-gold-dark transition-colors flex items-center gap-1.5"
                  >
                    Send another message
                    <IoArrowForwardOutline className="w-4 h-4" />
                  </button>
                </motion.div>

              ) : (

                /* ── Form ── */
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: 0.18, duration: 0.4, ease: EASE }}
                  className="space-y-5"
                >
                  {/* Row 1: Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label="First Name">
                      <input
                        type="text"
                        value={form.firstName}
                        onChange={e => setField('firstName', e.target.value)}
                        required
                        autoComplete="given-name"
                        placeholder="John"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Last Name">
                      <input
                        type="text"
                        value={form.lastName}
                        onChange={e => setField('lastName', e.target.value)}
                        required
                        autoComplete="family-name"
                        placeholder="Doe"
                        className={inputCls}
                      />
                    </Field>
                  </div>

                  {/* Row 2: Contact */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label="Email">
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => setField('email', e.target.value)}
                        required
                        autoComplete="email"
                        placeholder="your@email.com"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Phone">
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={e => setField('phone', e.target.value)}
                        autoComplete="tel"
                        placeholder="+961 xx xxx xxx"
                        className={inputCls}
                      />
                    </Field>
                  </div>

                  {/* Subject */}
                  <Field label="Subject">
                    <div className="relative">
                      <select
                        value={form.subject}
                        onChange={e => setField('subject', e.target.value)}
                        required
                        className={`${inputCls} appearance-none cursor-pointer pr-10`}
                      >
                        <option value="" disabled>Select a subject…</option>
                        {SUBJECTS.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <svg
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-charcoal/35"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2.5" strokeLinecap="round"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </Field>

                  {/* Message */}
                  <Field label="Message">
                    <textarea
                      value={form.message}
                      onChange={e => setField('message', e.target.value)}
                      required
                      rows={5}
                      placeholder="Tell us how we can help you find the perfect property in Lebanon…"
                      className={`${inputCls} resize-none`}
                    />
                  </Field>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={formStatus === 'submitting'}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-gold w-full py-4 text-sm rounded-xl !px-0 disabled:opacity-55 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {formStatus === 'submitting' ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        Send Message
                        <IoArrowForwardOutline className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>

                  {/* Reassurance */}
                  <p className="text-[11px] text-charcoal/30 text-center pt-1">
                    We respond within 24 hours · No spam, ever
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── RIGHT: Luxury image panel (desktop only) ─────────────── */}
        <div
          className="hidden lg:block shrink-0 relative overflow-hidden"
          style={{ width: '42%', position: 'sticky', top: 0, height: '100vh' }}
        >
          <img
            src={HERO_IMAGE}
            alt="Luxury property interior"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        </div>

      </div>
    </div>
  )
}
