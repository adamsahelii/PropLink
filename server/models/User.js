const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // never returned in queries unless explicitly asked
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s\-().]{7,20}$/, 'Please provide a valid phone number'],
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'owner', 'admin'],
        message: 'Role must be user, owner, or admin',
      },
      default: 'user',
    },
    profileImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

// Hash password only when it is new or changed.
// No `next` parameter — Mongoose 7+ runs async hooks in Promise mode,
// meaning it awaits the returned promise and never injects `next`.
// Declaring `next` as a parameter causes it to be undefined → crash.
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 12)
})

// Compare a plain-text candidate against the stored hash
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// Strip sensitive fields from any JSON serialization
userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  return obj
}
userSchema.index({ role: 1 })
userSchema.index({ isActive: 1 })

module.exports = mongoose.model('User', userSchema)
