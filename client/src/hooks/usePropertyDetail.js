import { useState, useEffect } from 'react'

export default function usePropertyDetail(slug) {
  const [state, setState] = useState({ listing: null, loading: true, error: null })

  useEffect(() => {
    if (!slug) return
    const ctrl = new AbortController()
    setState({ listing: null, loading: true, error: null })

    fetch(`/api/listings/${slug}`, { signal: ctrl.signal })
      .then(r => r.json())
      .then(d => {
        if (d.success) setState({ listing: d.listing, loading: false, error: null })
        else setState({ listing: null, loading: false, error: 'Property not found.' })
      })
      .catch(err => {
        if (err.name !== 'AbortError')
          setState({ listing: null, loading: false, error: 'Could not load property.' })
      })

    return () => ctrl.abort()
  }, [slug])

  return state
}
