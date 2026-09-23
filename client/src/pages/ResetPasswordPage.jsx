import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { IoLockClosedOutline, IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import LogoMark from '../components/LogoMark'

const EASE = [0.25, 0.46, 0.45, 0.94]

const INPUT_CLS =
  'w-full pl-11 pr-12 py-3.5 rounded-xl bg-ivory border border-black/8 text-sm text-charcoal placeholder-charcoal/28 focus:outline-none focus:border-gold/55 focus:ring-1 focus:ring-gold/18 transition-all duration-200'

export default function ResetPasswordPage() {
  const { token }         = useParams()
  const { resetPassword } = useAuth()
  const navigate          = useNavigate()

  const [form,     setForm]     = useState({ password: '', confirm: '' })
  const [showPwd,  setShowPwd]  = useState(false)
  const [status,   setStatus]   = useState('idle') // idle | loading | error
  const [errorMsg, setErrorMsg] = useState('')
  const [expired,  setExpired]  = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorMsg('')

    if (form.password.length < 8) {
      setStatus('error'); setErrorMsg('Password must be at least 8 characters.'); return
    }
    if (form.password !== form.confirm) {
      setStatus('error'); setErrorMsg('Passwords do not match.'); return
    }

    setStatus('loading')
    const result = await resetPassword(token, form.password)
    if (result.success) {
      navigate('/', { replace: true })
    } else {
      setStatus('error')
      setErrorMsg(result.error)
      setExpired(/invalid or has expired/i.test(result.error))
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
            <h1 className="font-serif text-3xl text-forest font-bold mb-2">Choose a new password</h1>
            <p className="text-charcoal/45 text-sm">At least 8 characters.</p>
          </div>

          <div className="bg-white rounded-[28px] shadow-xl shadow-charcoal/8 border border-black/[0.04] p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* New password */}
              <div>
                <label className="text-[10px] font-semibold tracking-[0.16em] text-charcoal/42 uppercase block mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <IoLockClosedOutline className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/32 pointer-events-none" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className={INPUT_CLS}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(s => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal/32 hover:text-charcoal/60 transition-colors"
                    tabIndex={-1}
                    aria-label={showPwd ? 'Hide password' : 'Show password'}
                  >
                    {showPwd ? <IoEyeOffOutline className="w-4 h-4" /> : <IoEyeOutline className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm */}
              <div>
                <label className="text-[10px] font-semibold tracking-[0.16em] text-charcoal/42 uppercase block mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <IoLockClosedOutline className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/32 pointer-events-none" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={form.confirm}
                    onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className={INPUT_CLS}
                  />
                </div>
              </div>

              {status === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-500/90 bg-red-50 rounded-xl px-4 py-3 border border-red-100"
                >
                  {errorMsg}
                  {expired && (
                    <>
                      {' '}
                      <Link to="/forgot-password" className="font-semibold underline">
                        Request a new link
                      </Link>
                    </>
                  )}
                </motion.div>
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
                    Saving…
                  </span>
                ) : 'Reset Password'}
              </motion.button>
            </form>
          </div>

          <p className="text-center text-sm text-charcoal/45 mt-6">
            <Link to="/login" className="text-gold font-medium hover:text-gold-dark transition-colors">
              Back to sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}