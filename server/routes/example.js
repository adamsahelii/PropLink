/**
 * example.js — demonstrates how protect + authorize are composed.
 * Delete this file once you are comfortable with the pattern.
 */
const express = require('express')
const router = express.Router()

const { protect, authorize } = require('../middleware/auth')

// Any logged-in user
router.get('/user-only', protect, (req, res) => {
  res.json({ success: true, message: `Hello ${req.user.name}, you are a ${req.user.role}.` })
})

// Owners and admins only
router.get('/owner-dashboard', protect, authorize('owner', 'admin'), (req, res) => {
  res.json({ success: true, message: 'Welcome to the owner dashboard.' })
})

// Admins only
router.get('/admin-panel', protect, authorize('admin'), (req, res) => {
  res.json({ success: true, message: 'Welcome to the admin panel.' })
})

module.exports = router
