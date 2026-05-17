const User = require('../models/User')
const { verifyToken } = require('../utils/jwt')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')

/**
 * protect
 * Extracts the Bearer token from the Authorization header, verifies it,
 * and attaches the full user document to req.user.
 * Must run before any route that needs an authenticated user.
 */
const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Not authenticated. Please log in.', 401))
  }

  const token = authHeader.split(' ')[1]

  // verifyToken throws JsonWebTokenError / TokenExpiredError —
  // both are caught by asyncHandler and handled by the global error handler
  const decoded = verifyToken(token)

  const user = await User.findById(decoded.id)
  if (!user) {
    return next(
      new AppError('The account belonging to this token no longer exists.', 401)
    )
  }

  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated.', 403))
  }

  req.user = user
  next()
})

/**
 * authorize(...roles)
 * Role-based access control. Always chain AFTER protect so req.user exists.
 *
 * Usage:
 *   router.delete('/listings/:id', protect, authorize('owner', 'admin'), handler)
 *
 * @param {...string} roles - allowed roles
 */
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(
      new AppError(
        `Role '${req.user.role}' is not permitted to perform this action.`,
        403
      )
    )
  }
  next()
}

module.exports = { protect, authorize }
