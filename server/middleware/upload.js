const multer = require('multer')

// Files are held in memory as Buffers, then converted to base64 data URIs
// in the controller and stored directly in MongoDB. No external host, no disk.
const storage = multer.memoryStorage()

// Only accept real image types — rejects anything else before it hits memory.
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (allowed.includes(file.mimetype)) cb(null, true)
  else cb(new Error('Only JPEG, PNG, WebP, or GIF images are allowed.'), false)
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB per file — keeps documents lean
})

const uploadListingImages = upload.array('images', 10)

module.exports = { upload, uploadListingImages }