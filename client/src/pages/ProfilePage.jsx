import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { IoPersonOutline, IoLockClosedOutline, IoCheckmarkCircle, IoSwapHorizontalOutline, IoBusinessOutline } from 'react-icons/io5'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'

const EASE = [0.25, 0.46, 0.45, 0.94]

// ── Reusable field ────────────────────────────────────────────────────────────
function Field({ label, type = 'text', value, onChange, placeholder, autoComplete }) {
  return (
    <label className="block">
      <span className="block text-charcoal/70 text-xs font-semibold tracking-wide uppercase mb-2">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-charcoal text-sm
                   outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold/40
                   placeholder:text-charcoal/30"
      />
    </label>
  )
}

// ── Small status line ─────────────────────────────────────────────────────────
function Status({ error, success }) {
  if (!error && !success) return null
  return (
    <p className={`text-sm flex items-center gap-1.5 ${error ? 'text-red-600' : 'text-forest'}`}>
      {success && <IoCheckmarkCircle className="w-4 h-4" />}
      {error || success}
    </p>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, token, updateUser } = useAuth()

  // ── Profile details form ──
  const [profile, setProfile] = useState({ name: '', email: '', phoneNumber: '' })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')

  // ── Password form ──
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')

  // Prefill profile form once the user is available
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name ?? '',
        email: user.email ?? '',
        phoneNumber: user.phoneNumber ?? '',
      })
    }
  }, [user])

  // ── Save profile details ──
  async function handleProfileSave() {
    setProfileError(''); setProfileSuccess('')

    if (!profile.name.trim()) { setProfileError('Name cannot be empty.'); return }
    if (!profile.email.trim()) { setProfileError('Email cannot be empty.'); return }

    setProfileSaving(true)
    try {
      const res = await fetch('/api/auth/update-me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      })
      const data = await res.json()
      if (data.success) {
        updateUser(data.user)           // refresh navbar/UI instantly
        setProfileSuccess('Profile updated.')
      } else {
        setProfileError(data.message ?? 'Could not update profile.')
      }
    } catch {
      setProfileError('Network error. Please try again.')
    } finally {
      setProfileSaving(false)
    }
  }

  // ── Change password ──
  async function handlePasswordSave() {
    setPwError(''); setPwSuccess('')

    if (!pw.currentPassword || !pw.newPassword) {
      setPwError('Please fill in both password fields.'); return
    }
    if (pw.newPassword.length < 8) {
      setPwError('New password must be at least 8 characters.'); return
    }
    if (pw.newPassword !== pw.confirmPassword) {
      setPwError('New passwords do not match.'); return
    }

    setPwSaving(true)
    try {
      const res = await fetch('/api/auth/update-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: pw.currentPassword,
          newPassword: pw.newPassword,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setPwSuccess('Password changed successfully.')
        setPw({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        setPwError(data.message ?? 'Could not change password.')
      }
    } catch {
      setPwError('Network error. Please try again.')
    } finally {
      setPwSaving(false)
    }
  }

  // ── Role switch (buyer ⇄ owner) ──
  const [roleSaving, setRoleSaving] = useState(false)
  const [roleError, setRoleError]   = useState('')
  // admins never see this card; for everyone else, the "other" role
  const isBuyer   = user?.role === 'user'
  const targetRole = isBuyer ? 'owner' : 'user'

  async function handleRoleSwitch() {
    setRoleError('')
    const label = targetRole === 'owner' ? 'Owner' : 'Buyer'
    if (!window.confirm(`Switch your account to ${label}? You can switch back anytime.`)) return

    setRoleSaving(true)
    try {
      const res = await fetch('/api/auth/update-me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: targetRole }),
      })
      const data = await res.json()
      if (data.success) {
        updateUser(data.user)   // navbar links update instantly
      } else {
        setRoleError(data.message ?? 'Could not switch account type.')
      }
    } catch {
      setRoleError('Network error. Please try again.')
    } finally {
      setRoleSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />

      {/* ── Hero header ── */}
      <section
        className="relative overflow-hidden pt-36 pb-20 px-6"
        style={{ background: 'linear-gradient(160deg, #040f0c 0%, #061812 45%, #0a2318 100%)' }}
      >
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
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <div className="h-px w-8 bg-gold/40" />
            <p className="text-[10px] font-semibold tracking-[0.28em] text-gold/65 uppercase">
              My Account
            </p>
            <div className="h-px w-8 bg-gold/40" />
          </motion.div>
          <motion.h1
            className="font-serif font-bold text-white leading-tight"
            style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)' }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7, ease: EASE }}
          >
            Profile <span className="text-gold">Settings</span>
          </motion.h1>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="bg-ivory py-16 md:py-24 px-6">
        <div className="max-w-2xl mx-auto space-y-8">

          {/* Profile details card */}
          <motion.div
            className="bg-white rounded-2xl border border-charcoal/10 p-8 md:p-10 shadow-sm"
            initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.55, ease: EASE }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center">
                <IoPersonOutline className="w-5 h-5 text-forest" />
              </div>
              <div>
                <h2 className="font-serif text-xl text-forest font-bold">Profile Details</h2>
                <p className="text-charcoal/45 text-xs">Update your personal information</p>
              </div>
            </div>

            <div className="space-y-5">
              <Field label="Full Name" value={profile.name}
                onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                placeholder="Your name" autoComplete="name" />
              <Field label="Email" type="email" value={profile.email}
                onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com" autoComplete="email" />
              <Field label="Phone Number" type="tel" value={profile.phoneNumber}
                onChange={e => setProfile(p => ({ ...p, phoneNumber: e.target.value }))}
                placeholder="+961 ..." autoComplete="tel" />

              <div className="flex items-center justify-between gap-4 pt-2">
                <Status error={profileError} success={profileSuccess} />
                <motion.button
                  onClick={handleProfileSave} disabled={profileSaving}
                  whileTap={{ scale: 0.97 }}
                  className="btn-gold rounded-full px-7 py-3 text-sm shrink-0 disabled:opacity-60"
                >
                  {profileSaving ? 'Saving…' : 'Save Changes'}
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Role switch card — hidden for admins */}
          {user?.role !== 'admin' && (
          <motion.div
            className="bg-white rounded-2xl border border-charcoal/10 p-8 md:p-10 shadow-sm"
            initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.55, ease: EASE, delay: 0.03 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center">
                <IoSwapHorizontalOutline className="w-5 h-5 text-forest" />
              </div>
              <div>
                <h2 className="font-serif text-xl text-forest font-bold">Account Type</h2>
                <p className="text-charcoal/45 text-xs">Switch between buying and listing properties</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl bg-ivory border border-charcoal/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <IoBusinessOutline className="w-5 h-5 text-gold shrink-0" />
                <div>
                  <p className="text-charcoal text-sm font-semibold">
                    You're currently a {isBuyer ? 'Buyer' : 'Owner'}
                  </p>
                  <p className="text-charcoal/50 text-xs mt-0.5">
                    {isBuyer
                      ? 'Switch to Owner to list and manage your own properties.'
                      : 'Switch to Buyer to browse listings without owner tools.'}
                  </p>
                </div>
              </div>
              <motion.button
                onClick={handleRoleSwitch} disabled={roleSaving}
                whileTap={{ scale: 0.97 }}
                className="btn-gold rounded-full px-6 py-3 text-sm shrink-0 disabled:opacity-60 whitespace-nowrap"
              >
                {roleSaving ? 'Switching…' : `Switch to ${isBuyer ? 'Owner' : 'Buyer'}`}
              </motion.button>
            </div>

            <div className="mt-3">
              <Status error={roleError} success="" />
            </div>
          </motion.div>
          )}

          {/* Password card */}
          <motion.div
            className="bg-white rounded-2xl border border-charcoal/10 p-8 md:p-10 shadow-sm"
            initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.55, ease: EASE, delay: 0.05 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center">
                <IoLockClosedOutline className="w-5 h-5 text-forest" />
              </div>
              <div>
                <h2 className="font-serif text-xl text-forest font-bold">Change Password</h2>
                <p className="text-charcoal/45 text-xs">Choose a strong password you don't use elsewhere</p>
              </div>
            </div>

            <div className="space-y-5">
              <Field label="Current Password" type="password" value={pw.currentPassword}
                onChange={e => setPw(p => ({ ...p, currentPassword: e.target.value }))}
                placeholder="••••••••" autoComplete="current-password" />
              <Field label="New Password" type="password" value={pw.newPassword}
                onChange={e => setPw(p => ({ ...p, newPassword: e.target.value }))}
                placeholder="At least 8 characters" autoComplete="new-password" />
              <Field label="Confirm New Password" type="password" value={pw.confirmPassword}
                onChange={e => setPw(p => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="Re-enter new password" autoComplete="new-password" />

              <div className="flex items-center justify-between gap-4 pt-2">
                <Status error={pwError} success={pwSuccess} />
                <motion.button
                  onClick={handlePasswordSave} disabled={pwSaving}
                  whileTap={{ scale: 0.97 }}
                  className="btn-gold rounded-full px-7 py-3 text-sm shrink-0 disabled:opacity-60"
                >
                  {pwSaving ? 'Updating…' : 'Update Password'}
                </motion.button>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      <Footer />
    </div>
  )
}