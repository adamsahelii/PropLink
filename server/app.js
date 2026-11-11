const express = require('express')
const cors = require('cors')
const errorHandler = require('./middleware/errorHandler')

// Builds and returns the configured Express app WITHOUT connecting to a
// database or binding a port. server.js wires in the DB + listener for
// real runs; the test suite imports this app and supplies its own
// in-memory MongoDB, so tests need no secrets and touch no real data.
const app = express()

// ── CORS: only trusted origins ────────────────────────────────────────────────
// The local dev client and the deployed client are always allowed, so the app
// works in development and in production with no extra configuration. Further
// origins can be added through CORS_ORIGINS (comma-separated) or CLIENT_URL.
// Requests with no Origin header (server-to-server, curl, health checks) are
// allowed; a browser request from an unlisted origin receives no CORS headers.
const DEFAULT_ORIGINS = [
  'http://localhost:5173',
  'https://prop-link-pi.vercel.app',
]
const extraOrigins = (process.env.CORS_ORIGINS || process.env.CLIENT_URL || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
const allowedOrigins = [...new Set([...DEFAULT_ORIGINS, ...extraOrigins])]

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
