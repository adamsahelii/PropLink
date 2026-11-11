// Pure unit tests — no database, no HTTP. These exercise the validation
// and sanitisation logic that guards every write path in isolation.
const { rules } = require('../middleware/validate')
const { pickListingFields, sanitiseImages, sanitiseLocation } = require('../utils/listingFields')
const { generateToken, verifyToken } = require('../utils/jwt')
const AppError = require('../utils/AppError')

describe('validate.rules.register', () => {
  test('passes a valid payload', () => {
    expect(rules.register({ name: 'Ali', email: 'a@b.com', password: 'Password123' })).toBeNull()
  })
  test('requires a name', () => {
    expect(rules.register({ email: 'a@b.com', password: 'Password123' })).toMatch(/name/i)
  })
  test('rejects a bad email', () => {
    expect(rules.register({ name: 'Ali', email: 'bad', password: 'Password123' })).toMatch(/valid email/i)
  })
  test('rejects a short password', () => {
    expect(rules.register({ name: 'Ali', email: 'a@b.com', password: '123' })).toMatch(/8 characters/i)
  })
})

describe('validate.rules.createListing', () => {
  const valid = {
    title: 'Flat', description: 'Nice', propertyType: 'apartment',
    purpose: 'rent', price: 500, location: { city: 'Beirut' },
  }
  test('passes a valid listing', () => {
    expect(rules.createListing(valid)).toBeNull()
  })
  test('rejects an invalid property type', () => {
    expect(rules.createListing({ ...valid, propertyType: 'castle' })).toMatch(/apartment or land/i)
  })
  test('rejects a negative price', () => {
    expect(rules.createListing({ ...valid, price: -5 })).toMatch(/positive/i)
  })
  test('rejects a missing city', () => {
    expect(rules.createListing({ ...valid, location: {} })).toMatch(/city/i)
  })
})

describe('pickListingFields — mass-assignment guard', () => {
  test('drops non-whitelisted fields (ownerId, approvalStatus, isDeleted)', () => {
    const out = pickListingFields({
      title: 'X', ownerId: 'hacker', approvalStatus: 'approved', isDeleted: true,
    })
    expect(out.title).toBe('X')
    expect(out.ownerId).toBeUndefined()
    expect(out.approvalStatus).toBeUndefined()
    expect(out.isDeleted).toBeUndefined()
  })
  test('a non-admin cannot set status to the reserved "pending" value', () => {
    expect(pickListingFields({ status: 'pending' }, { isAdmin: false }).status).toBeUndefined()
  })
  test('land listings never keep bedroom/bathroom counts', () => {
    const out = pickListingFields({ propertyType: 'land', bedrooms: 3, bathrooms: 2 })
    expect(out.bedrooms).toBeNull()
    expect(out.bathrooms).toBeNull()
  })
})

describe('sanitiseImages / sanitiseLocation', () => {
  test('keeps only {url, publicId} pairs and caps at 10', () => {
    const imgs = Array.from({ length: 15 }, (_, i) => ({ url: `u${i}`, publicId: `p${i}` }))
    const out = sanitiseImages([...imgs, { url: 123 }, { nope: true }])
    expect(out).toHaveLength(10)
    expect(out[0]).toEqual({ url: 'u0', publicId: 'p0' })
  })
  test('rejects out-of-range coordinates', () => {
    const out = sanitiseLocation({ city: 'Beirut', coordinates: [999, 999] })
    expect(out.coordinates).toBeUndefined()
    expect(out.city).toBe('Beirut')
  })
  test('accepts valid [lng, lat] coordinates as GeoJSON', () => {
    const out = sanitiseLocation({ city: 'Beirut', coordinates: [35.5, 33.9] })
    expect(out.coordinates).toEqual({ type: 'Point', coordinates: [35.5, 33.9] })
  })
})

describe('JWT utils', () => {
  test('a signed token verifies back to the same id', () => {
    const token = generateToken('abc123')
    expect(verifyToken(token).id).toBe('abc123')
  })
  test('a tampered token throws', () => {
    expect(() => verifyToken('garbage.token.value')).toThrow()
  })
})

describe('AppError', () => {
  test('marks 4xx as operational "fail"', () => {
    const e = new AppError('nope', 404)
    expect(e.statusCode).toBe(404)
    expect(e.status).toBe('fail')
    expect(e.isOperational).toBe(true)
  })
})
