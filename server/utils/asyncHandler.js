// Eliminates try/catch boilerplate in every async controller.
// Any thrown error or rejected promise is forwarded to Express's error handler.
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

module.exports = asyncHandler
