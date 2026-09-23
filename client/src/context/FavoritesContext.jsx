import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { favoritesApi } from '../utils/api'

const FavoritesContext = createContext(null)

export function FavoritesProvider({ children }) {
  const { user } = useAuth()
  const userId = user?._id
  const [ids, setIds] = useState(() => new Set())
  const [loaded, setLoaded] = useState(false)

  // Load favorite IDs whenever the logged-in user changes
  useEffect(() => {
    if (!userId) {
      setIds(new Set())
      setLoaded(false)
      return
    }
    const controller = new AbortController()
    favoritesApi
      .list({ page: 1, limit: 100, signal: controller.signal })
      .then((data) => {
        setIds(new Set(data.favorites.map((f) => f.listingId._id)))
        setLoaded(true)
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setLoaded(true)
      })
    return () => controller.abort()
  }, [userId])

  const isFavorite = useCallback((listingId) => ids.has(listingId), [ids])

  // Optimistic toggle: flip the heart immediately, roll back if the request fails
  const toggleFavorite = useCallback(
    async (listingId) => {
      const wasSaved = ids.has(listingId)

      setIds((prev) => {
        const next = new Set(prev)
        wasSaved ? next.delete(listingId) : next.add(listingId)
        return next
      })

      try {
        if (wasSaved) await favoritesApi.remove(listingId)
        else await favoritesApi.add(listingId)
      } catch (err) {
        // 409 = already saved, 404 on remove = already gone → the new state is correct anyway
        if (err.status === 409 || (wasSaved && err.status === 404)) return

        setIds((prev) => {
          const next = new Set(prev)
          wasSaved ? next.add(listingId) : next.delete(listingId)
          return next
        })
        throw err
      }
    },
    [ids]
  )

  return (
    <FavoritesContext.Provider value={{ isFavorite, toggleFavorite, loaded, count: ids.size }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used inside <FavoritesProvider>')
  return ctx
}