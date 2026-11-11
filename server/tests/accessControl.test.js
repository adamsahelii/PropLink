// Access control, ownership, and inquiry rules (integration).
// These are the "unauthorized access and invalid operations" the supervisor
// asked to see explicitly tested.
jest.mock('../utils/sendEmail', () => jest.fn().mockResolvedValue(true))

const request = require('supertest')
const app = require('../app')
const db = require('./db')
const { makeUser, makeListing, auth } = require('./helpers')

beforeAll(db.connect)
afterEach(db.clear)
afterAll(db.close)

describe('Role-based route protection', () => {
  test('a plain user cannot open the owner "my listings" route (403)', async () => {
    const { token } = await makeUser({ role: 'user' })
    const res = await request(app).get('/api/listings/my').set(auth(token))
    expect(res.status).toBe(403)
  })

  test('a non-admin cannot open the admin pending queue (403)', async () => {
    const { token } = await makeUser({ role: 'owner' })
    const res = await request(app).get('/api/listings/admin/pending').set(auth(token))
    expect(res.status).toBe(403)
  })

  test('a non-admin cannot list users (403)', async () => {
    const { token } = await makeUser({ role: 'owner' })
    const res = await request(app).get('/api/listings/admin/users').set(auth(token))
    expect(res.status).toBe(403)
  })

  test('an unauthenticated request to a protected route is rejected (401)', async () => {
    const res = await request(app).get('/api/listings/my')
    expect(res.status).toBe(401)
  })
})

describe('Ownership checks', () => {
  test('owner A cannot update owner B’s listing (403)', async () => {
    const { user: ownerA } = await makeUser({ role: 'owner' })
    const { token: tokenB } = await makeUser({ role: 'owner' })
    const listing = await makeListing(ownerA._id, { approvalStatus: 'approved' })

    const res = await request(app).put(`/api/listings/${listing._id}`).set(auth(tokenB)).send({ price: 1 })
    expect(res.status).toBe(403)
  })

  test('owner A cannot delete owner B’s listing (403)', async () => {
    const { user: ownerA } = await makeUser({ role: 'owner' })
    const { token: tokenB } = await makeUser({ role: 'owner' })
    const listing = await makeListing(ownerA._id, { approvalStatus: 'approved' })

    const res = await request(app).delete(`/api/listings/${listing._id}`).set(auth(tokenB))
    expect(res.status).toBe(403)
  })

  test('an admin CAN update any listing', async () => {
    const { user: owner } = await makeUser({ role: 'owner' })
    const { token: adminToken } = await makeUser({ role: 'admin' })
    const listing = await makeListing(owner._id, { approvalStatus: 'approved' })

    const res = await request(app).put(`/api/listings/${listing._id}`).set(auth(adminToken)).send({ price: 1234 })
    expect(res.status).toBe(200)
  })
})

describe('Inquiry rules', () => {
  test('a user can inquire about someone else’s approved listing (201)', async () => {
    const { user: owner } = await makeUser({ role: 'owner' })
    const { token: buyerToken } = await makeUser({ role: 'user' })
    const listing = await makeListing(owner._id, { approvalStatus: 'approved' })

    const res = await request(app)
      .post('/api/inquiries').set(auth(buyerToken))
      .send({ listingId: listing._id, message: 'Is this still available?' })
    expect(res.status).toBe(201)
  })

  test('a user CANNOT inquire about their own listing (400)', async () => {
    const { user: owner, token } = await makeUser({ role: 'owner' })
    const listing = await makeListing(owner._id, { approvalStatus: 'approved' })

    const res = await request(app)
      .post('/api/inquiries').set(auth(token))
      .send({ listingId: listing._id, message: 'hi' })
    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/your own listing/i)
  })

  test('inquiring about a non-approved listing fails (404)', async () => {
    const { user: owner } = await makeUser({ role: 'owner' })
    const { token: buyerToken } = await makeUser({ role: 'user' })
    const listing = await makeListing(owner._id, { approvalStatus: 'pending' })

    const res = await request(app)
      .post('/api/inquiries').set(auth(buyerToken))
      .send({ listingId: listing._id, message: 'hi' })
    expect(res.status).toBe(404)
  })

  test('the sender of an inquiry cannot change its status; the owner can', async () => {
    const { user: owner, token: ownerToken } = await makeUser({ role: 'owner' })
    const { token: buyerToken } = await makeUser({ role: 'user' })
    const listing = await makeListing(owner._id, { approvalStatus: 'approved' })

    const created = await request(app)
      .post('/api/inquiries').set(auth(buyerToken))
      .send({ listingId: listing._id, message: 'hi' })
    const inquiryId = created.body.inquiry._id

    const asBuyer = await request(app).patch(`/api/inquiries/${inquiryId}/status`).set(auth(buyerToken)).send({ status: 'closed' })
    expect(asBuyer.status).toBe(403)

    const asOwner = await request(app).patch(`/api/inquiries/${inquiryId}/status`).set(auth(ownerToken)).send({ status: 'responded' })
    expect(asOwner.status).toBe(200)
  })
})

describe('Admin user activation', () => {
  test('a deactivated user can no longer log in (403)', async () => {
    const { user, token: adminToken } = await makeUser({ role: 'user', email: 'target@test.com', password: 'Password123' })
    await makeUser({ role: 'admin', email: 'admin@test.com' }) // separate admin
    // Re-fetch an admin token
    const { token: realAdmin } = await makeUser({ role: 'admin' })

    const deactivate = await request(app)
      .patch(`/api/listings/admin/users/${user._id}/status`).set(auth(realAdmin)).send({ isActive: false })
    expect(deactivate.status).toBe(200)

    const login = await request(app).post('/api/auth/login').send({ email: 'target@test.com', password: 'Password123' })
    expect(login.status).toBe(403)
  })

  test('an admin cannot deactivate another admin (403)', async () => {
    const { user: otherAdmin } = await makeUser({ role: 'admin' })
    const { token: adminToken } = await makeUser({ role: 'admin' })
    const res = await request(app)
      .patch(`/api/listings/admin/users/${otherAdmin._id}/status`).set(auth(adminToken)).send({ isActive: false })
    expect(res.status).toBe(403)
  })

  test('an admin cannot change their own status (400)', async () => {
    const { user: admin, token } = await makeUser({ role: 'admin' })
    const res = await request(app)
      .patch(`/api/listings/admin/users/${admin._id}/status`).set(auth(token)).send({ isActive: false })
    expect(res.status).toBe(400)
  })
})
