// ── Listing query builder ─────────────────────────────────────────────────────
// All functions are pure — they take params and return plain objects.
// Controllers pass a baseFilter so the same helpers work for public,
// owner, and admin queries without duplicating logic.

const VALID_PROPERTY_TYPES = ['apartment', 'land']
const VALID_PURPOSES = ['rent', 'sale']
const VALID_STATUSES = ['available', 'pending', 'rented', 'sold']

/**
 * Merges query-string params into a MongoDB filter object.
 * @param {object} queryParams  - req.query
 * @param {object} baseFilter   - required conditions (e.g. { isDeleted: false, approvalStatus: 'approved' })
 */
const buildListingFilter = (queryParams = {}, baseFilter = {}) => {
  const filter = { ...baseFilter }
  const { keyword, city, propertyType, purpose, status, minPrice, maxPrice } = queryParams

  // Location — case-insensitive partial match
  if (city) filter['location.city'] = { $regex: city.trim(), $options: 'i' }

  // Enum filters — only apply when value is a known enum member (prevents injection)
  if (propertyType && VALID_PROPERTY_TYPES.includes(propertyType)) {
    filter.propertyType = propertyType
  }
  if (purpose && VALID_PURPOSES.includes(purpose)) {
    filter.purpose = purpose
  }
  if (status && VALID_STATUSES.includes(status)) {
    filter.status = status
  }

  // Price range
  if (minPrice || maxPrice) {
    filter.price = {}
    if (minPrice) filter.price.$gte = Number(minPrice)
    if (maxPrice) filter.price.$lte = Number(maxPrice)
  }

  // Full-text keyword search across title, description, and location fields
  if (keyword) {
    const re = { $regex: keyword.trim(), $options: 'i' }
    filter.$or = [
      { title: re },
      { description: re },
      { 'location.city': re },
      { 'location.area': re },
    ]
  }

  return filter
}

/**
 * Converts a sort query param string into a MongoDB sort object.
 * Defaults to newest-first when the value is absent or unrecognised.
 */
const buildSortOption = (sort) => {
  const map = {
    newest:     { createdAt: -1 },
    oldest:     { createdAt: 1 },
    'price-asc':  { price: 1 },
    'price-desc': { price: -1 },
  }
  return map[sort] || { createdAt: -1 }
}

/**
 * Returns safe, bounded pagination values.
 * Page is 1-indexed. Limit is capped at 50 to protect DB load.
 */
const getPagination = (pageParam = '1', limitParam = '12') => {
  const page  = Math.max(1, parseInt(pageParam)  || 1)
  const limit = Math.min(50, Math.max(1, parseInt(limitParam) || 12))
  const skip  = (page - 1) * limit
  return { page, limit, skip }
}

module.exports = { buildListingFilter, buildSortOption, getPagination }
