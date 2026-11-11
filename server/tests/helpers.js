const User = require('../models/User')
const Listing = require('../models/Listing')
const { generateToken } = require('../utils/jwt')

// Create a user directly in the DB (bypasses the HTTP layer) and return
// the document plus a ready-to-use Bearer token.
const makeUser = async (overrides = {}) => {
  const user = await User.create({
    name: overrides.name || 'Test User',
    email: overrides.email || `u${Date.now()}${Math.random().toString(36).slice(2, 7)}@test.com`,
    password: overrides.password || 'Password123',
    role: overrides.role || 'user',
    isActive: overrides.isActive !== undefined ? overrides.isActive : true,
  })
  return { user, token: generateToken(user._id) }
}

// Create a listing owned by `ownerId`, approved by default so it is publicly
// visible. Pass { approvalStatus: 'pending' } to keep it in the review queue.
const makeListing = async (ownerId, overrides = {}) => {
  return Listing.create({
    ownerId,
    title: overrides.title || 'Cozy Apartment in Beirut',
    description: overrides.description || 'A nice place to live, close to everything.',
    propertyType: overrides.propertyType || 'apartment',
    purpose: overrides.purpose || 'rent',
    price: overrides.price !== undefined ? overrides.price : 800,
    location: overrides.location || { city: 'Beirut' },
    approvalStatus: overrides.approvalStatus || 'approved',
    ...(overrides.extra || {}),
  })
}

const auth = (token) => ({ Authorization: `Bearer ${token}` })

module.exports = { makeUser, makeListing, auth }
