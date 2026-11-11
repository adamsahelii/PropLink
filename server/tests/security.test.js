// Security hardening tests: CORS restriction and rate limiting.
// These need no database — they exercise middleware only.
const request = require('supertest')
const express = require('express')
const rateLimit = require('express-rate-limit')
const app = require('../app')

const CLIENT = process.env.CLIENT_URL || 'http://localhost:5173'

describe('CORS is restricted to trusted origins', () => {
  test('the configured client origin is allowed', async () => {
    const res = await request(app).get('/').set('Origin', CLIENT)
    expect(res.headers['access-control-allow-origin']).toBe(CLIENT)
  })

  test('an untrusted origin is NOT granted CORS access', async () => {
    const res = await request(app).get('/').set('Origin', 'https://evil.example.com')
    expect(res.headers['access-control-allow-origin']).toBeUndefined()
  })
})

describe('Rate limiting is wired on sensitive routes', () => {
  test('the login route emits RateLimit headers', async () => {
    // Missing password -> validator returns 400 before the controller (no DB),
    // but the limiter has already run and set its headers.
    const res = await request(app).post('/api/auth/login').send({ email: 'x@test.com' })
    expect(res.headers['ratelimit-limit']).toBeDefined()
  })

  test('the AI search route emits RateLimit headers', async () => {
    const res = await request(app).post('/api/smart-search').send({ query: 'apartment in Beirut' })
    expect(res.headers['ratelimit-limit']).toBeDefined()
  })
})

describe('Rate limiter blocks excess requests', () => {
  test('a limiter with max=3 returns 429 on the 4th request', async () => {
    const mini = express()
    mini.use(
      rateLimit({
        windowMs: 60 * 1000, max: 3, standardHeaders: true, legacyHeaders: false,
        handler: (req, res) => res.status(429).json({ success: false, message: 'Too many requests.' }),
      })
    )
    mini.get('/x', (_req, res) => res.json({ ok: true }))

    for (let i = 0; i < 3; i++) {
      const ok = await request(mini).get('/x')
      expect(ok.status).toBe(200)
    }
    const blocked = await request(mini).get('/x')
    expect(blocked.status).toBe(429)
    expect(blocked.body.success).toBe(false)
  })
})
