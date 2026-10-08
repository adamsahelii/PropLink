import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { IoPersonOutline } from 'react-icons/io5'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const EASE = [0.25, 0.46, 0.45, 0.94]

export default function AdminUsersPage() {
  const { token } = useAuth()

  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)
  const [busyId, setBusyId]   = useState(null)
  const [query, setQuery]     = useState('')

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/listings/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) setUsers(data.users)
      else setError(true)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { loadUsers() }, [loadUsers])

  const q = query.trim().toLowerCase()
  const filtered = q
    ? users.filter(u =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      )
    : users

  async function toggleStatus(user) {
    setBusyId(user._id)
    try {
      const res = await fetch(`/api/listings/admin/users/${user._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !user.isActive }),
      })
      const data = await res.json()
      if (data.success) {
        setUsers(prev =>
          prev.map(u => (u._id === user._id ? { ...u, isActive: !u.isActive } : u))
        )
      } else {
        alert(data.message || 'Something went wrong.')
      }
    } catch {
      alert('Network error. Please try again.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />

      <section className="max-w-5xl mx-auto px-6 pt-28 pb-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-6 bg-gold/45" />
            <p className="section-label">Admin</p>
          </div>
          <h1 className="section-title mb-2">User Management</h1>
          <p className="text-charcoal/45 text-sm">
            Deactivate an account to block it from logging in. Reactivate to restore access.
          </p>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-2 border-forest border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-20">
            <p className="text-charcoal/55 text-sm mb-4">Couldn’t load users.</p>
            <button onClick={loadUsers} className="btn-outline-forest text-xs py-2.5 px-6">Try Again</button>
          </div>
        )}

        {/* Search */}
        {!loading && !error && (
          <div className="mb-5">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full sm:max-w-xs rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-forest/40"
            />
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="bg-white rounded-[24px] shadow-sm border border-black/[0.04] overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-ivory/60 text-left text-charcoal/50">
                  <tr>
                    <th className="px-5 py-4 font-semibold uppercase tracking-wider text-[11px]">Name</th>
                    <th className="px-5 py-4 font-semibold uppercase tracking-wider text-[11px]">Email</th>
                    <th className="px-5 py-4 font-semibold uppercase tracking-wider text-[11px]">Role</th>
                    <th className="px-5 py-4 font-semibold uppercase tracking-wider text-[11px]">Status</th>
                    <th className="px-5 py-4 font-semibold uppercase tracking-wider text-[11px] text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u._id} className="border-t border-black/[0.04]">
                      <td className="px-5 py-4 font-medium text-charcoal flex items-center gap-2">
                        <IoPersonOutline className="w-4 h-4 text-gold/60 shrink-0" />
                        {u.name}
                      </td>
                      <td className="px-5 py-4 text-charcoal/65">{u.email}</td>
                      <td className="px-5 py-4 capitalize text-charcoal/65">{u.role}</td>
                      <td className="px-5 py-4">
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                          u.isActive ? 'bg-forest/12 text-forest' : 'bg-red-100 text-red-600'
                        }`}>
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {u.role === 'admin' ? (
                          <span className="text-xs text-charcoal/35">—</span>
                        ) : (
                          <button
                            onClick={() => toggleStatus(u)}
                            disabled={busyId === u._id}
                            className={`text-xs font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-50 ${
                              u.isActive
                                ? 'border border-red-300 text-red-500 hover:bg-red-50'
                                : 'bg-forest text-ivory hover:bg-forest/90'
                            }`}
                          >
                            {busyId === u._id ? 'Working…' : u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </section>

      <Footer />
    </div>
  )
}