const express = require('express')
const router = express.Router()

const {
  addFavorite,
  removeFavorite,
  getMyFavorites,
} = require('../controllers/favoriteController')

const { protect } = require('../middleware/auth')

// All favorites routes require a valid JWT
router.use(protect)

// /my is static — must come before /:listingId to avoid being swallowed as a param
router.get('/my', getMyFavorites)
router.post('/', addFavorite)              // listingId comes from req.body
router.delete('/:listingId', removeFavorite)

module.exports = router
