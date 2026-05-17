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

const validate = (ruleFn) => (req, res, next) => {
  const error = ruleFn(req.body)
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
}

module.exports = { validate, rules }
