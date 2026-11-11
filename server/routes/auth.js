const express = require('express')
const router = express.Router()

const {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
  logout,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController')

const { protect } = require('../middleware/auth')
const { validate, rules } = require('../middleware/validate')
const { authLimiter } = require('../middleware/rateLimit')

// Public routes — sensitive auth actions are rate limited (brute-force defence)
router.post('/register', validate(rules.register), register)
router.post('/login', authLimiter, validate(rules.login), login)
router.post('/forgot-password', authLimiter, forgotPassword)
router.patch('/reset-password/:token', authLimiter, resetPassword)

// Protected routes (valid JWT required)
router.get('/me', protect, getMe)
router.put('/update-me', protect, updateProfile)
router.put('/update-password', protect, updatePassword)
router.post('/logout', protect, logout)

module.exports = router
