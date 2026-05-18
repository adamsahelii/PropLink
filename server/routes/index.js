const express = require('express')
const router = express.Router()

// Test route — confirms the API is reachable
router.get('/test', (_req, res) => {
  res.json({ success: true, message: 'PropLink API is working!' })
})

router.use('/auth', require('./auth'))
router.use('/listings', require('./listings'))
router.use('/favorites', require('./favorites'))
router.use('/inquiries', require('./inquiries'))
router.use('/example', require('./example'))

// Future route mounts:
// router.use('/users', require('./users'))

module.exports = router
