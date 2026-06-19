import { motion } from 'framer-motion'
import { CITY_PROFILES } from '../data/cityProfiles'

const EASE = [0.25, 0.46, 0.45, 0.94]

// Curated set that spans coast, mountain, city, and valley
const FEATURED_CITIES = [
  'Beirut', 'Jounieh', 'Jbeil', 'Batroun',
  'Tripoli', 'Zahle', 'Aley', 'Chouf', 'Keserwan',
]

const LIFESTYLE_LABELS = {
  city:      'City Living',
  coastal:   'Coastal',
  mountain:  'Mountain',
  family:    'Family',
  nightlife: 'Nightlife',
  quiet:     'Peaceful',
}

function getTopTags(cityName) {
  const profile = CITY_PROFILES[cityName]
  if (!profile) return []
  return Object.entries(profile.lifestyle)
    .filter(([, v]) => v >= 6)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k]) => LIFESTYLE_LABELS[k])
}

function CountLabel({ count, loading }) {
  if (loading) {
    return <span className="inline-block w-20 h-2.5 bg-gray-100 rounded-full animate-pulse" />
  }
  if (!count) return <span>Browse area</span>
  return <span>{count} {count === 1 ? 'property' : 'properties'} available</span>
}

export default function CityProfiles({ cityTotals = {}, loading, onCitySelect }) {
  return (
    <section className="bg-ivory px-4 pb-16">
      <div className="max-w-5xl mx-auto">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-6 bg-gold/45" />
            <p className="text-[10px] font-semibold tracking-[0.22em] text-gold/70 uppercase">
              Destinations
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl text-forest font-bold leading-tight">
                Lebanon's Premier Locations
              </h2>
              <p className="text-charcoal/42 text-sm mt-1">
                Curated area profiles for every lifestyle
              </p>
            </div>
          </div>
        </motion.div>

        {/* City cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURED_CITIES.map((cityName, i) => {
            const profile = CITY_PROFILES[cityName]
            if (!profile) return null
            const tags  = getTopTags(cityName)
            const count = cityTotals[cityName] ?? 0

            return (
              <motion.div
                key={cityName}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.055, duration: 0.42, ease: EASE }}
                whileHover={{ y: -3 }}
                onClick={() => onCitySelect(cityName)}
                className="group cursor-pointer bg-white rounded-2xl border border-black/[0.05] shadow-sm hover:shadow-lg hover:shadow-forest/8 hover:border-gold/28 transition-all duration-300 p-5 flex flex-col gap-3"
              >
                {/* Name + indicator */}
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg font-bold text-forest group-hover:text-gold transition-colors duration-200">
                    {cityName}
                  </h3>
                  <div className="w-2 h-2 rounded-full bg-gold/35 group-hover:bg-gold transition-colors duration-200 shrink-0" />
                </div>

                {/* Tagline */}
                <p className="text-sm text-charcoal/55 leading-snug line-clamp-2 flex-1">
                  {profile.tagline}
                </p>

                {/* Lifestyle tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map(tag => (
                      <span
                        key={tag}
                        className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-forest/7 text-forest/65 border border-forest/10"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Neutral count + CTA */}
                <div className="pt-3 border-t border-black/[0.05] flex items-center justify-between">
                  <span className="text-xs text-charcoal/38">
                    <CountLabel count={count} loading={loading} />
                  </span>
                  <span className="text-[10px] font-medium text-gold/50 group-hover:text-gold transition-colors duration-200">
                    Explore →
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
