import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { IoLocateOutline, IoCloseOutline } from 'react-icons/io5'
import { CITY_COORDS, LEBANON_CENTER } from '../../data/cities'

// Same gold pin language as the public map, sized up for placement accuracy
const pinIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:18px;height:18px;background:#C9A24D;
    border:2.5px solid rgba(255,255,255,0.92);border-radius:50%;
    box-shadow:0 0 0 6px rgba(201,162,77,0.22),0 2px 10px rgba(0,0,0,0.45)
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

/** Drops or moves the pin wherever the map is clicked. */
function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick([e.latlng.lat, e.latlng.lng])
    },
  })
  return null
}

/** Recentres the map when the pin or selected city changes. */
function Recenter({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.setView(center, zoom ?? map.getZoom(), { animate: true })
  }, [center?.[0], center?.[1], zoom])
  return null
}

/**
 * Interactive map pin.
 *
 * `value` is [latitude, longitude] or null — Leaflet's order. The form converts
 * to GeoJSON [longitude, latitude] only at submit time, so there is exactly one
 * place where the flip happens.
 */
export default function LocationPicker({ value, city, onChange, error }) {
  // Fall back to the selected city, then to the country view
  const center = useMemo(() => {
    if (value) return value
    if (city && CITY_COORDS[city]) return CITY_COORDS[city]
    return LEBANON_CENTER
  }, [value, city])

  const zoom = value ? 14 : city && CITY_COORDS[city] ? 12 : 8

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5 gap-3">
        <label className="text-[10px] font-semibold tracking-[0.16em] text-charcoal/42 uppercase">
          Map location
        </label>

        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="inline-flex items-center gap-1 text-[11px] text-charcoal/45 hover:text-red-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
          >
            <IoCloseOutline className="w-3.5 h-3.5" aria-hidden="true" />
            Clear pin
          </button>
        )}
      </div>

      <p className="text-xs text-charcoal/45 mb-3 leading-relaxed">
        Click the map to place a pin, or drag it to fine-tune. Optional, but it helps
        buyers find the property.
      </p>

      <div
        className={`rounded-2xl overflow-hidden border ${
          error ? 'border-red-300' : 'border-black/10'
        }`}
        style={{ height: 320 }}
      >
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom={false}
          attributionControl={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={19}
          />

          <ClickHandler onPick={onChange} />
          <Recenter center={center} zoom={zoom} />

          {value && (
            <Marker
              position={value}
              icon={pinIcon}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const { lat, lng } = e.target.getLatLng()
                  onChange([lat, lng])
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      {/* Readable coordinate feedback + keyboard-accessible fallback */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        {value ? (
          <p className="text-xs text-charcoal/50 flex items-center gap-1.5">
            <IoLocateOutline className="w-3.5 h-3.5 text-gold" aria-hidden="true" />
            Pin at {value[0].toFixed(5)}, {value[1].toFixed(5)}
            <span className="text-charcoal/30">(latitude, longitude)</span>
          </p>
        ) : (
          <p className="text-xs text-charcoal/40">No pin placed.</p>
        )}

        {city && CITY_COORDS[city] && (
          <button
            type="button"
            onClick={() => onChange(CITY_COORDS[city])}
            className="text-xs text-gold hover:text-gold-dark font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
          >
            Use {city} centre
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-2 text-xs text-red-500">{error}</p>
      )}
    </div>
  )
}
