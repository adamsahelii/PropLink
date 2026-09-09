const Listing = require('../models/Listing')
const Analytics = require('../models/Analytics')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')
const { buildListingFilter, buildSortOption, getPagination } = require('../utils/queryHelper')
const { pickListingFields } = require('../utils/listingFields')
const { destroyImages } = require('./uploadController')

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Returns a consistent paginated response shape for every list endpoint.
 */
const paginatedResponse = (res, { listings, total, page, limit }) =>
  res.status(200).json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    count: listings.length,
    listings,
  })

/**
 * Resolves whether the requesting user may mutate a listing.
 * Owners can only touch their own; admins can touch any.
 */
const canMutate = (listing, user) =>
  user.role === 'admin' || listing.ownerId.toString() === user._id.toString()

// ── POST /api/listings ────────────────────────────────────────────────────────
// Only owners and admins can create. ownerId is taken from the JWT, never
// from the request body, so a user cannot impersonate another owner.

exports.createListing = asyncHandler(async (req, res, next) => {
  const fields = pickListingFields(req.body, { isAdmin: req.user.role === 'admin' })

  const listing = await Listing.create({
    ...fields,
    ownerId: req.user._id,      // always from auth, never from body
    approvalStatus: 'pending',  // every listing starts in the review queue
    status: fields.status || 'available',
  })

  res.status(201).json({ success: true, listing })
})

// ── GET /api/listings ─────────────────────────────────────────────────────────
// Public. Shows only approved, non-deleted listings.
// Supports: keyword, city, propertyType, purpose, status,
//           minPrice, maxPrice, sort, page, limit.

exports.getAllListings = asyncHandler(async (req, res, next) => {
  const baseFilter = { isDeleted: false, approvalStatus: 'approved' }
  const filter = buildListingFilter(req.query, baseFilter)
  const sort   = buildSortOption(req.query.sort)
  const { page, limit, skip } = getPagination(req.query.page, req.query.limit)

  const [listings, total] = await Promise.all([
    Listing.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('ownerId', 'name profileImage phoneNumber')
      .lean(),
    Listing.countDocuments(filter),
  ])

  paginatedResponse(res, { listings, total, page, limit })
})

// ── GET /api/listings/my ──────────────────────────────────────────────────────
// Owners see all their own listings regardless of approval status.
// Supports the same filter/sort/pagination params as the public endpoint.

exports.getMyListings = asyncHandler(async (req, res, next) => {
  const baseFilter = { isDeleted: false, ownerId: req.user._id }
  const filter = buildListingFilter(req.query, baseFilter)
  const sort   = buildSortOption(req.query.sort)
  const { page, limit, skip } = getPagination(req.query.page, req.query.limit)

  const [listings, total] = await Promise.all([
    Listing.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Listing.countDocuments(filter),
  ])

  paginatedResponse(res, { listings, total, page, limit })
})

// ── GET /api/listings/admin/pending ──────────────────────────────────────────
// Admin review queue. Returns pending listings oldest-first (FIFO).

exports.getPendingListings = asyncHandler(async (req, res, next) => {
  const filter = { isDeleted: false, approvalStatus: 'pending' }
  const { page, limit, skip } = getPagination(req.query.page, req.query.limit)

  const [listings, total] = await Promise.all([
    Listing.find(filter)
      .sort({ createdAt: 1 }) // oldest first — fairest review order
      .skip(skip)
      .limit(limit)
      .populate('ownerId', 'name email phoneNumber')
      .lean(),
    Listing.countDocuments(filter),
  ])

  paginatedResponse(res, { listings, total, page, limit })
})

// ── GET /api/listings/:slug ───────────────────────────────────────────────────
// Public. Resolves by slug for SEO-friendly URLs.
// Fires an async view-count increment that does not block the response.

exports.getListingBySlug = asyncHandler(async (req, res, next) => {
  const listing = await Listing.findOne({
    slug: req.params.slug,
    isDeleted: false,
    approvalStatus: 'approved',
  })
    .populate('ownerId', 'name profileImage phoneNumber')
    .lean()

  if (!listing) return next(new AppError('Listing not found.', 404))

  // Atomic counter increment — fire-and-forget so it never delays the response.
  // upsert:true creates the analytics doc the first time a listing is viewed.
  Analytics.findOneAndUpdate(
    { listingId: listing._id },
    { $inc: { views: 1 } },
    { upsert: true }
  ).exec().catch(() => {}) // swallow errors — analytics must never break the page load

  res.status(200).json({ success: true, listing })
})

// ── PUT /api/listings/:id ─────────────────────────────────────────────────────
// Owner updates their own listing; admin can update any.
// Owner edits reset approvalStatus to 'pending' — changes need re-review.
// Uses .save() instead of findByIdAndUpdate so the slug pre-save hook
// fires if the title changes.

exports.updateListing = asyncHandler(async (req, res, next) => {
  const listing = await Listing.findById(req.params.id)

  if (!listing || listing.isDeleted) {
    return next(new AppError('Listing not found.', 404))
  }

  if (!canMutate(listing, req.user)) {
    return next(new AppError('You are not authorised to update this listing.', 403))
  }

  // Only allowlisted fields can be written; ownership, approval, and
  // soft-delete state are unreachable from a form submission.
  const updates = pickListingFields(req.body, { isAdmin: req.user.role === 'admin' })

  // Photos dropped by the owner become orphans in Cloudinary — collect them
  // before overwriting the array so they can be cleaned up after the save.
  const removedPublicIds = updates.images
    ? listing.images
        .map((img) => img.publicId)
        .filter((id) => !updates.images.some((img) => img.publicId === id))
    : []

  Object.assign(listing, updates)

  // Owner edits send the listing back through the review queue
  if (req.user.role !== 'admin') {
    listing.approvalStatus = 'pending'
    listing.rejectionReason = ''
  }

  await listing.save() // triggers slug pre-save hook if title changed

  // Fire-and-forget: a failed cleanup must never fail the owner's edit
  destroyImages(removedPublicIds).catch(() => {})

  res.status(200).json({ success: true, listing })
})

// ── GET /api/listings/my/:id ──────────────────────────────────────────────────
// Loads one listing for its owner (or an admin) regardless of approval status.
// The public /:slug route only ever returns approved listings, so the edit
// form cannot rely on it — a pending or rejected listing would 404 there.

exports.getMyListingById = asyncHandler(async (req, res, next) => {
  const listing = await Listing.findById(req.params.id).lean()

  if (!listing || listing.isDeleted) {
    return next(new AppError('Listing not found.', 404))
  }

  const isOwner = listing.ownerId.toString() === req.user._id.toString()
  if (req.user.role !== 'admin' && !isOwner) {
    // Same 404 as a missing listing — don't confirm that someone else's id exists
    return next(new AppError('Listing not found.', 404))
  }

  res.status(200).json({ success: true, listing })
})

// ── DELETE /api/listings/:id ──────────────────────────────────────────────────
// Soft delete only — sets isDeleted + deletedAt, never removes the document.
// Preserves inquiry history, analytics, and audit trails.

exports.deleteListing = asyncHandler(async (req, res, next) => {
  const listing = await Listing.findById(req.params.id)

  if (!listing || listing.isDeleted) {
    return next(new AppError('Listing not found.', 404))
  }

  if (!canMutate(listing, req.user)) {
    return next(new AppError('You are not authorised to delete this listing.', 403))
  }

  listing.isDeleted = true
  listing.deletedAt = new Date()
  await listing.save()

  res.status(200).json({ success: true, message: 'Listing removed successfully.' })
})

// ── PATCH /api/listings/:id/approve ──────────────────────────────────────────
// Admin only. Clears any previous rejection reason when approving.

exports.approveListing = asyncHandler(async (req, res, next) => {
  const listing = await Listing.findById(req.params.id)

  if (!listing || listing.isDeleted) {
    return next(new AppError('Listing not found.', 404))
  }

  if (listing.approvalStatus === 'approved') {
    return next(new AppError('Listing is already approved.', 400))
  }

  listing.approvalStatus = 'approved'
  listing.rejectionReason = ''
  await listing.save()

  res.status(200).json({ success: true, message: 'Listing approved.', listing })
})

// ── PATCH /api/listings/:id/reject ───────────────────────────────────────────
// Admin only. A reason is optional but strongly recommended so owners know
// what to fix before resubmitting.

exports.rejectListing = asyncHandler(async (req, res, next) => {
  const listing = await Listing.findById(req.params.id)

  if (!listing || listing.isDeleted) {
    return next(new AppError('Listing not found.', 404))
  }

  if (listing.approvalStatus === 'rejected') {
    return next(new AppError('Listing is already rejected.', 400))
  }

  listing.approvalStatus = 'rejected'
  listing.rejectionReason = req.body.reason?.trim() || 'No reason provided.'
  await listing.save()

  res.status(200).json({ success: true, message: 'Listing rejected.', listing })
})
