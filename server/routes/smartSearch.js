const express = require('express')
const router = express.Router()
const { smartSearch } = require('../controllers/smartSearchController')
const { aiLimiter } = require('../middleware/rateLimit')

// Rate limited: each call reaches the external AI service.
router.post('/', aiLimiter, smartSearch)

module.exports = router
