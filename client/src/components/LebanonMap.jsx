import { useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const CITY_DATA = [
  { name: 'Beirut',     lat: 33.8938, lng: 35.5018 },
  { name: 'Jounieh',    lat: 33.9806, lng: 35.6178 },
  { name: 'Jbeil',      lat: 34.1236, lng: 35.6519 },
  { name: 'Tripoli',    lat: 34.4367, lng: 35.8497 },
  { name: 'Sidon',      lat: 33.5606, lng: 35.3714 },
  { name: 'Tyre',       lat: 33.2705, lng: 35.2038 },
  { name: 'Zahle',      lat: 33.8469, lng: 35.9017 },
  { name: 'Batroun',    lat: 34.2553, lng: 35.6586 },
  { name: 'Baalbek',    lat: 34.0042, lng: 36.2144 },
  { name: 'Hermel',     lat: 34.3894, lng: 36.3875 },
  { name: 'Nabatieh',   lat: 33.3772, lng: 35.4836 },
  { name: 'Aley',       lat: 33.8100, lng: 35.5994 },
  { name: 'Baabda',     lat: 33.8342, lng: 35.5486 },
  { name: 'Chouf',      lat: 33.6947, lng: 35.5606 },
  { name: 'Keserwan',   lat: 34.0167, lng: 35.6500 },
  { name: 'Metn',       lat: 33.9333, lng: 35.6000 },
  { name: 'Akkar',      lat: 34.5500, lng: 36.0000 },
  { name: 'Bcharre',    lat: 34.2511, lng: 36.0131 },
  { name: 'Marjayoun',  lat: 33.3622, lng: 35.5853 },
  { name: 'Jezzine',    lat: 33.5456, lng: 35.5783 },
  { name: 'Rachaya',    lat: 33.4986, lng: 35.8430 },
  { name: 'Hasbaya',    lat: 33.3986, lng: 35.6853 },
  { name: 'Zgharta',    lat: 34.3975, lng: 35.8936 },
]

const LEBANON_CENTER = [33.87, 35.83]
const LEBANON_ZOOM   = 8

// Base dot sizes scaled by activity level
const ACTIVITY_BASE = { high: 13, medium: 11, low: 9, none: 8 }
const ACTIVITY_FILL = {
  high:   'rgba(232,125,74,0.82)',   // warm orange-gold for hot markets
  medium: 'rgba(201,162,77,0.60)',
  low:    'rgba(201,162,77,0.35)',
  none:   'rgba(201,162,77,0.22)',
}
const ACTIVITY_BORDER = { high: 0.55, medium: 0.38, low: 0.22, none: 0.14 }

function makeIcon(isSelected, activityLevel = 'none') {
  const al     = activityLevel in ACTIVITY_BASE ? activityLevel : 'none'
  const size   = isSelected ? 18 : ACTIVITY_BASE[al]
  const bg     = isSelected ? '#C9A24D' : ACTIVITY_FILL[al]
  const border = isSelected
    ? '2px solid rgba(255,255,255,0.9)'
    : `1.5px solid rgba(255,255,255,${ACTIVITY_BORDER[al]})`
  const shadow = isSelected
    ? '0 0 0 5px rgba(201,162,77,0.22), 0 2px 10px rgba(0,0,0,0.55)'
    : al === 'high'
      ? '0 1px 6px rgba(232,125,74,0.35)'
      : '0 1px 4px rgba(0,0,0,0.38)'

  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${bg};
      border:${border};
      border-radius:50%;
      box-shadow:${shadow};
      cursor:pointer;
    "></div>`,
    iconSize:      [size, size],
    iconAnchor:    [size / 2, size / 2],
    tooltipAnchor: [size / 2 + 3, 0],
  })
}

const BTN_BASE = 'rgba(5, 20, 15, 0.84)'
const BTN_HOVER = 'rgba(201, 162, 77, 0.15)'

function ZoomBtn({ onClick, label, children }) {
  return (
    <motion.button
      initial={{ backgroundColor: BTN_BASE }}
      whileHover={{ backgroundColor: BTN_HOVER }}
      whileTap={{ scale: 0.91 }}
      transition={{ duration: 0.14 }}
      onClick={onClick}
      aria-label={label}
      style={{
        width: 36,
        height: 36,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        color: '#C9A24D',
        fontSize: 22,
        fontWeight: 300,
        lineHeight: 1,
        cursor: 'pointer',
        outline: 'none',
        userSelect: 'none',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {children}
    </motion.button>
  )
}

function ZoomControls() {
  const map = useMap()

  return createPortal(
    <div
      style={{
        position: 'absolute',
        bottom: 52,
        right: 16,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 10,
        border: '1px solid rgba(201, 162, 77, 0.22)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      <ZoomBtn onClick={() => map.zoomIn()} label="Zoom in">+</ZoomBtn>
      <div style={{ height: 1, backgroundColor: 'rgba(201, 162, 77, 0.16)' }} />
      <ZoomBtn onClick={() => map.zoomOut()} label="Zoom out">−</ZoomBtn>
    </div>,
    map.getContainer(),
  )
}

export default function LebanonMap({ city, onCitySelect, total, loading, activityMap = {} }) {
  const icons = useMemo(
    () => Object.fromEntries(
      CITY_DATA.map(c => [c.name, makeIcon(city === c.name, activityMap[c.name])])
    ),
    [city, activityMap],
  )

  return (
    <section className="bg-ivory px-4 py-10">
      <div className="max-w-5xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative rounded-[32px] overflow-hidden shadow-2xl"
          style={{ height: 'clamp(300px, 50vw, 460px)' }}
        >
          {/* Real Leaflet map — full bleed */}
          <MapContainer
            center={LEBANON_CENTER}
            zoom={LEBANON_ZOOM}
            scrollWheelZoom={false}
            zoomControl={false}
            attributionControl={false}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              subdomains="abcd"
              maxZoom={19}
            />

            <ZoomControls />

            {CITY_DATA.map(c => (
              <Marker
                key={c.name}
                position={[c.lat, c.lng]}
                icon={icons[c.name]}
                eventHandlers={{ click: () => onCitySelect(city === c.name ? '' : c.name) }}
              >
                <Tooltip className="pl-map-tip" direction="top" offset={[0, -4]} opacity={1}>
                  {c.name}
                </Tooltip>
              </Marker>
            ))}
          </MapContainer>

          {/* Info overlay — left side */}
          <div
            className="absolute inset-y-0 left-0 flex items-center p-4 sm:p-6 pointer-events-none"
            style={{ zIndex: 1000 }}
          >
            <div
              className="pointer-events-auto rounded-2xl p-5 sm:p-6 w-[190px] sm:w-[220px]"
              style={{
                background: 'rgba(5, 20, 15, 0.86)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(201,162,77,0.18)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}
            >
              {/* Label */}
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px w-4 bg-gold/50" />
                <p className="text-[9px] font-semibold tracking-[0.2em] text-gold/65 uppercase">
                  Interactive Map
                </p>
              </div>

              <h2 className="font-serif text-xl sm:text-2xl text-white font-bold leading-tight mb-1">
                Explore Lebanon
              </h2>
              <p className="text-white/35 text-[11px] leading-relaxed mb-5">
                Click a city marker to filter listings.
              </p>

              {/* Live city stats */}
              <AnimatePresence mode="wait">
                {city ? (
                  <motion.div
                    key={city}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.22 }}
                  >
                    <p className="text-[9px] font-semibold tracking-[0.18em] text-gold/50 uppercase mb-0.5">
                      Viewing
                    </p>
                    <p className="font-serif text-xl sm:text-2xl text-gold font-bold mb-1 leading-none">
                      {city}
                    </p>
                    <p className="text-white/40 text-[11px] mb-4">
                      {loading
                        ? 'Loading…'
                        : total > 0
                          ? `${total} propert${total === 1 ? 'y' : 'ies'} available`
                          : 'No properties available'
                      }
                    </p>
                    <button
                      onClick={() => onCitySelect('')}
                      className="text-[11px] text-white/25 hover:text-gold/65 transition-colors duration-200 cursor-pointer"
                    >
                      ← View all cities
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="all"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.22 }}
                  >
                    <p className="text-[9px] font-semibold tracking-[0.18em] text-white/22 uppercase mb-0.5">
                      All of Lebanon
                    </p>
                    <p className="font-serif text-xl sm:text-2xl text-white font-bold mb-1 leading-none">
                      {loading ? '—' : total.toLocaleString()}
                    </p>
                    <p className="text-white/35 text-[11px]">
                      {loading ? '' : `propert${total === 1 ? 'y' : 'ies'} available`}
                    </p>
                    <p className="text-white/18 text-[11px] mt-3">Select a city to explore</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Attribution */}
          <div
            className="absolute bottom-1.5 right-2 text-[9px] text-white/18 select-none"
            style={{ zIndex: 1000 }}
          >
            © OpenStreetMap · CARTO
          </div>
        </motion.div>

        {/* Mobile city pills — shown below the map on small screens */}
        <div className="mt-4 flex flex-wrap gap-2 md:hidden">
          {CITY_DATA.map(c => (
            <motion.button
              key={c.name}
              whileTap={{ scale: 0.93 }}
              onClick={() => onCitySelect(city === c.name ? '' : c.name)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-200 cursor-pointer ${
                city === c.name
                  ? 'bg-gold text-white shadow-md shadow-gold/20'
                  : 'bg-white border border-forest/18 text-forest/55 hover:border-gold/40 hover:text-gold/80'
              }`}
            >
              {c.name}
            </motion.button>
          ))}
        </div>

      </div>
    </section>
  )
}
