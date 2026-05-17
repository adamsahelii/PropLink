const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const errorHandler = require('./middleware/errorHandler')

dotenv.config()

const app = express()

// Connect to MongoDB
connectDB()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api', require('./routes/index'))

// Root health check
app.get('/', (_req, res) => {
  res.json({ message: 'PropLink API is running' })
})

// Global error handler — must be registered last, after all routes
app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
