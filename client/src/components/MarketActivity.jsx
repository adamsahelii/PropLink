import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const ACTIVITY_CONFIG = {
  high:   { label: 'High',   dot: '#E87D4A', bar: '#E87D4A', badge: 'bg-[#E87D4A]/12 text-[#C05A28]', emoji: '🔥' },
  medium: { label: 'Medium', dot: '#C9A24D', bar: '#C9A24D', badge: 'bg-gold/12 text-gold-dark',       emoji: '🟡' },
  low:    { label: 'Low',    dot: '#1a5c44', bar: '#1a5c44', badge: 'bg-forest/8 text-forest/60',      emoji: '🟢' },
  none:   { label: '—',      dot: '#D1D5DB', bar: '#D1D5DB', badge: 'bg-gray-100 text-gray-400',       emoji: '⚪' },
}

const EASE = [0.25, 0.46, 0.45, 0.94]

const INSIGHT_ITEMS = [
  { key: 'mostActive',  label: 'Most Active Region',   icon: '🔥', sub: 'highest listing volume'   },
  { key: 'mostLand',    label: 'Most Available Land',  icon: '🌿', sub: 'by land listing count'     },
  { key: 'mostRentals', label: 'Most Rental Listings', icon: '🏠', sub: 'for-rent properties'       },
  { key: 'newestCity',  label: 'Freshest Listings',    icon: '✨', sub: 'most recently added'        },
]

function SkeletonBar() {
  return <div className="h-3 rounded-full bg-gray-100 animate-pulse" />
}

function ActivityRow({ city, count, level, max, index, onNavigate }) {
  const cfg = ACTIVITY_CONFIG[level] ?? ACTIVITY_CONFIG.none
  const pct = max > 0 ? (count / max) * 100 : 0

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.035, duration: 0.32, ease: EASE }}
      className="flex items-center gap-3 py-2.5 group cursor-pointer"
      onClick={() => onNavigate(city)}
    >
      {/* Activity dot */}
      <div
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: cfg.dot }}
      />

      {/* City name */}
      <span className="text-sm font-medium text-charcoal/75 group-hover:text-forest transition-colors duration-150 w-24 shrink-0 truncate">
        {city}
      </span>

      {/* Activity bar */}
      <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: cfg.bar }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: index * 0.035 + 0.1, duration: 0.55, ease: EASE }}
        />
      </div>

      {/* Count */}
      <span className="text-xs font-semibold text-charcoal/45 w-8 text-right shrink-0">
        {count}
      </span>

      {/* Level badge */}
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full tracking-wide shrink-0 ${cfg.badge}`}>
        {cfg.label}
      </span>
    </motion.div>
  )
}

function InsightItem({ icon, label, sub, value, loading, isLast, onNavigate }) {
  return (
    <div className={`py-4 ${!isLast ? 'border-b border-white/8' : ''}`}>
      <div className="flex items-start gap-3">
        <span className="text-base leading-none mt-0.5">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold tracking-[0.18em] text-white/35 uppercase mb-1">{label}</p>
          {loading ? (
            <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
          ) : value ? (
            <button
              onClick={() => onNavigate(value)}
              className="font-serif text-lg text-gold font-bold leading-none hover:text-gold-light transition-colors cursor-pointer text-left"
            >
              {value}
            </button>
          ) : (
            <span className="font-serif text-lg text-white/25 font-bold leading-none">—</span>
          )}
          <p className="text-[10px] text-white/22 mt-0.5">{sub}</p>
        </div>
      </div>
    </div>
  )
}

export default function MarketActivity({ cityTotals, activityMap, insights, loading }) {
  const navigate = useNavigate()

  const sortedCities = useMemo(() => {
    return Object.entries(cityTotals)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
  }, [cityTotals])

  const max = sortedCities[0]?.[1] ?? 0
  const hasData = sortedCities.length > 0

  function goToCity(city) {
    navigate(`/listings?city=${encodeURIComponent(city)}`)
  }

  return (
    <section className="bg-ivory px-4 pb-10">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          {/* Section header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-6 bg-gold/45" />
            <p className="text-[10px] font-semibold tracking-[0.22em] text-gold/70 uppercase">
              Market Pulse
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-8">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl text-forest font-bold leading-tight">
                Lebanon Real Estate Activity
              </h2>
              <p className="text-charcoal/42 text-sm mt-1">
                Live ranking based on current listing data
              </p>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-4">
              {(['high', 'medium', 'low'] ).map(level => {
                const cfg = ACTIVITY_CONFIG[level]
                return (
                  <div key={level} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cfg.dot }} />
                    <span className="text-[11px] text-charcoal/48 font-medium">{cfg.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

            {/* ── Activity rankings (left) ─────────────────────────────────────── */}
            <div className="lg:col-span-3 bg-white rounded-[24px] shadow-md shadow-charcoal/5 border border-black/[0.04] p-6">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-charcoal/38 uppercase mb-4">
                City Rankings by Listing Volume
              </p>

              {loading ? (
                <div className="space-y-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 py-1.5">
                      <div className="w-2 h-2 rounded-full bg-gray-200 shrink-0" />
                      <div className="w-20 h-3 rounded-full bg-gray-100 animate-pulse" />
                      <div className="flex-1 h-1 rounded-full bg-gray-100 animate-pulse" />
                      <div className="w-6 h-3 rounded-full bg-gray-100 animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : !hasData ? (
                <div className="py-10 text-center">
                  <p className="text-charcoal/35 text-sm">No listing data available</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {sortedCities.map(([city, count], i) => (
                    <ActivityRow
                      key={city}
                      city={city}
                      count={count}
                      level={activityMap[city] ?? 'low'}
                      max={max}
                      index={i}
                      onNavigate={goToCity}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ── Insights panel (right) ──────────────────────────────────────── */}
            <div
              className="lg:col-span-2 rounded-[24px] p-6 shadow-xl shadow-forest/20"
              style={{ background: 'linear-gradient(145deg, #061812 0%, #0a2d22 50%, #0F3D2E 100%)' }}
            >
              {/* Header */}
              <div className="flex items-center gap-2.5 mb-1">
                <div className="h-px w-4 bg-gold/45" />
                <p className="text-[9px] font-semibold tracking-[0.22em] text-gold/60 uppercase">
                  Market Insights
                </p>
              </div>
              <p className="text-white/22 text-[11px] mb-4">Derived from live listings</p>

              {INSIGHT_ITEMS.map((item, i) => (
                <InsightItem
                  key={item.key}
                  icon={item.icon}
                  label={item.label}
                  sub={item.sub}
                  value={insights[item.key]}
                  loading={loading}
                  isLast={i === INSIGHT_ITEMS.length - 1}
                  onNavigate={goToCity}
                />
              ))}
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  )
}
