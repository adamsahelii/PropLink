import { TOKEN_KEY } from '../context/AuthContext'

/**
 * Thin fetch wrapper for the PropLink API.
 *
 * - Attaches the saved bearer token to protected calls
 * - Normalises every failure into an Error carrying `status` and the API's
 *   own message, so callers can show something useful instead of "Failed to fetch"
 */

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const authHeader = () => {
  const token = localStorage.getItem(TOKEN_KEY)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(path, { method = 'GET', body, signal, auth = true } = {}) {
  let res
  try {
    res = await fetch(`/api${path}`, {
      method,
      signal,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(auth ? authHeader() : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    })
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new ApiError('Network error. Please check your connection and try again.', 0)
  }

  // A non-JSON body (proxy error page, gateway timeout) must not crash the caller
  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }

  if (!res.ok || data?.success === false) {
    throw new ApiError(
      data?.message || `Request failed (${res.status}). Please try again.`,
      res.status
    )
  }

  return data
}

// ── Owner listing endpoints ───────────────────────────────────────────────────

export const listingsApi = {
  /** GET /api/listings/my — the signed-in owner's listings, any approval status */
  myListings: ({ page = 1, limit = 9, signal } = {}) =>
    request(`/listings/my?page=${page}&limit=${limit}`, { signal }),

  /** GET /api/listings/my/:id — one owned listing, pending or rejected included */
  myListing: (id, { signal } = {}) => request(`/listings/my/${id}`, { signal }),

  create: (payload) => request('/listings', { method: 'POST', body: payload }),

  update: (id, payload) => request(`/listings/${id}`, { method: 'PUT', body: payload }),

  /** Soft delete — the server keeps the document and only hides it */
  remove: (id) => request(`/listings/${id}`, { method: 'DELETE' }),
}

// ── Favorites ─────────────────────────────────────────────────────────────────

export const favoritesApi = {
  /** GET /api/favorites/my — the signed-in user's saved listings */
  list: ({ page = 1, limit = 12, signal } = {}) =>
    request(`/favorites/my?page=${page}&limit=${limit}`, { signal }),

  /** POST /api/favorites — listingId goes in the body */
  add: (listingId) => request('/favorites', { method: 'POST', body: { listingId } }),

  /** DELETE /api/favorites/:listingId */
  remove: (listingId) => request(`/favorites/${listingId}`, { method: 'DELETE' }),
}

// ── Owner analytics ───────────────────────────────────────────────────────────

export const analyticsApi = {
  /** GET /api/analytics/owner — totals + per-listing views/inquiries/favorites */
  owner: ({ signal } = {}) => request('/analytics/owner', { signal }),
}

// ── Image uploads ─────────────────────────────────────────────────────────────
// Multipart, so it bypasses `request` (the browser must set its own boundary).

export async function uploadListingImages(files) {
  const form = new FormData()
  Array.from(files).forEach((file) => form.append('images', file))

  let res
  try {
    res = await fetch('/api/uploads/listing-images', {
      method: 'POST',
      headers: authHeader(), // no Content-Type — fetch adds the multipart boundary
      body: form,
    })
  } catch {
    throw new ApiError('Network error while uploading. Please try again.', 0)
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }

  if (!res.ok || data?.success === false) {
    throw new ApiError(data?.message || 'Upload failed. Please try again.', res.status)
  }

  return data.images
}

export default request
