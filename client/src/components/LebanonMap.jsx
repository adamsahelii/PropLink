import { motion, AnimatePresence } from 'framer-motion'

// Simplified Lebanon polygon — clockwise from NW coast
// ViewBox: 0 0 200 268  (lon 35.05–36.65 × lat 33.00–34.70)
const LEBANON_PATH =
  'M 119 5 L 175 5 L 194 15 L 190 60 L 182 110 L 170 155 L 155 195 ' +
  'L 140 225 L 102 258 L 55 262 L 15 252 L 10 240 ' +
  'L 19 226 L 30 208 L 40 182 L 52 155 L 56 130 L 66 118 ' +
  'L 71 114 L 75 91 L 76 71 L 85 55 L 99 43 L 108 20 L 119 5 Z'

// Geographic positions inside the viewBox
const CITY_PINS = [
  { name: 'Tripoli', x: 99,  y: 43  },
  { name: 'Batroun', x: 76,  y: 71  },
  { name: 'Jbeil',   x: 75,  y: 91  },
  { name: 'Jounieh', x: 71,  y: 114 },
  { name: 'Beirut',  x: 56,  y: 128 },
  { name: 'Zahle',   x: 106, y: 134 },
  { name: 'Sidon',   x: 40,  y: 180 },
  { name: 'Tyre',    x: 19,  y: 226 },
]

export default function LebanonMap({ city, onCitySelect, total, loading }) {
  return (
    <section className="bg-ivory px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative rounded-[32px] overflow-hidden shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #061812 0%, #0a2d22 45%, #0F3D2E 100%)',
          }}
        >
          {/* Gold grid texture */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(#C9A24D 1px, transparent 1px), linear-gradient(90deg, #C9A24D 1px, transparent 1px)',
              backgroundSize: '44px 44px',
              opacity: 0.022,
            }}
          />

          {/* Decorative ring */}
          <div
            aria-hidden="true"
            className="absolute -top-12 -right-12 w-48 h-48 rounded-full border border-gold/10 pointer-events-none"
          />

          <div className="relative p-8 md:p-12 flex flex-col lg:flex-row items-start gap-10">

            {/* ── Left: title + live stats ────────────────────────────────── */}
            <div className="flex-1 min-w-0">

              <div className="flex items-center gap-3 mb-5">
                <div className="h-px w-6 bg-gold/50" />
                <p className="text-[10px] font-semibold tracking-[0.2em] text-gold/70 uppercase">
                  Interactive Map
                </p>
              </div>

              <h2 className="font-serif text-3xl md:text-4xl text-white font-bold leading-tight mb-3">
                Explore Lebanon
              </h2>
              <p className="text-white/40 text-sm leading-relaxed max-w-xs mb-10">
                Browse curated properties across Lebanon's most desirable locations.
                Click a city pin to filter.
              </p>

              {/* Live city stats — swaps with AnimatePresence */}
              <AnimatePresence mode="wait">
                {city ? (
                  <motion.div
                    key={city}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.28 }}
                  >
                    <p className="text-[10px] font-semibold tracking-[0.2em] text-gold/55 uppercase mb-1">
                      Currently exploring
                    </p>
                    <p className="font-serif text-3xl text-gold font-bold mb-1.5">
                      {city}
                    </p>
                    <p className="text-white/45 text-sm mb-6">
                      {loading
                        ? 'Loading...'
                        : total > 0
                          ? `${total} propert${total === 1 ? 'y' : 'ies'} available`
                          : 'No properties currently available'
                      }
                    </p>
                    <button
                      onClick={() => onCitySelect('')}
                      className="text-xs text-white/30 hover:text-gold/70 transition-colors duration-200"
                    >
                      ← View all cities
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.28 }}
                  >
                    <p className="text-[10px] font-semibold tracking-[0.2em] text-white/25 uppercase mb-1">
                      All of Lebanon
                    </p>
                    <p className="font-serif text-3xl text-white font-bold mb-1.5">
                      {loading ? '—' : `${total.toLocaleString()} Properties`}
                    </p>
                    <p className="text-white/38 text-sm">
                      Select a city pin to explore
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* City pills — visible only on mobile (map pins handle desktop) */}
              <div className="mt-10 flex flex-wrap gap-2 lg:hidden">
                {CITY_PINS.map(m => (
                  <motion.button
                    key={m.name}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => onCitySelect(city === m.name ? '' : m.name)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-200 cursor-pointer ${
                      city === m.name
                        ? 'bg-gold text-white shadow-md shadow-gold/20'
                        : 'border border-white/15 text-white/50 hover:border-gold/40 hover:text-gold/80'
                    }`}
                  >
                    {m.name}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* ── Right: SVG map ───────────────────────────────────────────── */}
            <div className="w-full lg:w-auto flex justify-center lg:justify-end items-center lg:self-center">
              <svg
                viewBox="0 0 200 268"
                className="w-full max-w-[190px] sm:max-w-[230px] drop-shadow-xl"
                aria-label="Map of Lebanon with clickable city pins"
              >
                <defs>
                  <radialGradient id="mapSheen" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#1a5c3f" stopOpacity="0.65" />
                    <stop offset="100%" stopColor="#07201A" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Country fill */}
                <path
                  d={LEBANON_PATH}
                  fill="#0d3626"
                  stroke="#C9A24D"
                  strokeWidth="1.2"
                  strokeOpacity="0.38"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />

                {/* Sheen overlay */}
                <path d={LEBANON_PATH} fill="url(#mapSheen)" />

                {/* City pins */}
                {CITY_PINS.map(m => {
                  const active = city === m.name
                  return (
                    <g
                      key={m.name}
                      onClick={() => onCitySelect(active ? '' : m.name)}
                      style={{ cursor: 'pointer' }}
                      aria-label={m.name}
                      role="button"
                    >
                      {/* Expanded hit area */}
                      <circle cx={m.x} cy={m.y} r={10} fill="transparent" />

                      {/* Pulse ring (active only) */}
                      {active && (
                        <motion.circle
                          cx={m.x}
                          cy={m.y}
                          fill="none"
                          stroke="#C9A24D"
                          strokeWidth="1"
                          initial={{ r: 6, opacity: 0.7 }}
                          animate={{ r: 18, opacity: 0 }}
                          transition={{
                            duration: 1.8,
                            repeat: Infinity,
                            ease: 'easeOut',
                            repeatDelay: 0.3,
                          }}
                        />
                      )}

                      {/* Marker dot */}
                      <motion.circle
                        cx={m.x}
                        cy={m.y}
                        fill="#C9A24D"
                        stroke="white"
                        animate={{
                          r: active ? 5.5 : 3.5,
                          fillOpacity: active ? 1 : 0.58,
                          strokeWidth: active ? 1.5 : 0.8,
                          strokeOpacity: active ? 0.9 : 0.2,
                        }}
                        whileHover={{ r: 5, fillOpacity: 1 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                      />

                      {/* City label (active city only) */}
                      <AnimatePresence>
                        {active && (
                          <motion.text
                            key="lbl"
                            x={m.x + 8}
                            y={m.y + 4}
                            fontSize="7"
                            fill="#C9A24D"
                            fontFamily="Georgia, serif"
                            fontWeight="600"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {m.name}
                          </motion.text>
                        )}
                      </AnimatePresence>
                    </g>
                  )
                })}
              </svg>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  )
}
