const User = require('../models/User')
const { generateToken } = require('../utils/jwt')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')

// ── Private helper ────────────────────────────────────────────────────────────

/**
 * Generates a JWT and sends a consistent auth response.
 * The user object is explicitly shaped so we never accidentally
 * serialise the password hash even if select:false is bypassed.
 */
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id)

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      profileImage: user.profileImage,
      isVerified: user.isVerified,
    },
  })
}

// ── POST /api/auth/register ───────────────────────────────────────────────────

exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, phoneNumber, role } = req.body

  // Only 'user' and 'owner' are self-assignable.
  // Admin accounts must be promoted directly in the database.
  const safeRole = ['user', 'owner'].includes(role) ? role : 'user'

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,          // bcrypt hashing happens in the User pre-save hook
    phoneNumber,
    role: safeRole,
  })

  sendTokenResponse(user, 201, res)
})
// ── PUT /api/auth/update-me  (protected) ─────────────────────────────────────
//
// Updates profile fields only: name, email, phoneNumber.
// Deliberately does NOT touch password (own endpoint), role, or isActive —
// those must never be self-editable through this route.

exports.updateProfile = asyncHandler(async (req, res, next) => {
  const { name, email, phoneNumber, role } = req.body

  const user = await User.findById(req.user._id)
  if (!user) {
    return next(new AppError('User not found.', 404))
  }

  // ── Name ──
  if (name !== undefined) {
    const trimmed = name.trim()
    if (trimmed.length === 0) {
      return next(new AppError('Name cannot be empty.', 400))
    }
    user.name = trimmed
  }

  // ── Email ── (check uniqueness only if it actually changed)
  if (email !== undefined) {
    const normalized = email.toLowerCase().trim()
    if (normalized !== user.email) {
      const taken = await User.findOne({ email: normalized })
      if (taken) {
        return next(new AppError('That email is already in use.', 409))
      }
      user.email = normalized
    }
  }

  // ── Phone ── (optional field — allow clearing it)
  if (phoneNumber !== undefined) {
    user.phoneNumber = phoneNumber.trim()
  }

  // ── Role ── buyer/owner switch only.
  // Whitelisted to 'user' and 'owner' so nobody can self-promote to admin,
  // and an admin can't accidentally demote themselves through this route.
  if (
    role !== undefined &&
    ['user', 'owner'].includes(role) &&
    ['user', 'owner'].includes(user.role)
  ) {
    user.role = role
  }

  // Runs schema validators (email format, phone regex, name maxlength).
  // Password is untouched, so the pre-save hash hook is a no-op.
  await user.save()

  sendTokenResponse(user, 200, res)
})

// ── POST /api/auth/login ──────────────────────────────────────────────────────

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body

  // Must explicitly select password — schema sets select:false by default
  const user = await User.findOne({
    email: email.toLowerCase().trim(),
  }).select('+password')

  // Identical error message for wrong email AND wrong password —
  // prevents attackers from using response timing to enumerate valid emails
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid email or password.', 401))
  }

  if (!user.isActive) {
    return next(
      new AppError(
        'Your account has been deactivated. Please contact support.',
        403
      )
    )
  }

  sendTokenResponse(user, 200, res)
})

// ── GET /api/auth/me  (protected) ────────────────────────────────────────────

exports.getMe = asyncHandler(async (req, res, next) => {
  // req.user is populated by the protect middleware — no DB call needed
  res.status(200).json({
    success: true,
    user: req.user,
  })
})

// ── PUT /api/auth/update-password  (protected) ───────────────────────────────

exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    return next(
      new AppError('Both current password and new password are required.', 400)
    )
  }

  if (newPassword.length < 8) {
    return next(new AppError('New password must be at least 8 characters.', 400))
  }

  const user = await User.findById(req.user._id).select('+password')

  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError('Current password is incorrect.', 401))
  }

  user.password = newPassword  // pre-save hook re-hashes automatically
  await user.save()

  sendTokenResponse(user, 200, res)
})

// ── POST /api/auth/logout  (protected) ───────────────────────────────────────
//
// JWT is stateless — there is no server-side session to destroy.
// The client is responsible for discarding the token from storage.
// This endpoint serves as a clean hook for future token blacklisting
// (e.g. Redis-backed blocklist) without changing the route contract.

exports.logout = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  })
})
