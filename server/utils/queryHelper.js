// ── Listing query builder ─────────────────────────────────────────────────────

const VALID_PROPERTY_TYPES = ['apartment', 'land']
const VALID_PURPOSES = ['rent', 'sale']
const VALID_STATUSES = ['available', 'pending', 'rented', 'sold']

// Only accept plain strings (?x=a&x=b arrives as an array)
const str = (v) => (typeof v === 'string' ? v.trim() : '')

// Escape regex special characters so user input is matched literally
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Parse a non-negative number, or return undefined
const num = (v) => {
  const n = Number(str(v))
  return str(v) !== '' && Number.isFinite(n) && n >= 0 ? n : undefined
}

const buildListingFilter = (queryParams = {}, baseFilter = {}) => {
  const filter = { ...baseFilter }

  const keyword      = str(queryParams.keyword).slice(0, 100)
  const city         = str(queryParams.city)
  const propertyType = str(queryParams.propertyType)
  const purpose      = str(queryParams.purpose)
  const status       = str(queryParams.status)
  const minPrice     = num(queryParams.minPrice)
  const maxPrice     = num(queryParams.maxPrice)

  // City — exact name, case-insensitive
  if (city) {
    filter['location.city'] = { $regex: `^${escapeRegex(city)}$`, $options: 'i' }
  }

  if (VALID_PROPERTY_TYPES.includes(propertyType)) filter.propertyType = propertyType
  if (VALID_PURPOSES.includes(purpose))            filter.purpose = purpose
  if (VALID_STATUSES.includes(status))             filter.status = status

  // Price range
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {}
    if (minPrice !== undefined) filter.price.$gte = minPrice
    if (maxPrice !== undefined) filter.price.$lte = maxPrice
  }

  // Keyword — literal, case-insensitive, across text + location fields
  if (keyword) {
    const re = { $regex: escapeRegex(keyword), $options: 'i' }
    filter.$or = [
      { title: re },
      { description: re },
      { 'location.city': re },
      { 'location.area': re },
      { 'location.address': re },
    ]
  }

  return filter
}

// _id tiebreaker keeps order stable across pages when values are equal
const buildSortOption = (sort) => {
  const map = {
    newest:       { createdAt: -1, _id: -1 },
    oldest:       { createdAt: 1,  _id: 1 },
    'price-asc':  { price: 1,  _id: 1 },
    'price-desc': { price: -1, _id: -1 },
  }
  return map[str(sort)] || map.newest
}

const getPagination = (pageParam = '1', limitParam = '12') => {
  const page  = Math.max(1, parseInt(pageParam)  || 1)
  const limit = Math.min(50, Math.max(1, parseInt(limitParam) || 12))
  const skip  = (page - 1) * limit
  return { page, limit, skip }
}

module.exports = { buildListingFilter, buildSortOption, getPagination }