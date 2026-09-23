const express = require('express')
const router = express.Router()

const { getOwnerAnalytics } = require('../controllers/analyticsController')
const { protect, authorize } = require('../middleware/auth')

// Only owners and admins have listings to analyse
router.use(protect, authorize('owner', 'admin'))

router.get('/owner', getOwnerAnalytics)

module.exports = router