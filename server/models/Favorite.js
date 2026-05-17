const mongoose = require('mongoose')

const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: [true, 'Listing is required'],
    },
    savedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // No updatedAt needed — a favorite is immutable once created
    timestamps: false,
  }
)

// ── Indexes ──────────────────────────────────────────────────────────────────

// Unique compound index prevents the same user from saving the same listing twice.
// A duplicate insert will throw a MongoServerError code 11000 — handle it in the controller.
favoriteSchema.index({ userId: 1, listingId: 1 }, { unique: true })

// Lets owners/admins query "who saved this listing?" efficiently
favoriteSchema.index({ listingId: 1 })

module.exports = mongoose.model('Favorite', favoriteSchema)
