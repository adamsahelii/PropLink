const multer = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const cloudinary = require('../config/cloudinary')

// Only use Cloudinary storage if credentials exist; otherwise keep files
// in memory and let the controller skip them. This lets listings be created
// without photos while Cloudinary isn't set up yet.
const hasCloudinary = Boolean(process.env.CLOUDINARY_CLOUD_NAME)

const storage = hasCloudinary
  ? new CloudinaryStorage({
      cloudinary,
      params: {
        folder: 'proplink/listings',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1600, height: 1200, crop: 'limit' }],
      },
    })
  : multer.memoryStorage() // fallback — files held in memory, then ignored

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
})

module.exports = upload