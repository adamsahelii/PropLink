import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'

export default function useOwnerInquiries(status = '') {
  const { token } = useAuth()
  const [state, setState] = useState({ inquiries: [], total: 0, loading: true, error: null })
  const [reloadKey, setReloadKey] = useState(0)

  const refresh = useCallback(() => setReloadKey(k => k + 1), [])

  useEffect(() => {
    if (!token) return
    const ctrl = new AbortController()
    setState(s => ({ ...s, loading: true, error: null }))

    const qs = status ? `?status=${status}&limit=50` : '?limit=50'

    fetch(`/api/inquiries/owner${qs}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: ctrl.signal,
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) setState({ inquiries: d.inquiries, total: d.total, loading: false, error: null })
        else setState({ inquiries: [], total: 0, loading: false, error: d.message || 'Could not load inbox.' })
      })
      .catch(err => {
        if (err.name !== 'AbortError')
          setState({ inquiries: [], total: 0, loading: false, error: 'Could not load inbox.' })
      })

    return () => ctrl.abort()
  }, [token, status, reloadKey])

  // PATCH /api/inquiries/:id/status — returns true on success
  const updateStatus = useCallback(async (id, newStatus) => {
    try {
      const res = await fetch(`/api/inquiries/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (!data.success) return false
      refresh()
      return true
    } catch {
      return false
    }
  }, [token, refresh])

  return { ...state, refresh, updateStatus }
}