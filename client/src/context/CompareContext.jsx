import { createContext, useContext, useEffect, useState } from 'react'

const CompareContext = createContext(null)

const STORAGE_KEY = 'proplink_compare'
export const MAX_COMPARE = 4

function loadInitial() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(saved) ? saved.slice(0, MAX_COMPARE) : []
  } catch {
    return []
  }
}

export function CompareProvider({ children }) {
  const [compareIds, setCompareIds] = useState(loadInitial)

  // Save to localStorage whenever the list changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compareIds))
    } catch { /* ignore storage errors */ }
  }, [compareIds])

  function isInCompare(id) {
    return compareIds.includes(id)
  }

  // Returns false if the list is already full
  function addToCompare(id) {
    if (compareIds.includes(id)) return true
    if (compareIds.length >= MAX_COMPARE) return false
    setCompareIds(prev => [...prev, id])
    return true
  }

  function removeFromCompare(id) {
    setCompareIds(prev => prev.filter(x => x !== id))
  }

  function clearCompare() {
    setCompareIds([])
  }

  return (
    <CompareContext.Provider
      value={{ compareIds, isInCompare, addToCompare, removeFromCompare, clearCompare }}
    >
      {children}
    </CompareContext.Provider>
  )
}

export function useCompare() {
  const ctx = useContext(CompareContext)
  if (!ctx) throw new Error('useCompare must be used inside CompareProvider')
  return ctx
}