import { useState, useEffect } from 'react'
import { CITY_PROFILES } from '../data/cityProfiles'

const CITIES = Object.keys(CITY_PROFILES)

// Activity thresholds relative to the city with the most listings
const HIGH_THRESHOLD   = 0.50  // > 50 % of max → High
const MEDIUM_THRESHOLD = 0.18  // > 18 % of max → Medium

function classifyActivity(count, max) {
  if (max === 0 || count === 0) return 'none'
  if (count / max > HIGH_THRESHOLD)   return 'high'
  if (count / max > MEDIUM_THRESHOLD) return 'medium'
  return 'low'
}

function topCityFromListings(listings) {
  if (!listings?.length) return null
  const tally = {}
  listings.forEach(l => {
    const c = l.location?.city
    if (c) tally[c] = (tally[c] || 0) + 1
  })
  return Object.entries(tally).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
}

export default function useMarketData() {
  const [state, setState] = useState({
    cityTotals:  {},
    activityMap: {},
    insights:    { mostActive: null, mostLand: null, mostRentals: null, newestCity: null },
    loading:     true,
  })

  useEffect(() => {
    const ctrl = new AbortController()
    const sig  = ctrl.signal

    // One lightweight request per city (returns only metadata — total — via limit=1)
    const cityRequests = CITIES.map(city =>
      fetch(`/api/listings?city=${encodeURIComponent(city)}&limit=1`, { signal: sig })
        .then(r => r.json())
        .then(d => [city, d.success ? (d.total ?? 0) : 0])
        .catch(() => [city, 0]),
    )

    // Insight-specific sample fetches
    const landRequest   = fetch('/api/listings?propertyType=land&limit=100',  { signal: sig }).then(r => r.json()).catch(() => ({ success: false }))
    const rentalRequest = fetch('/api/listings?purpose=rent&limit=100',        { signal: sig }).then(r => r.json()).catch(() => ({ success: false }))
    const newestRequest = fetch('/api/listings?sort=newest&limit=6',           { signal: sig }).then(r => r.json()).catch(() => ({ success: false }))

    Promise.all([...cityRequests, landRequest, rentalRequest, newestRequest])
      .then(results => {
        const n          = CITIES.length
        const cityPairs  = results.slice(0, n)     // [[city, total], ...]
        const landData   = results[n]
        const rentalData = results[n + 1]
        const newestData = results[n + 2]

        const cityTotals = Object.fromEntries(cityPairs)

        const max = Math.max(...Object.values(cityTotals), 0)
        const activityMap = {}
        for (const [city, count] of Object.entries(cityTotals)) {
          activityMap[city] = classifyActivity(count, max)
        }

        const sortedPairs = [...cityPairs].sort((a, b) => b[1] - a[1])
        const mostActive  = sortedPairs[0]?.[0] ?? null

        const mostLand    = topCityFromListings(landData.listings)
          ?? sortedPairs.find(([, c]) => c > 0)?.[0] ?? null
        const mostRentals = topCityFromListings(rentalData.listings) ?? null
        const newestCity  = newestData.success && newestData.listings?.length
          ? (newestData.listings[0]?.location?.city ?? null)
          : null

        setState({
          cityTotals,
          activityMap,
          insights: { mostActive, mostLand, mostRentals, newestCity },
          loading: false,
        })
      })
      .catch(err => {
        if (!sig.aborted) setState(s => ({ ...s, loading: false }))
      })

    return () => ctrl.abort()
  }, [])

  return state
}
