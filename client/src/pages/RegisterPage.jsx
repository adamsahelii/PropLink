import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IoPersonOutline, IoMailOutline, IoLockClosedOutline,
  IoEyeOutline, IoEyeOffOutline, IoCallOutline,
  IoSearchOutline, IoHomeOutline, IoCheckmarkCircle,
} from 'react-icons/io5'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import LogoMark from '../components/LogoMark'

const EASE = [0.25, 0.46, 0.45, 0.94]

const ROLES = [
  {
    value: 'user',
    icon: IoSearchOutline,
    title: 'Buyer / Renter',
    desc: 'I\'m looking for a property to buy or rent',
  },
  {
    value: 'owner',
    icon: IoHomeOutline,
    title: 'Property Owner',
    desc: 'I have a property I want to list on PropLink',
  },
]

export default function RegisterPage() {
  const { user, register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name:        '',
    email:       '',
    phoneNumber: '',
    password:    '',
    confirm:     '',
    role:        'user',
  })
  const [showPwd,    setShowPwd]    = useState(false)
  const [showConf,   setShowConf]   = useState(false)
  const [status,     setStatus]     = useState('idle') // idle | loading | error
  const [errorMsg,   setErrorMsg]   = useState('')
  const [pwdMismatch, setPwdMismatch] = useState(false)

  // Already logged in — bounce to home
  useEffect(() => { if (user) navigate('/', { replace: true }) }, [user])

  function setField(key, value) {
    setForm(f => ({ ...f, [key]: value }))
    if (key === 'confirm' || key === 'password') setPwdMismatch(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password !== form.confirm) { setPwdMismatch(true); return }
    setStatus('loading')
    setErrorMsg('')

    const { confirm, ...payload } = form
    if (!payload.phoneNumber.trim()) delete payload.phoneNumber

    const result = await register(payload)
    if (result.success) {
      navigate('/', { replace: true })
    } else {
      setStatus('error')
      setErrorMsg(result.error)
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
          className="w-full max-w-lg"
        >
          {/* Logo + heading */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4">
              <LogoMark size={48} variant="gold" />
            </div>
            <h1 className="font-serif text-3xl text-forest font-bold mb-2">Join PropLink</h1>
            <p className="text-charcoal/45 text-sm">Lebanon's premium real estate platform</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-[28px] shadow-xl shadow-charcoal/8 border border-black/[0.04] p-8">
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Role selector */}
              <div>
                <p className="text-[10px] font-semibold tracking-[0.16em] text-charcoal/42 uppercase mb-3">
                  I am a…
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {ROLES.map(({ value, icon: Icon, title, desc }) => {
                    const isActive = form.role === value
                    return (
                      <motion.button
                        key={value}
                        type="button"
                        onClick={() => setField('role', value)}
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                          isActive
                            ? 'border-gold bg-gold/5 shadow-md shadow-gold/10'
                            : 'border-black/8 bg-ivory hover:border-black/15'
                        }`}
                      >
                        {isActive && (
                          <IoCheckmarkCircle className="absolute top-3 right-3 w-4 h-4 text-gold" />
                        )}
                        <Icon className={`w-5 h-5 mb-2 ${isActive ? 'text-gold' : 'text-charcoal/40'}`} />
                        <p className={`text-sm font-semibold mb-0.5 ${isActive ? 'text-forest' : 'text-charcoal/70'}`}>
                          {title}
                        </p>
                        <p className="text-[11px] text-charcoal/40 leading-snug">{desc}</p>
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* Name + Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-semibold tracking-[0.16em] text-charcoal/42 uppercase block mb-1.5">
                    Full Name *
                  </label>
                  <div className="relative">
                    <IoPersonOutline className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/32 pointer-events-none" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setField('name', e.target.value)}
                      required
                      autoComplete="name"
                      placeholder="Your full name"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-ivory border border-black/8 text-sm text-charcoal placeholder-charcoal/28 focus:outline-none focus:border-gold/55 focus:ring-1 focus:ring-gold/18 transition-all duration-200"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-semibold tracking-[0.16em] text-charcoal/42 uppercase block mb-1.5">
                    Phone <span className="text-charcoal/28 normal-case font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <IoCallOutline className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/32 pointer-events-none" />
                    <input
                      type="tel"
                      value={form.phoneNumber}
                      onChange={e => setField('phoneNumber', e.target.value)}
                      autoComplete="tel"
                      placeholder="+961 xx xxx xxx"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-ivory border border-black/8 text-sm text-charcoal placeholder-charcoal/28 focus:outline-none focus:border-gold/55 focus:ring-1 focus:ring-gold/18 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-[10px] font-semibold tracking-[0.16em] text-charcoal/42 uppercase block mb-1.5">
                  Email *
                </label>
                <div className="relative">
                  <IoMailOutline className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/32 pointer-events-none" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setField('email', e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="your@email.com"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-ivory border border-black/8 text-sm text-charcoal placeholder-charcoal/28 focus:outline-none focus:border-gold/55 focus:ring-1 focus:ring-gold/18 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password + Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-semibold tracking-[0.16em] text-charcoal/42 uppercase block mb-1.5">
                    Password *
                  </label>
                  <div className="relative">
                    <IoLockClosedOutline className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/32 pointer-events-none" />
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => setField('password', e.target.value)}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      placeholder="Min 8 characters"
                      className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-ivory border border-black/8 text-sm text-charcoal placeholder-charcoal/28 focus:outline-none focus:border-gold/55 focus:ring-1 focus:ring-gold/18 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(s => !s)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal/32 hover:text-charcoal/60 transition-colors"
                      tabIndex={-1}
                    >
                      {showPwd ? <IoEyeOffOutline className="w-4 h-4" /> : <IoEyeOutline className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-semibold tracking-[0.16em] text-charcoal/42 uppercase block mb-1.5">
                    Confirm *
                  </label>
                  <div className="relative">
                    <IoLockClosedOutline className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/32 pointer-events-none" />
                    <input
                      type={showConf ? 'text' : 'password'}
                      value={form.confirm}
                      onChange={e => setField('confirm', e.target.value)}
                      required
                      autoComplete="new-password"
                      placeholder="Repeat password"
                      className={`w-full pl-11 pr-12 py-3.5 rounded-xl bg-ivory border text-sm text-charcoal placeholder-charcoal/28 focus:outline-none focus:ring-1 transition-all duration-200 ${
                        pwdMismatch
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                          : 'border-black/8 focus:border-gold/55 focus:ring-gold/18'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConf(s => !s)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal/32 hover:text-charcoal/60 transition-colors"
                      tabIndex={-1}
                    >
                      {showConf ? <IoEyeOffOutline className="w-4 h-4" /> : <IoEyeOutline className="w-4 h-4" />}
                    </button>
                  </div>
                  {pwdMismatch && (
                    <p className="text-[11px] text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>
              </div>

              {/* API error */}
              <AnimatePresence>
                {status === 'error' && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-red-500/90 bg-red-50 rounded-xl px-4 py-3 border border-red-100"
                  >
                    {errorMsg}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Submit */}
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
                    Creating account…
                  </span>
                ) : 'Create Account'}
              </motion.button>

              <p className="text-[11px] text-charcoal/32 text-center leading-relaxed">
                By creating an account you agree to PropLink's terms of service.
              </p>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-charcoal/45 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-gold font-medium hover:text-gold-dark transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
