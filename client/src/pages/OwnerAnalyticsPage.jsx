import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  IoEyeOutline, IoChatbubbleOutline, IoHeartOutline, IoHomeOutline,
  IoTrendingUpOutline, IoAlertCircleOutline, IoRefreshOutline, IoAddOutline,
} from 'react-icons/io5'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { analyticsApi } from '../utils/api'
import noPhoto from '../assets/no-photo.jpg'

const EASE = [0.25, 0.46, 0.45, 0.94]

const SORTS = [
  { key: 'views',          label: 'Views' },
  { key: 'inquiries',      label: 'Inquiries' },
  { key: 'favorites',      label: 'Favorites' },
  { key: 'conversionRate', label: 'Conversion' },
]

const STATUS_STYLE = {
  approved: 'bg-forest/10 text-forest',
  pending:  'bg-gold/15 text-gold-dark',
  rejected: 'bg-red-50 text-red-500',
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, hint, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: EASE }}
      className="bg-white rounded-3xl p-6 shadow-sm border border-black/[0.04]"
    >
      <div className="w-10 h-10 rounded-full bg-gold/12 flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-gold" aria-hidden="true" />
      </div>
      <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-charcoal/45 mb-1">{label}</p>
      <p className="font-serif text-3xl font-bold text-forest">{value}</p>
      {hint && <p className="text-xs text-charcoal/40 mt-1">{hint}</p>}
    </motion.div>
  )
}

// ── Horizontal bar chart (pure CSS, no chart library) ─────────────────────────

function TopListingsChart({ rows, metric }) {
  const top = rows.slice(0, 5)
  const max = Math.max(1, ...top.map((r) => r[metric]))
  const label = SORTS.find((s) => s.key === metric)?.label

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-black/[0.04]">
      <h2 className="font-serif text-xl font-bold text-forest mb-1">Top Performers</h2>
      <p className="text-xs text-charcoal/45 mb-6">Your top 5 listings by {label.toLowerCase()}</p>

      <div className="space-y-4">
        {top.map((r, i) => (
          <div key={r._id}>
            <div className="flex items-center justify-between text-sm mb-1.5 gap-3">
              <span className="text-charcoal/75 truncate">{r.title}</span>
              <span className="font-semibold text-forest shrink-0">
                {r[metric]}{metric === 'conversionRate' ? '%' : ''}
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-forest/[0.06] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(r[metric] / max) * 100}%` }}
                transition={{ duration: 0.7, delay: i * 0.08, ease: EASE }}
                className="h-full rounded-full bg-gold"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function OwnerAnalyticsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sortBy, setSortBy] = useState('views')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    analyticsApi
      .owner({ signal: controller.signal })
      .then((d) => { setData(d); setLoading(false) })
      .catch((err) => {
        if (err.name === 'AbortError') return
        setError(err.message)
        setLoading(false)
      })
    return () => controller.abort()
  }, [reloadKey])

  const sorted = useMemo(
    () => (data ? [...data.listings].sort((a, b) => b[sortBy] - a[sortBy]) : []),
    [data, sortBy]
  )

  const t = data?.totals

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <section
        className="relative pt-28 pb-14 px-4 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #07201A 0%, #0a2d22 55%, #0F3D2E 100%)' }}
      >
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-gold/50" />
            <p className="section-label text-gold/80">Owner Dashboard</p>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-white font-bold leading-tight mb-2">
            Listing Analytics
          </h1>
          <p className="text-white/50 text-sm">
            How buyers and renters are engaging with your properties
          </p>
        </div>
      </section>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <section className="flex-1 bg-ivory py-10 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-40 bg-white rounded-3xl animate-pulse" />
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="text-center py-20">
              <IoAlertCircleOutline className="w-10 h-10 text-red-400 mx-auto mb-4" />
              <p className="text-charcoal/60 text-sm mb-6">{error}</p>
              <button
                onClick={() => setReloadKey((k) => k + 1)}
                className="btn-outline-forest inline-flex items-center gap-2 rounded-full text-xs py-3 px-7"
              >
                <IoRefreshOutline className="w-4 h-4" /> Try again
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && t?.listings === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-forest/[0.07] flex items-center justify-center mx-auto mb-6">
                <IoHomeOutline className="w-8 h-8 text-forest/35" />
              </div>
              <h2 className="font-serif text-2xl text-forest font-bold mb-3">No data yet</h2>
              <p className="text-charcoal/50 text-sm max-w-xs mx-auto mb-8">
                Add a property and its analytics will appear here.
              </p>
              <Link to="/add-residence" className="btn-gold inline-flex items-center gap-2 rounded-full px-8">
                <IoAddOutline className="w-4 h-4" /> Add Property
              </Link>
            </div>
          )}

          {/* Dashboard */}
          {!loading && !error && t?.listings > 0 && (
            <>
              {/* Stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <StatCard icon={IoEyeOutline} label="Total Views" value={t.views.toLocaleString()} delay={0} />
                <StatCard icon={IoChatbubbleOutline} label="Inquiries" value={t.inquiries.toLocaleString()} delay={0.05} />
                <StatCard icon={IoHeartOutline} label="Saved" value={t.favorites.toLocaleString()} delay={0.1} />
                <StatCard
                  icon={IoTrendingUpOutline}
                  label="Conversion"
                  value={`${t.conversionRate}%`}
                  hint="Inquiries per view"
                  delay={0.15}
                />
              </div>

              {/* Status summary */}
              <div className="flex flex-wrap items-center gap-2 mb-8 text-xs">
                <span className="text-charcoal/50 mr-1">
                  {t.listings} propert{t.listings === 1 ? 'y' : 'ies'}:
                </span>
                {['approved', 'pending', 'rejected'].map((s) =>
                  t[s] ? (
                    <span key={s} className={`px-3 py-1 rounded-full font-semibold capitalize ${STATUS_STYLE[s]}`}>
                      {t[s]} {s}
                    </span>
                  ) : null
                )}
              </div>

              {/* Sort selector */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-xs text-charcoal/50 mr-1">Rank by:</span>
                {SORTS.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setSortBy(s.key)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      sortBy === s.key
                        ? 'bg-gold text-white shadow-md shadow-gold/20'
                        : 'border border-forest/20 text-charcoal/65 hover:border-gold hover:text-gold'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart */}
                <div className="lg:col-span-1">
                  <TopListingsChart rows={sorted} metric={sortBy} />
                </div>

                {/* Per-listing table */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-black/[0.04] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-[10px] uppercase tracking-[0.15em] text-charcoal/45 border-b border-black/5">
                          <th className="px-5 py-4 font-semibold">Property</th>
                          <th className="px-3 py-4 font-semibold text-right">Views</th>
                          <th className="px-3 py-4 font-semibold text-right">Inquiries</th>
                          <th className="px-3 py-4 font-semibold text-right">Saved</th>
                          <th className="px-5 py-4 font-semibold text-right">Conv.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sorted.map((r) => (
                          <tr key={r._id} className="border-b border-black/5 last:border-0 hover:bg-ivory/60 transition-colors">
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3 min-w-[220px]">
                                <img
                                  src={r.image || noPhoto}
                                  alt=""
                                  className="w-12 h-12 rounded-xl object-cover shrink-0"
                                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = noPhoto }}
                                />
                                <div className="min-w-0">
                                  {r.approvalStatus === 'approved' ? (
                                    <Link to={`/listings/${r.slug}`} className="font-medium text-charcoal hover:text-forest truncate block">
                                      {r.title}
                                    </Link>
                                  ) : (
                                    <p className="font-medium text-charcoal truncate">{r.title}</p>
                                  )}
                                  <span className={`inline-block mt-1 text-[9px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLE[r.approvalStatus]}`}>
                                    {r.approvalStatus}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-3 text-right text-charcoal/75">{r.views}</td>
                            <td className="px-3 py-3 text-right text-charcoal/75">{r.inquiries}</td>
                            <td className="px-3 py-3 text-right text-charcoal/75">{r.favorites}</td>
                            <td className="px-5 py-3 text-right font-semibold text-forest">{r.conversionRate}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}