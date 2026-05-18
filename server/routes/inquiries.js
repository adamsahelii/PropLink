const express = require('express')
const router = express.Router()

const {
  createInquiry,
  getMyInquiries,
  getOwnerInquiries,
  getListingInquiries,
  updateInquiryStatus,
} = require('../controllers/inquiryController')

const { protect } = require('../middleware/auth')

// All inquiry routes require a valid JWT
router.use(protect)

// Static paths declared before dynamic /:id to prevent route shadowing
router.post('/', createInquiry)
router.get('/my', getMyInquiries)                          // inquiries I sent (as buyer)
router.get('/owner', getOwnerInquiries)                    // inquiries I received (as owner)
router.get('/listing/:listingId', getListingInquiries)     // per-listing inbox (owner/admin)
router.patch('/:id/status', updateInquiryStatus)

module.exports = router
