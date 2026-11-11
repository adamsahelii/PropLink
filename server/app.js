const express = require('express')
const cors = require('cors')
const errorHandler = require('./middleware/errorHandler')

// Builds and returns the configured Express app WITHOUT connecting to a
// database or binding a port. server.js wires in the DB + listener for
// real runs; the test suite imports this app and supplies its own
// in-memory MongoDB, so tests need no secrets and touch no real data.
const app = express()

// ── CORS: only trusted origins ────────────────────────────────────────────────
// Allowed origins come from CORS_ORIGINS (comma-separated) or CLIENT_URL,
// defaulting to the local dev client. Requests with no Origin header
// (server-to-server, curl, health checks) are allowed; a browser request
// from an unlisted origin receives no CORS headers and is blocked.
const allowedOrigins = (process.env.CORS_ORIGINS || process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

const corsOptions = {
  origin(origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
    return cb(null, false)
  },
  credentials: true,
}

// Middleware
app.use(cors(corsOptions))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api', require('./routes/index'))

// Root health check
app.get('/', (_req, res) => {
  res.json({ message: 'PropLink API is running' })
})

// Global error handler — must be registered last, after all routes
app.use(errorHandler)

module.exports = app
