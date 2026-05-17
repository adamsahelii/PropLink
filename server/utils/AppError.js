class AppError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
    this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error'
    // Flags our own thrown errors vs unexpected programmer bugs
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = AppError
