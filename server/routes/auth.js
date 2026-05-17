const express = require('express')
const router = express.Router()

const {
  register,
  login,
  getMe,
  updatePassword,
  logout,
} = require('../controllers/authController')

const { protect } = require('../middleware/auth')
const { validate, rules } = require('../middleware/validate')

// Public routes
router.post('/register', validate(rules.register), register)
router.post('/login', validate(rules.login), login)

// Protected routes (valid JWT required)
router.get('/me', protect, getMe)
router.put('/update-password', protect, updatePassword)
router.post('/logout', protect, logout)

module.exports = router
