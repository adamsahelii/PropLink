import { useState, useEffect } from 'react'
import { CITY_PROFILES } from '../data/cityProfiles'

const CITIES = Object.keys(CITY_PROFILES)

/**
 * Fetches the listing count for every Lebanese city in a single request.
 * Returns raw counts only — no activity classification, no ranking.
 */
export default function useMarketData() {
  const [state, setState] = useState({ cityTotals: {}, loading: true })

  useEffect(() => {
    const ctrl = new AbortController()
    const sig  = ctrl.signal

    // One request for all cities (server groups counts by lowercase city name)
    fetch('/api/listings/stats/cities', { signal: sig })
      .then(r => r.json())
      .then(d => {
        const counts = d.success ? d.counts : {}
        const cityTotals = Object.fromEntries(
          CITIES.map(city => [city, counts[city.toLowerCase()] ?? 0]),
        )
        setState({ cityTotals, loading: false })
      })
      .catch(() => { if (!sig.aborted) setState(s => ({ ...s, loading: false })) })

    return () => ctrl.abort()
  }, [])

  return state
}
