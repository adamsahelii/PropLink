const mongoose = require('mongoose')

const analyticsSchema = new mongoose.Schema(
  {
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: [true, 'Listing is required'],
      unique: true, // one analytics document per listing
    },
    views: {
      type: Number,
      default: 0,
      min: [0, 'Views cannot be negative'],
    },
    inquiries: {
      type: Number,
      default: 0,
      min: [0, 'Inquiry count cannot be negative'],
    },
    favorites: {
      type: Number,
      default: 0,
      min: [0, 'Favorites count cannot be negative'],
    },
  },
  {
    // updatedAt tells you when counters were last changed
    timestamps: true,
  }
)

// Use findOneAndUpdate with $inc for atomic counter increments — never read-modify-write
// Example in a controller:
//   Analytics.findOneAndUpdate(
//     { listingId },
//     { $inc: { views: 1 } },
//     { upsert: true, new: true }
//   )

analyticsSchema.index({ listingId: 1 })

module.exports = mongoose.model('Analytics', analyticsSchema)
