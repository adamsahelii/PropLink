const multer = require('multer')
const AppError = require('../utils/AppError')

// ── Limits ────────────────────────────────────────────────────────────────────
// Kept in one place so the API and the client can describe the same rules.

const MAX_FILE_SIZE  = 5 * 1024 * 1024 // 5 MB per image
const MAX_FILES      = 10              // per request
const ALLOWED_MIMES  = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

// Files are buffered in memory and streamed straight to Cloudinary —
// nothing is ever written to the server's disk.
const storage = multer.memoryStorage()

const fileFilter = (_req, file, cb) => {
  if (!ALLOWED_MIMES.includes(file.mimetype)) {
    return cb(new AppError('Only JPEG, PNG, WebP, and GIF images are allowed.', 400))
  }
  cb(null, true)
}

const uploader = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: MAX_FILES },
})

/**
 * Accepts up to MAX_FILES images under the `images` field and normalises
 * multer's own errors into AppError so the global handler formats them.
 */
const uploadListingImages = (req, res, next) =>
  uploader.array('images', MAX_FILES)(req, res, (err) => {
    if (!err) return next()

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError('Each image must be 5 MB or smaller.', 400))
      }
      if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
        return next(new AppError(`You can upload at most ${MAX_FILES} images at a time.`, 400))
      }
      return next(new AppError(`Upload failed: ${err.message}`, 400))
    }

    next(err)
  })

module.exports = { uploadListingImages, MAX_FILE_SIZE, MAX_FILES, ALLOWED_MIMES }
