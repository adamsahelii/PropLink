const express = require('express')
const router = express.Router()

const { uploadImages } = require('../controllers/uploadController')
const { uploadListingImages } = require('../middleware/upload')
const { protect, authorize } = require('../middleware/auth')

// Authenticated owners/admins only — uploading is never anonymous.
router.post(
  '/listing-images',
  protect,
  authorize('owner', 'admin'),
  uploadListingImages,
  uploadImages
)

module.exports = router
