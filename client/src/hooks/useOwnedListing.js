import { useState, useEffect } from 'react'
import { listingsApi } from '../utils/api'

/**
 * Loads one listing the signed-in user owns, for the edit form.
 *
 * Deliberately hits /api/listings/my/:id rather than the public /:slug route —
 * the public route only returns approved listings, so a pending or rejected
 * property could never be reopened for editing.
 *
 * Pass a falsy id (the "new property" route) to skip fetching entirely.
 */
export default function useOwnedListing(id) {
  const [state, setState] = useState({
    listing: null,
    loading: Boolean(id),
    error: null,
  })

  useEffect(() => {
    if (!id) {
      setState({ listing: null, loading: false, error: null })
      return
    }

    const controller = new AbortController()
    setState({ listing: null, loading: true, error: null })

    listingsApi
      .myListing(id, { signal: controller.signal })
      .then((data) => setState({ listing: data.listing, loading: false, error: null }))
      .catch((err) => {
        if (err.name === 'AbortError') return
        setState({ listing: null, loading: false, error: err.message })
      })

    return () => controller.abort()
  }, [id])

  return state
}
