// ── Listing input allowlist ───────────────────────────────────────────────────
// Everything a form may set is listed explicitly. Anything not named here —
// ownerId, approvalStatus, rejectionReason, isDeleted, deletedAt, slug,
// timestamps — is unreachable through create/update, so a crafted request
// body cannot self-approve a listing or steal one from another owner.
//
// Pure functions only, so they can be reasoned about (and tested) on their own.

const EDITABLE_FIELDS = [
  'title', 'description', 'propertyType', 'purpose',
  'price', 'location', 'size', 'bedrooms', 'bathrooms',
  'images', 'status',
]

const ALL_STATUSES = ['available', 'pending', 'rented', 'sold']

// Owners may mark a listing sold/rented, but 'pending' is the review queue's
// own value and must not be settable from a form.
const OWNER_SETTABLE_STATUSES = ['available', 'rented', 'sold']

const MAX_IMAGES = 10

/** Number or undefined — keeps empty strings out of numeric paths. */
const toNumber = (value) => {
  if (value === undefined || value === null || value === '') return undefined
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

/**
 * Rebuilds location from scratch so only the known sub-fields survive, and
 * coordinates are stored as valid GeoJSON: [longitude, latitude].
 */
const sanitiseLocation = (location) => {
  if (!location || typeof location !== 'object') return undefined

  const clean = {
    city: typeof location.city === 'string' ? location.city.trim() : undefined,
    area: typeof location.area === 'string' ? location.area.trim() : '',
    address: typeof location.address === 'string' ? location.address.trim() : '',
  }

  // Accept either { coordinates: { coordinates: [lng, lat] } } (GeoJSON, as the
  // model stores it) or a bare [lng, lat] pair.
  const raw = Array.isArray(location.coordinates)
    ? location.coordinates
    : location.coordinates?.coordinates

  if (Array.isArray(raw) && raw.length === 2) {
    const lng = toNumber(raw[0])
    const lat = toNumber(raw[1])
    const valid =
      lng !== undefined && lat !== undefined &&
      lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90

    if (valid) clean.coordinates = { type: 'Point', coordinates: [lng, lat] }
  }

  return clean
}

/** Keeps only { url, publicId } string pairs, capped at MAX_IMAGES. */
const sanitiseImages = (images) => {
  if (!Array.isArray(images)) return undefined
  return images
    .filter((img) => img && typeof img.url === 'string' && typeof img.publicId === 'string')
    .slice(0, MAX_IMAGES)
    .map(({ url, publicId }) => ({ url: url.trim(), publicId: publicId.trim() }))
}

/**
 * Projects a request body down to the editable allowlist, coercing types.
 * Only keys actually present in the body are returned, so PUT stays partial.
 *
 * @param {object} body      - req.body
 * @param {object} [options] - { isAdmin } widens the settable status values
 */
const pickListingFields = (body = {}, { isAdmin = false } = {}) => {
  const out = {}

  for (const key of EDITABLE_FIELDS) {
    if (!(key in body)) continue

    switch (key) {
      case 'price':
      case 'size':
        out[key] = toNumber(body[key])
        break

      case 'bedrooms':
      case 'bathrooms': {
        const n = toNumber(body[key])
        out[key] = n === undefined ? null : n
        break
      }

      case 'location': {
        const loc = sanitiseLocation(body.location)
        if (loc) out.location = loc
        break
      }

      case 'images': {
        const imgs = sanitiseImages(body.images)
        if (imgs) out.images = imgs
        break
      }

      case 'status': {
        const allowed = isAdmin ? ALL_STATUSES : OWNER_SETTABLE_STATUSES
        if (allowed.includes(body.status)) out.status = body.status
        break
      }

      default:
        out[key] = typeof body[key] === 'string' ? body[key].trim() : body[key]
    }
  }

  // Land has no rooms — never persist stale residential figures.
  if (out.propertyType === 'land') {
    out.bedrooms = null
    out.bathrooms = null
  }

  return out
}

module.exports = {
  pickListingFields,
  sanitiseLocation,
  sanitiseImages,
  EDITABLE_FIELDS,
  MAX_IMAGES,
}
