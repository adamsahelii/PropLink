const jwt = require('jsonwebtoken')

/**
 * Signs a short-lived access token tied to a user ID.
 * @param {string} userId - Mongoose ObjectId as string
 */
const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  })

/**
 * Verifies a token and returns the decoded payload.
 * Throws JsonWebTokenError or TokenExpiredError on failure —
 * both are caught and normalised by the global error handler.
 * @param {string} token
 */
const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET)

module.exports = { generateToken, verifyToken }
