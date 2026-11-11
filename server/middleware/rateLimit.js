const rateLimit = require('express-rate-limit')

// Clean JSON 429 that matches the rest of the API's error shape.
const handler = (req, res) =>
  res.status(429).json({ success: false, message: 'Too many requests. Please try again later.' })

// Sensitive authentication actions (login, password reset). A tight limit
// slows down brute-force and credential-stuffing attempts from one address.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: Number(process.env.AUTH_RATE_MAX) || 20,
  standardHeaders: true, // sends RateLimit-* headers
  legacyHeaders: false,
  handler,
})

// AI search. Every call reaches an external, metered service, so the rate is
// capped to protect both the budget and the endpoint from abuse.
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: Number(process.env.AI_RATE_MAX) || 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
})

module.exports = { authLimiter, aiLimiter }
