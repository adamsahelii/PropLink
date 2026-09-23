import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { IoMailOutline, IoCheckmarkCircleOutline } from 'react-icons/io5'
import Navbar from '../components/Navbar'
import LogoMark from '../components/LogoMark'

const EASE = [0.25, 0.46, 0.45, 0.94]

export default function ForgotPasswordPage() {
  const [email,    setEmail]    = useState('')
  const [status,   setStatus]   = useState('idle') // idle | loading | sent | error
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')
    try {
      const res  = await fetch('/api/auth/forgot-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (data.success) setStatus('sent')
      else { setStatus('error'); setErrorMsg(data.message ?? 'Something went wrong.') }
    } catch {
      setStatus('error')
      setErrorMsg('Network error. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-28">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: EASE }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4">
              <LogoMark size={48} variant="gold" />
            </div>
            <h1 className="font-serif text-3xl text-forest font-bold mb-2">Forgot password?</h1>
            <p className="text-charcoal/45 text-sm">
              Enter your email and we'll send you a reset link.
            </p>
          </div>

          <div className="bg-white rounded-[28px] shadow-xl shadow-charcoal/8 border border-black/[0.04] p-8">
            {status === 'sent' ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-2"
              >
                <IoCheckmarkCircleOutline className="w-12 h-12 text-gold mx-auto mb-4" />
                <h2 className="font-serif text-xl text-forest font-bold mb-2">Check your inbox</h2>
                <p className="text-sm text-charcoal/55 leading-relaxed">
                  If an account exists for <span className="font-medium text-charcoal/75">{email.trim()}</span>,
                  a reset link is on its way. It expires in 15 minutes. Don't forget to check spam.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-[10px] font-semibold tracking-[0.16em] text-charcoal/42 uppercase block mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <IoMailOutline className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/32 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      placeholder="your@email.com"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-ivory border border-black/8 text-sm text-charcoal placeholder-charcoal/28 focus:outline-none focus:border-gold/55 focus:ring-1 focus:ring-gold/18 transition-all duration-200"
                    />
                  </div>
                </div>

                {status === 'error' && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-500/90 bg-red-50 rounded-xl px-4 py-3 border border-red-100"
                  >
                    {errorMsg}
                  </motion.p>
                )}

                <motion.button
                  type="submit"
                  disabled={status === 'loading'}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-gold w-full text-sm py-4 rounded-xl !px-0 disabled:opacity-55 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Sending…
                    </span>
                  ) : 'Send Reset Link'}
                </motion.button>
              </form>
            )}
          </div>

          <p className="text-center text-sm text-charcoal/45 mt-6">
            Remembered it?{' '}
            <Link to="/login" className="text-gold font-medium hover:text-gold-dark transition-colors">
              Back to sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}