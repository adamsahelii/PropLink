import { useState, useEffect } from 'react'
import { CITY_PROFILES } from '../data/cityProfiles'

const CITIES = Object.keys(CITY_PROFILES)

/**
 * Fetches the total listing count for every Lebanese city in parallel.
 * Returns raw counts only — no activity classification, no ranking.
 */
export default function useMarketData() {
  const [state, setState] = useState({ cityTotals: {}, loading: true })

  useEffect(() => {
    const ctrl = new AbortController()
    const sig  = ctrl.signal

    const requests = CITIES.map(city =>
      fetch(`/api/listings?city=${encodeURIComponent(city)}&limit=1`, { signal: sig })
        .then(r => r.json())
        .then(d => [city, d.success ? (d.total ?? 0) : 0])
        .catch(() => [city, 0]),
    )

    Promise.all(requests)
      .then(pairs => setState({ cityTotals: Object.fromEntries(pairs), loading: false }))
      .catch(err => { if (!sig.aborted) setState(s => ({ ...s, loading: false })) })

    return () => ctrl.abort()
  }, [])

  return state
}
