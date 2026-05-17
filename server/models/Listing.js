const mongoose = require('mongoose')

// ── Sub-schemas (no _id needed) ─────────────────────────────────────────────

const geoPointSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    // [longitude, latitude] — GeoJSON order, required for 2dsphere queries
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
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    area: { type: String, trim: true },
    address: { type: String, trim: true },
    coordinates: geoPointSchema,
  },
  { _id: false }
)

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true }, // Cloudinary public_id for deletion
  },
  { _id: false }
)

// ── Main schema ──────────────────────────────────────────────────────────────

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
      enum: {
        values: ['apartment', 'land'],
        message: 'Property type must be apartment or land',
      },
    },
    purpose: {
      type: String,
      required: [true, 'Purpose is required'],
      enum: {
        values: ['rent', 'sale'],
        message: 'Purpose must be rent or sale',
      },
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
    // Square metres — applies to both apartments and land plots
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
      enum: {
        values: ['available', 'pending', 'rented', 'sold'],
        message: 'Invalid listing status',
      },
      default: 'available',
    },
    approvalStatus: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected'],
        message: 'Invalid approval status',
      },
      default: 'pending',
    },
  },
  { timestamps: true }
)

// ── Slug generation ──────────────────────────────────────────────────────────

listingSchema.pre('save', async function (next) {
  // Regenerate slug only when the title changes or no slug exists yet
  if (!this.isModified('title') && this.slug) return next()

  const base = this.title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

  // 5-char random suffix keeps slugs unique without a DB lookup
  const suffix = Math.random().toString(36).substring(2, 7)
  this.slug = `${base}-${suffix}`
  next()
})

// ── Indexes ──────────────────────────────────────────────────────────────────

listingSchema.index({ ownerId: 1 })
listingSchema.index({ status: 1, approvalStatus: 1 })
listingSchema.index({ propertyType: 1, purpose: 1 })
listingSchema.index({ 'location.city': 1 })
listingSchema.index({ price: 1 })
listingSchema.index({ createdAt: -1 })

// Geospatial index — sparse so listings without coordinates are not rejected
listingSchema.index(
  { 'location.coordinates': '2dsphere' },
  { sparse: true }
)

module.exports = mongoose.model('Listing', listingSchema)
