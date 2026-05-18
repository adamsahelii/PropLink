const Favorite = require('../models/Favorite')
const Listing = require('../models/Listing')
const Analytics = require('../models/Analytics')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')
const { getPagination } = require('../utils/queryHelper')

// ── Shared analytics helper ───────────────────────────────────────────────────
// Fire-and-forget atomic counter update. Never blocks the response —
// analytics failures must not affect the user-facing operation.

const updateFavoritesCount = (listingId, delta) =>
  Analytics.findOneAndUpdate(
    { listingId, ...(delta < 0 && { favorites: { $gt: 0 } }) },
    { $inc: { favorites: delta } },
    { upsert: delta > 0 }
  ).exec().catch(() => {})

// ── POST /api/favorites/:listingId ────────────────────────────────────────────
// Saves a listing to the authenticated user's favorites.
//
// Duplicate prevention relies on the unique compound index { userId, listingId }
// in the Favorite schema. A second insert throws MongoServerError code 11000,
// which we catch here and convert to a clean 409 rather than an opaque 500.

exports.addFavorite = asyncHandler(async (req, res, next) => {
  const { listingId } = req.body  // listingId is in the body, not the URL

  if (!listingId) return next(new AppError('Listing ID is required.', 400))

  const listing = await Listing.findOne({
    _id: listingId,
    isDeleted: false,
    approvalStatus: 'approved',
  })

  if (!listing) return next(new AppError('Listing not found.', 404))

  if (listing.ownerId.toString() === req.user._id.toString()) {
    return next(new AppError('You cannot save your own listing.', 400))
  }

  try {
    const favorite = await Favorite.create({ userId: req.user._id, listingId })
    updateFavoritesCount(listingId, 1)
    res.status(201).json({ success: true, message: 'Listing saved to favorites.', favorite })
  } catch (err) {
    if (err.code === 11000) {
      return next(new AppError('You have already saved this listing.', 409))
    }
    next(err)
  }
})

// ── DELETE /api/favorites/:listingId ─────────────────────────────────────────
// Removes a listing from the user's favorites.
// findOneAndDelete with both userId and listingId ensures a user can only
// remove their own favorite — no extra ownership check needed.

exports.removeFavorite = asyncHandler(async (req, res, next) => {
  const { listingId } = req.params

  const favorite = await Favorite.findOneAndDelete({
    userId: req.user._id,
    listingId,
  })

  if (!favorite) return next(new AppError('This listing is not in your favorites.', 404))

  // Pass -1 to decrement; the helper guards against going below zero.
  updateFavoritesCount(listingId, -1)

  res.status(200).json({ success: true, message: 'Listing removed from favorites.' })
})

// ── GET /api/favorites ────────────────────────────────────────────────────────
// Returns all saved listings for the authenticated user, newest-saved first.
//
// populate match: { isDeleted: false } silently filters out listings that were
// soft-deleted after being favorited — they return as null in the array and
// are stripped before sending the response.

exports.getMyFavorites = asyncHandler(async (req, res, _next) => {
  const { page, limit, skip } = getPagination(req.query.page, req.query.limit)
  const filter = { userId: req.user._id }

  const [favorites, total] = await Promise.all([
    Favorite.find(filter)
      .sort({ savedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'listingId',
        select: 'title slug price location propertyType purpose status images approvalStatus',
        match: { isDeleted: false },
      })
      .lean(),
    Favorite.countDocuments(filter),
  ])

  // Listings deleted after being favorited come back as null — strip them
  const validFavorites = favorites.filter((f) => f.listingId !== null)

  res.status(200).json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    count: validFavorites.length,
    favorites: validFavorites,
  })
})
