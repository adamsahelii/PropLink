const AppError = require('../utils/AppError')

// ── Mongoose / MongoDB error normalisers ─────────────────────────────────────

const handleCastError = (err) =>
  new AppError(`Invalid value for field '${err.path}': ${err.value}`, 400)

const handleDuplicateKey = (err) => {
  const field = Object.keys(err.keyValue)[0]
  const label = field.charAt(0).toUpperCase() + field.slice(1)
  return new AppError(`${label} already in use. Please choose another.`, 409)
}

const handleValidationError = (err) => {
  const messages = Object.values(err.errors).map((e) => e.message)
  return new AppError(messages.join('. '), 400)
}

// ── JWT error normalisers ────────────────────────────────────────────────────

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again.', 401)

const handleJWTExpiredError = () =>
  new AppError('Your session has expired. Please log in again.', 401)

// ── Response formatters ──────────────────────────────────────────────────────

const sendDev = (err, res) =>
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    stack: err.stack,
  })

const sendProd = (err, res) => {
  if (err.isOperational) {
    // Safe, expected errors — tell the client what went wrong
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    })
  }
  // Unexpected programmer errors — never leak internals
  console.error('UNEXPECTED ERROR:', err)
  res.status(500).json({
    success: false,
    message: 'Something went wrong. Please try again later.',
  })
}

// ── Global error handler (must have 4 params for Express to recognise it) ────

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'

  if (process.env.NODE_ENV === 'development') {
    return sendDev(err, res)
  }

  // Clone so we don't mutate the original error object
  let error = Object.assign(Object.create(Object.getPrototypeOf(err)), err)
  error.message = err.message

  if (error.name === 'CastError') error = handleCastError(error)
  if (error.code === 11000) error = handleDuplicateKey(error)
  if (error.name === 'ValidationError') error = handleValidationError(error)
  if (error.name === 'JsonWebTokenError') error = handleJWTError()
  if (error.name === 'TokenExpiredError') error = handleJWTExpiredError()

  sendProd(error, res)
}
