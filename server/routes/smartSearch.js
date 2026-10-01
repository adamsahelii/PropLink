const express = require('express')
const router = express.Router()
const { smartSearch } = require('../controllers/smartSearchController')

router.post('/', smartSearch)

module.exports = router