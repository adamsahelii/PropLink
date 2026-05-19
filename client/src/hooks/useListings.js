import { useState, useEffect } from 'react'

const PRICE_MAP = {
  'Under $100K':   { maxPrice: 100000 },
  '$100K – $300K': { minPrice: 100000, maxPrice: 300000 },
  '$300K – $700K': { minPrice: 300000, maxPrice: 700000 },
  '$700K+':        { minPrice: 700000 },
}

export default function useListings({ keyword, city, propertyType, purpose, price, sort, page }) {
  const [state, setState] = useState({
    listings: [],
    total:    0,
    pages:    1,
    loading:  true,
    error:    null,
  })

  useEffect(() => {
    const controller = new AbortController()
    setState(s => ({ ...s, loading: true, error: null }))

    const q = new URLSearchParams()
    if (keyword)      q.set('keyword',      keyword.trim())
    if (city)         q.set('city',         city)
    if (propertyType) q.set('propertyType', propertyType)
    if (purpose)      q.set('purpose',      purpose)
    if (sort)         q.set('sort',         sort)
    q.set('page',  String(page || 1))
    q.set('limit', '12')

    const range = PRICE_MAP[price]
    if (range) {
      if (range.minPrice) q.set('minPrice', String(range.minPrice))
      if (range.maxPrice) q.set('maxPrice', String(range.maxPrice))
    }

    fetch(`/api/listings?${q}`, { signal: controller.signal })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setState({ listings: data.listings, total: data.total, pages: data.pages, loading: false, error: null })
        } else {
          setState(s => ({ ...s, loading: false, error: 'Could not load listings.' }))
        }
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setState(s => ({ ...s, loading: false, error: 'Could not load listings.' }))
        }
      })

    return () => controller.abort()
  }, [keyword, city, propertyType, purpose, price, sort, page])

  return state
}
