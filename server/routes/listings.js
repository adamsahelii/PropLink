const express = require('express')
const router = express.Router()

const {
  createListing,
  getAllListings,
  getMyListings,
  getPendingListings,
  getListingBySlug,
  updateListing,
  deleteListing,
  approveListing,
  rejectListing,
} = require('../controllers/listingController')

const { protect, authorize } = require('../middleware/auth')

// ── Public ────────────────────────────────────────────────────────────────────

router.get('/', getAllListings)

// ── Authenticated — static paths MUST be declared before /:slug / /:id ───────
// Express matches routes in declaration order. If /:slug came first,
// requests to /my and /admin/pending would be swallowed as slug values.

router.get('/my', protect, authorize('owner', 'admin'), getMyListings)
router.get('/admin/pending', protect, authorize('admin'), getPendingListings)

// ── Public — dynamic by slug (after static routes) ───────────────────────────

router.get('/:slug', getListingBySlug)

// ── Authenticated — create ────────────────────────────────────────────────────

router.post('/', protect, authorize('owner', 'admin'), createListing)

// ── Authenticated — mutate by MongoDB _id ─────────────────────────────────────
// Ownership check happens inside each controller (needs the document anyway).

router.put('/:id', protect, updateListing)
router.delete('/:id', protect, deleteListing)

// ── Admin — approval workflow ─────────────────────────────────────────────────

router.patch('/:id/approve', protect, authorize('admin'), approveListing)
router.patch('/:id/reject', protect, authorize('admin'), rejectListing)

module.exports = router
