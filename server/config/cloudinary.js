const cloudinary = require('cloudinary').v2

// Credentials live only on the server — they are never sent to the browser.
// Required env vars: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env

const configured = Boolean(
  CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET
)

if (configured) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  })
}

/**
 * True only when all three credentials are present.
 * Callers must check this and fail loudly — never pretend an upload succeeded.
 */
const isCloudinaryConfigured = () => configured

/** Every listing photo lands in one folder so assets stay easy to audit. */
const LISTINGS_FOLDER = 'proplink/listings'

module.exports = { cloudinary, isCloudinaryConfigured, LISTINGS_FOLDER }
