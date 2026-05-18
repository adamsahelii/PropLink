const mongoose = require('mongoose')

// ── Sub-schemas ───────────────────────────────────────────────────────────────

const geoPointSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['Point'], default: 'Point' },
    // GeoJSON order: [longitude, latitude] — required for 2dsphere queries
    coordinates: {
      type: [Number],
      validate: {
        validator: (v) => !v || v.length === 2,
        message: 'Coordinates must be [longitude, latitude]',
      },
    },
  },
  { _id: false }
)

const locationSchema = new mongoose.Schema(
  {
    city: { type: String, required: [true, 'City is required'], trim: true },
    area: { type: String, trim: true },
    address: { type: String, trim: true },
    coordinates: geoPointSchema,
  },
  { _id: false }
)

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true }, // Cloudinary public_id needed for deletion
  },
  { _id: false }
)

// ── Main schema ───────────────────────────────────────────────────────────────

const listingSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    propertyType: {
      type: String,
      required: [true, 'Property type is required'],
      enum: { values: ['apartment', 'land'], message: 'Property type must be apartment or land' },
    },
    purpose: {
      type: String,
      required: [true, 'Purpose is required'],
      enum: { values: ['rent', 'sale'], message: 'Purpose must be rent or sale' },
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be a positive number'],
    },
    location: {
      type: locationSchema,
      required: [true, 'Location is required'],
    },
    size: {
      type: Number,
      min: [0, 'Size must be a positive number'],
    },
    bedrooms: {
      type: Number,
      min: [0, 'Bedrooms cannot be negative'],
      default: null,
    },
    bathrooms: {
      type: Number,
      min: [0, 'Bathrooms cannot be negative'],
      default: null,
    },
    images: {
      type: [imageSchema],
      default: [],
    },
    status: {
      type: String,
      enum: { values: ['available', 'pending', 'rented', 'sold'], message: 'Invalid listing status' },
      default: 'available',
    },
    approvalStatus: {
      type: String,
      enum: { values: ['pending', 'approved', 'rejected'], message: 'Invalid approval status' },
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: '',
    },
    // Soft delete — never permanently remove listings, only hide them
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
)

// ── Slug generation ───────────────────────────────────────────────────────────
// No `next` parameter — Mongoose 7+ runs async pre hooks in Promise mode.
// Declaring `next` causes it to be undefined → TypeError at runtime.

listingSchema.pre('save', async function () {
  if (!this.isModified('title') && this.slug) return

  const base = this.title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

  const suffix = Math.random().toString(36).substring(2, 7)
  this.slug = `${base}-${suffix}`
})

// ── Indexes ───────────────────────────────────────────────────────────────────
// isDeleted is the first field in every compound index — every real query
// filters on it, so MongoDB can prune deleted docs before evaluating other conditions.

listingSchema.index({ isDeleted: 1, approvalStatus: 1, status: 1 })
listingSchema.index({ isDeleted: 1, ownerId: 1 })
listingSchema.index({ propertyType: 1, purpose: 1 })
listingSchema.index({ 'location.city': 1 })
listingSchema.index({ price: 1 })
listingSchema.index({ createdAt: -1 })
listingSchema.index({ 'location.coordinates': '2dsphere' }, { sparse: true })

module.exports = mongoose.model('Listing', listingSchema)
