const User = require('../models/User')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')
const sendEmail = require('../utils/sendEmail')

// ── GET /api/admin/users ──────────────────────────────────────────────────────
// Admin-only. Lists all users (password excluded by schema select:false).
exports.listUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find()
    .select('name email role isActive createdAt')
    .sort({ createdAt: -1 })

  res.status(200).json({ success: true, total: users.length, users })
})

// ── PATCH /api/admin/users/:id/status ─────────────────────────────────────────
// Admin-only. Toggles a user's isActive flag.
// Guards: can't change your own status, can't deactivate another admin.
exports.setUserStatus = asyncHandler(async (req, res, next) => {
  const { isActive } = req.body

  if (typeof isActive !== 'boolean') {
    return next(new AppError('isActive must be true or false.', 400))
  }

  if (req.params.id === String(req.user._id)) {
    return next(new AppError('You cannot change your own account status.', 400))
  }

  const user = await User.findById(req.params.id)
  if (!user) {
    return next(new AppError('User not found.', 404))
  }

  if (user.role === 'admin') {
    return next(new AppError('Admin accounts cannot be deactivated.', 403))
  }

  user.isActive = isActive
  await user.save({ validateBeforeSave: false })

  // Notify the user by email (best-effort — never block the admin action)
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
  try {
    await sendEmail({
      to: user.email,
      subject: isActive
        ? 'Your PropLink account has been reactivated'
        : 'Your PropLink account has been deactivated',
      html: isActive
        ? `
          <h2>Account reactivated</h2>
          <p>Hi ${user.name},</p>
          <p>Good news — an administrator has reactivated your PropLink account.
             You can sign in again here:</p>
          <p><a href="${clientUrl}/login">${clientUrl}/login</a></p>
        `
        : `
          <h2>Account deactivated</h2>
          <p>Hi ${user.name},</p>
          <p>An administrator has deactivated your PropLink account, so you can no longer sign in.</p>
          <p>If you believe this is a mistake, please contact support by replying to this email.</p>
        `,
    })
  } catch (err) {
    console.error('Status-change email failed:', err.message)
  }

  res.status(200).json({
    success: true,
    message: isActive ? 'User activated.' : 'User deactivated.',
    user: { _id: user._id, isActive: user.isActive },
  })
})