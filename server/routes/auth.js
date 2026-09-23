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

// Public routes
router.post('/register', validate(rules.register), register)
router.post('/login', validate(rules.login), login)
router.post('/forgot-password', forgotPassword)
router.patch('/reset-password/:token', resetPassword)

// Protected routes (valid JWT required)
router.get('/me', protect, getMe)
router.put('/update-me', protect, updateProfile)
router.put('/update-password', protect, updatePassword)
router.post('/logout', protect, logout)

module.exports = router
