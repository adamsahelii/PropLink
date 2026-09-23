const Listing = require('../models/Listing')
const Analytics = require('../models/Analytics')
const asyncHandler = require('../utils/asyncHandler')

// ── GET /api/analytics/owner ──────────────────────────────────────────────────
// Per-listing counters + totals for every (non-deleted) listing the
// authenticated owner has, including pending and rejected ones.

exports.getOwnerAnalytics = asyncHandler(async (req, res) => {
  const listings = await Listing.find({ ownerId: req.user._id, isDeleted: false })
    .select('title slug price purpose propertyType approvalStatus images createdAt')
    .sort({ createdAt: -1 })
    .lean()

  const ids = listings.map((l) => l._id)
  const stats = await Analytics.find({ listingId: { $in: ids } }).lean()

  // Map listingId → counters for O(1) lookup
  const byListing = new Map(stats.map((s) => [String(s.listingId), s]))

  const rows = listings.map((l) => {
    const s = byListing.get(String(l._id))
    const views = s?.views ?? 0
    const inquiries = s?.inquiries ?? 0
    const favorites = s?.favorites ?? 0
    return {
      _id: l._id,
      title: l.title,
      slug: l.slug,
      price: l.price,
      purpose: l.purpose,
      propertyType: l.propertyType,
      approvalStatus: l.approvalStatus,
      image: l.images?.[0]?.url || null,
      createdAt: l.createdAt,
      views,
      inquiries,
      favorites,
      // % of viewers who sent an inquiry
      conversionRate: views > 0 ? +((inquiries / views) * 100).toFixed(1) : 0,
    }
  })

  const totals = rows.reduce(
    (acc, r) => {
      acc.views += r.views
      acc.inquiries += r.inquiries
      acc.favorites += r.favorites
      acc[r.approvalStatus] = (acc[r.approvalStatus] || 0) + 1
      return acc
    },
    { listings: rows.length, views: 0, inquiries: 0, favorites: 0 }
  )
  totals.conversionRate =
    totals.views > 0 ? +((totals.inquiries / totals.views) * 100).toFixed(1) : 0

  res.status(200).json({ success: true, totals, listings: rows })
})