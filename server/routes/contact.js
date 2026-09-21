const express = require('express')
const router = express.Router()

const { createContactMessage } = require('../controllers/contactController')

// Public — no auth required. Logged-in users can still send; the frontend
// includes their token so the message links to their account.
router.post('/', createContactMessage)

module.exports = router