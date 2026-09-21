import { useState, useEffect, useCallback } from 'react'
import { listingsApi } from '../utils/api'

/**
 * Loads the signed-in owner's listings (pending, approved, and rejected).
 * Returns `refetch` so the dashboard can refresh after a delete without
 * a full page reload.
 */
export default function useMyListings({ page = 1, limit = 9 } = {}) {
  const [state, setState] = useState({
    listings: [],
    total: 0,
    pages: 1,
    loading: true,
    error: null,
  })
  const [reloadKey, setReloadKey] = useState(0)

  const refetch = useCallback(() => setReloadKey((k) => k + 1), [])

  useEffect(() => {
    const controller = new AbortController()
    setState((s) => ({ ...s, loading: true, error: null }))

    listingsApi
      .myListings({ page, limit, signal: controller.signal })
      .then((data) =>
        setState({
          listings: data.listings,
          total: data.total,
          pages: data.pages,
          loading: false,
          error: null,
        })
      )
      .catch((err) => {
        if (err.name === 'AbortError') return
        setState((s) => ({ ...s, loading: false, error: err.message }))
      })

    return () => controller.abort()
  }, [page, limit, reloadKey])

  return { ...state, refetch }
}
