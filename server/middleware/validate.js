const AppError = require('../utils/AppError')

const EMAIL_RE = /^\S+@\S+\.\S+$/

/**
 * Lightweight field-presence and format validator.
 * Pass an array of rules; the first failure short-circuits with a 400.
 *
 * Usage (in a route file):
 *   const { validate, rules } = require('../middleware/validate')
 *   router.post('/register', validate(rules.register), register)
 */

const validate = (ruleFn) => (req, _res, next) => {
  // Guard against missing body — happens when Content-Type header is absent
  // and Express cannot parse the request, leaving req.body as undefined.
  const error = ruleFn(req.body || {})
  if (error) return next(new AppError(error, 400))
  next()
}

const rules = {
  register: ({ name, email, password }) => {
    if (!name || !name.trim()) return 'Name is required.'
    if (!email || !email.trim()) return 'Email is required.'
    if (!EMAIL_RE.test(email)) return 'Please provide a valid email address.'
    if (!password) return 'Password is required.'
    if (password.length < 8) return 'Password must be at least 8 characters.'
    return null
  },

  login: ({ email, password }) => {
    if (!email || !email.trim()) return 'Email is required.'
    if (!password) return 'Password is required.'
    return null
  },

  // Mirrors the required fields and enums in models/Listing.js. Catching these
  // here returns a clean 400 instead of letting a Mongoose ValidationError
  // surface, and keeps the message identical in development and production.
  createListing: ({ title, description, propertyType, purpose, price, location }) => {
    if (!title || !title.trim()) return 'Title is required.'
    if (title.trim().length > 200) return 'Title cannot exceed 200 characters.'
    if (!description || !description.trim()) return 'Description is required.'
    if (description.trim().length > 5000) return 'Description cannot exceed 5000 characters.'

    if (!['apartment', 'land'].includes(propertyType)) return 'Property type must be apartment or land.'
    if (!['rent', 'sale'].includes(purpose)) return 'Purpose must be rent or sale.'

    if (price === undefined || price === null || price === '') return 'Price is required.'
    const numericPrice = Number(price)
    if (!Number.isFinite(numericPrice)) return 'Price must be a number.'
    if (numericPrice < 0) return 'Price must be a positive number.'

    if (!location || !location.city || !String(location.city).trim()) return 'City is required.'

    return null
  },
}

module.exports = { validate, rules }
