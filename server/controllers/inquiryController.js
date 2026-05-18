const Inquiry = require('../models/Inquiry')
const Listing = require('../models/Listing')
const Analytics = require('../models/Analytics')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')
const { getPagination } = require('../utils/queryHelper')

const VALID_STATUSES = ['new', 'responded', 'closed']

// ── POST /api/inquiries ───────────────────────────────────────────────────────
// Any authenticated user can inquire about an approved listing.
//
// ownerId is read from the listing document and stored directly on the inquiry.
// This denormalisation lets owner inbox queries run as a single indexed lookup
// on { ownerId, status } without joining back to the Listing collection.

exports.createInquiry = asyncHandler(async (req, res, next) => {
  const { listingId, message, contactPhone } = req.body

  if (!listingId) return next(new AppError('Listing ID is required.', 400))
  if (!message || !message.trim()) return next(new AppError('Message is required.', 400))

  const listing = await Listing.findOne({
    _id: listingId,
    isDeleted: false,
    approvalStatus: 'approved',
  })

  if (!listing) return next(new AppError('Listing not found or not available.', 404))

  if (listing.ownerId.toString() === req.user._id.toString()) {
    return next(new AppError('You cannot send an inquiry for your own listing.', 400))
  }

  const inquiry = await Inquiry.create({
    userId: req.user._id,
    listingId,
    ownerId: listing.ownerId, // taken from the listing — never trusted from req.body
    message: message.trim(),
    contactPhone: contactPhone?.trim() || undefined,
  })

  // Atomic counter increment — fire and forget
  Analytics.findOneAndUpdate(
    { listingId },
    { $inc: { inquiries: 1 } },
    { upsert: true }
  ).exec().catch(() => {})

  res.status(201).json({ success: true, inquiry })
})

// ── GET /api/inquiries/my ─────────────────────────────────────────────────────
// Returns all inquiries the authenticated user has sent.
// The filter { userId: req.user._id } makes it structurally impossible for
// a user to retrieve another user's sent inquiries through this endpoint.

exports.getMyInquiries = asyncHandler(async (req, res, _next) => {
  const { page, limit, skip } = getPagination(req.query.page, req.query.limit)
  const filter = { userId: req.user._id }

  if (req.query.status && VALID_STATUSES.includes(req.query.status)) {
    filter.status = req.query.status
  }

  const [inquiries, total] = await Promise.all([
    Inquiry.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('listingId', 'title slug price location images')
      .populate('ownerId', 'name phoneNumber profileImage')
      .lean(),
    Inquiry.countDocuments(filter),
  ])

  res.status(200).json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    count: inquiries.length,
    inquiries,
  })
})

// ── GET /api/inquiries/listing/:listingId ─────────────────────────────────────
// Owner or admin sees all inquiries for a specific listing.
// A regular user gets a 403 even if they themselves sent an inquiry —
// they must use GET /api/inquiries/my to see their own history.

exports.getListingInquiries = asyncHandler(async (req, res, next) => {
  const { listingId } = req.params

  // We only need ownerId from the listing — lean() avoids the full document
  const listing = await Listing.findOne(
    { _id: listingId, isDeleted: false },
    'ownerId'
  ).lean()

  if (!listing) return next(new AppError('Listing not found.', 404))

  const isOwner = listing.ownerId.toString() === req.user._id.toString()
  const isAdmin = req.user.role === 'admin'

  if (!isOwner && !isAdmin) {
    return next(new AppError('You are not authorised to view these inquiries.', 403))
  }

  const filter = { listingId }
  if (req.query.status && VALID_STATUSES.includes(req.query.status)) {
    filter.status = req.query.status
  }

  const { page, limit, skip } = getPagination(req.query.page, req.query.limit)

  const [inquiries, total] = await Promise.all([
    Inquiry.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email phoneNumber profileImage')
      .lean(),
    Inquiry.countDocuments(filter),
  ])

  res.status(200).json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    count: inquiries.length,
    inquiries,
  })
})

// ── GET /api/inquiries/owner ──────────────────────────────────────────────────
// Owner inbox — all inquiries received across ALL their listings.
// Different from /listing/:listingId which scopes to one listing.
// Filter by status with ?status=new|responded|closed

exports.getOwnerInquiries = asyncHandler(async (req, res, next) => {
  const filter = { ownerId: req.user._id }

  if (req.query.status && VALID_STATUSES.includes(req.query.status)) {
    filter.status = req.query.status
  }

  const { page, limit, skip } = getPagination(req.query.page, req.query.limit)

  const [inquiries, total] = await Promise.all([
    Inquiry.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('listingId', 'title slug price location images')
      .populate('userId', 'name email phoneNumber profileImage')
      .lean(),
    Inquiry.countDocuments(filter),
  ])

  res.status(200).json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    count: inquiries.length,
    inquiries,
  })
})

// ── PATCH /api/inquiries/:id/status ──────────────────────────────────────────
// Only the listing owner (stored as ownerId on the inquiry) or an admin
// can advance the status. Users who sent the inquiry cannot update it.
//
// Intended workflow: new → responded → closed

exports.updateInquiryStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body

  if (!status) return next(new AppError('Status is required.', 400))
  if (!VALID_STATUSES.includes(status)) {
    return next(new AppError('Status must be new, responded, or closed.', 400))
  }

  const inquiry = await Inquiry.findById(req.params.id)
  if (!inquiry) return next(new AppError('Inquiry not found.', 404))

  const isOwner = inquiry.ownerId.toString() === req.user._id.toString()
  const isAdmin = req.user.role === 'admin'

  if (!isOwner && !isAdmin) {
    return next(new AppError('You are not authorised to update this inquiry.', 403))
  }

  inquiry.status = status
  await inquiry.save()

  res.status(200).json({ success: true, inquiry })
})
