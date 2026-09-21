const { cloudinary, isCloudinaryConfigured, LISTINGS_FOLDER } = require('../config/cloudinary')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')
const { MAX_FILES } = require('../middleware/upload')

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Streams one in-memory buffer to Cloudinary and resolves with the two fields
 * the Listing model stores: { url, publicId }.
 */
const streamToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: LISTINGS_FOLDER,
        resource_type: 'image',
        // Re-encode server-side: strips EXIF, caps dimensions, picks the best format
        transformation: [{ width: 1600, height: 1600, crop: 'limit', quality: 'auto:good' }],
      },
      (err, result) => {
        if (err || !result) return reject(err || new Error('Cloudinary returned no result'))
        resolve({ url: result.secure_url, publicId: result.public_id })
      }
    )
    stream.end(buffer)
  })

/**
 * Best-effort removal of assets that are no longer referenced by any listing.
 * Never throws — a failed cleanup must not fail the user's request.
 */
const destroyImages = async (publicIds = []) => {
  if (!isCloudinaryConfigured() || publicIds.length === 0) return

  await Promise.all(
    publicIds
      // Only ever touch assets this app uploaded
      .filter((id) => typeof id === 'string' && id.startsWith(`${LISTINGS_FOLDER}/`))
      .map((id) => cloudinary.uploader.destroy(id).catch(() => {}))
  )
}

// ── POST /api/uploads/listing-images ─────────────────────────────────────────
// Owners and admins only. Multipart field name: `images`.
// Returns the stored image references; the client then submits them with the
// listing form. Files themselves never touch the database.

exports.uploadImages = asyncHandler(async (req, res, next) => {
  if (!isCloudinaryConfigured()) {
    return next(
      new AppError(
        'Image uploads are unavailable: the server is missing its Cloudinary configuration. ' +
          'Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
        503
      )
    )
  }

  const files = req.files || []
  if (files.length === 0) {
    return next(new AppError('No images were received. Please choose a file to upload.', 400))
  }
  if (files.length > MAX_FILES) {
    return next(new AppError(`You can upload at most ${MAX_FILES} images at a time.`, 400))
  }

  let images
  try {
    images = await Promise.all(files.map((f) => streamToCloudinary(f.buffer)))
  } catch (err) {
    return next(new AppError('Image upload failed. Please try again.', 502))
  }

  res.status(201).json({ success: true, images })
})

// Exported for the listing controller's orphan cleanup
exports.destroyImages = destroyImages
