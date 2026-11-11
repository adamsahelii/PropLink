// Mock the email utility so forgot-password / status emails never try to
// reach a real SMTP server during tests.
jest.mock('../utils/sendEmail', () => jest.fn().mockResolvedValue(true))

const request = require('supertest')
const crypto = require('crypto')
const app = require('../app')
const User = require('../models/User')
const db = require('./db')
const { makeUser, auth } = require('./helpers')

beforeAll(db.connect)
afterEach(db.clear)
afterAll(db.close)

describe('Authentication — registration', () => {
  test('registers a valid user and returns a token (201)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Ali', email: 'ali@test.com', password: 'Password123', role: 'owner',
    })
    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.token).toBeDefined()
    expect(res.body.user.email).toBe('ali@test.com')
    expect(res.body.user.role).toBe('owner')
    // Password hash must never be returned
    expect(res.body.user.password).toBeUndefined()
  })

  test('rejects a duplicate email (409)', async () => {
    await makeUser({ email: 'dup@test.com' })
    const res = await request(app).post('/api/auth/register').send({
      name: 'Other', email: 'dup@test.com', password: 'Password123',
    })
    expect(res.status).toBe(409)
    expect(res.body.success).toBe(false)
  })

  test('rejects a too-short password (400)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Ali', email: 'short@test.com', password: 'short',
    })
    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/8 characters/i)
  })

  test('rejects an invalid email format (400)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Ali', email: 'not-an-email', password: 'Password123',
    })
    expect(res.status).toBe(400)
  })

  test('ignores a self-assigned admin role (defaults to user)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Sneaky', email: 'sneaky@test.com', password: 'Password123', role: 'admin',
    })
    expect(res.status).toBe(201)
    expect(res.body.user.role).toBe('user')
  })

  test('stores the password as a bcrypt hash, not plaintext', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Ali', email: 'hash@test.com', password: 'Password123',
    })
    const user = await User.findOne({ email: 'hash@test.com' }).select('+password')
    expect(user.password).not.toBe('Password123')
    expect(user.password).toMatch(/^\$2[aby]\$/) // bcrypt signature
  })
})

describe('Authentication — login', () => {
  test('logs in with correct credentials (200)', async () => {
    await makeUser({ email: 'login@test.com', password: 'Password123' })
    const res = await request(app).post('/api/auth/login').send({
      email: 'login@test.com', password: 'Password123',
    })
    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
  })

  test('rejects a wrong password (401)', async () => {
    await makeUser({ email: 'wrong@test.com', password: 'Password123' })
    const res = await request(app).post('/api/auth/login').send({
      email: 'wrong@test.com', password: 'WrongPassword9',
    })
    expect(res.status).toBe(401)
    expect(res.body.message).toMatch(/invalid email or password/i)
  })

  test('uses an identical message for unknown email (no user enumeration)', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'ghost@test.com', password: 'Password123',
    })
    expect(res.status).toBe(401)
    expect(res.body.message).toMatch(/invalid email or password/i)
  })

  test('blocks a deactivated account from logging in (403)', async () => {
    await makeUser({ email: 'dead@test.com', password: 'Password123', isActive: false })
    const res = await request(app).post('/api/auth/login').send({
      email: 'dead@test.com', password: 'Password123',
    })
    expect(res.status).toBe(403)
    expect(res.body.message).toMatch(/deactivated/i)
  })

  test('rejects login with a missing password (400)', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'x@test.com' })
    expect(res.status).toBe(400)
  })
})

describe('Authentication — protected route /me', () => {
  test('returns the current user with a valid token (200)', async () => {
    const { token } = await makeUser({ email: 'me@test.com' })
    const res = await request(app).get('/api/auth/me').set(auth(token))
    expect(res.status).toBe(200)
    expect(res.body.user.email).toBe('me@test.com')
  })

  test('rejects a request with no token (401)', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(401)
  })

  test('rejects a malformed/invalid token (401)', async () => {
    const res = await request(app).get('/api/auth/me').set({ Authorization: 'Bearer not.a.jwt' })
    expect(res.status).toBe(401)
  })
})

describe('Authentication — password reset flow', () => {
  test('forgot-password returns a generic message for an unknown email (no enumeration)', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({ email: 'nobody@test.com' })
    expect(res.status).toBe(200)
    expect(res.body.message).toMatch(/if an account exists/i)
  })

  test('a valid reset token sets a new password; an invalid token is rejected (400)', async () => {
    const { user } = await makeUser({ email: 'reset@test.com', password: 'Password123' })
    // Generate a real reset token the way the model does
    const full = await User.findById(user._id)
    const rawToken = full.createPasswordResetToken()
    await full.save({ validateBeforeSave: false })

    // Wrong token → rejected
    const bad = await request(app).patch('/api/auth/reset-password/wrongtoken').send({ password: 'NewPassword9' })
    expect(bad.status).toBe(400)

    // Correct token → accepted, logs in with the new password
    const ok = await request(app).patch(`/api/auth/reset-password/${rawToken}`).send({ password: 'NewPassword9' })
    expect(ok.status).toBe(200)

    const login = await request(app).post('/api/auth/login').send({ email: 'reset@test.com', password: 'NewPassword9' })
    expect(login.status).toBe(200)
  })

  test('an expired reset token is rejected (400)', async () => {
    const { user } = await makeUser({ email: 'expired@test.com' })
    const full = await User.findById(user._id)
    const rawToken = full.createPasswordResetToken()
    // Force expiry into the past
    full.passwordResetExpires = Date.now() - 1000
    await full.save({ validateBeforeSave: false })

    const res = await request(app).patch(`/api/auth/reset-password/${rawToken}`).send({ password: 'NewPassword9' })
    expect(res.status).toBe(400)
  })
})
