const mongoose = require('mongoose')

const inquirySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender (user) is required'],
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: [true, 'Listing is required'],
    },
    // Denormalised from the listing so owner inbox queries skip a join
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['new', 'responded', 'closed'],
        message: 'Status must be new, responded, or closed',
      },
      default: 'new',
    },
  },
  { timestamps: true }
)

// ── Indexes ──────────────────────────────────────────────────────────────────

// Owner dashboard — "show me all inquiries for my listings, sorted by status"
inquirySchema.index({ ownerId: 1, status: 1 })

// Listing detail — "how many inquiries does this listing have?"
inquirySchema.index({ listingId: 1, status: 1 })

// User history — "show me all my sent inquiries"
inquirySchema.index({ userId: 1 })

module.exports = mongoose.model('Inquiry', inquirySchema)
