// Listing management + approval workflow (integration).
jest.mock('../utils/sendEmail', () => jest.fn().mockResolvedValue(true))

const request = require('supertest')
const app = require('../app')
const Listing = require('../models/Listing')
const db = require('./db')
const { makeUser, makeListing, auth } = require('./helpers')

beforeAll(db.connect)
afterEach(db.clear)
afterAll(db.close)

const validBody = {
  title: 'Sunny 2BR in Achrafieh',
  description: 'Bright apartment near everything.',
  propertyType: 'apartment',
  purpose: 'rent',
  price: 750,
  city: 'Beirut',
}

describe('Listing creation', () => {
  test('an owner can create a listing; it starts pending and hidden (201)', async () => {
    const { token } = await makeUser({ role: 'owner' })
    const res = await request(app).post('/api/listings').set(auth(token)).send(validBody)
    expect(res.status).toBe(201)
    expect(res.body.listing.approvalStatus).toBe('pending')
    // ownerId comes from the token, not the body
    const stored = await Listing.findById(res.body.listing._id)
    expect(stored.approvalStatus).toBe('pending')
  })

  test('a pending listing is NOT shown on the public listings endpoint', async () => {
    const { user, token } = await makeUser({ role: 'owner' })
    await makeListing(user._id, { approvalStatus: 'pending' })
    const res = await request(app).get('/api/listings')
    expect(res.status).toBe(200)
    expect(res.body.listings).toHaveLength(0)
  })

  test('a plain user (role "user") cannot create a listing (403)', async () => {
    const { token } = await makeUser({ role: 'user' })
    const res = await request(app).post('/api/listings').set(auth(token)).send(validBody)
    expect(res.status).toBe(403)
  })

  test('creating a listing requires authentication (401)', async () => {
    const res = await request(app).post('/api/listings').send(validBody)
    expect(res.status).toBe(401)
  })

  test('a listing with an invalid purpose is rejected (400)', async () => {
    const { token } = await makeUser({ role: 'owner' })
    const res = await request(app).post('/api/listings').set(auth(token)).send({ ...validBody, purpose: 'lease' })
    expect(res.status).toBe(400)
  })
})

describe('Admin approval workflow', () => {
  test('after admin approval the listing appears publicly', async () => {
    const { user: owner } = await makeUser({ role: 'owner' })
    const { token: adminToken } = await makeUser({ role: 'admin' })
    const listing = await makeListing(owner._id, { approvalStatus: 'pending' })

    const approve = await request(app).patch(`/api/listings/${listing._id}/approve`).set(auth(adminToken))
    expect(approve.status).toBe(200)

    const publicList = await request(app).get('/api/listings')
    expect(publicList.body.listings).toHaveLength(1)
  })

  test('admin rejection stores the reason and keeps the listing hidden', async () => {
    const { user: owner } = await makeUser({ role: 'owner' })
    const { token: adminToken } = await makeUser({ role: 'admin' })
    const listing = await makeListing(owner._id, { approvalStatus: 'pending' })

    const reject = await request(app)
      .patch(`/api/listings/${listing._id}/reject`)
      .set(auth(adminToken))
      .send({ reason: 'Photos are too low quality.' })
    expect(reject.status).toBe(200)
    expect(reject.body.listing.approvalStatus).toBe('rejected')
    expect(reject.body.listing.rejectionReason).toMatch(/low quality/i)

    const publicList = await request(app).get('/api/listings')
    expect(publicList.body.listings).toHaveLength(0)
  })

  test('a non-admin cannot approve a listing (403)', async () => {
    const { user: owner, token: ownerToken } = await makeUser({ role: 'owner' })
    const listing = await makeListing(owner._id, { approvalStatus: 'pending' })
    const res = await request(app).patch(`/api/listings/${listing._id}/approve`).set(auth(ownerToken))
    expect(res.status).toBe(403)
  })

  test('the admin pending queue lists only pending listings', async () => {
    const { user: owner } = await makeUser({ role: 'owner' })
    const { token: adminToken } = await makeUser({ role: 'admin' })
    await makeListing(owner._id, { approvalStatus: 'pending', title: 'Pending one' })
    await makeListing(owner._id, { approvalStatus: 'approved', title: 'Approved one' })

    const res = await request(app).get('/api/listings/admin/pending').set(auth(adminToken))
    expect(res.status).toBe(200)
    expect(res.body.listings).toHaveLength(1)
    expect(res.body.listings[0].title).toBe('Pending one')
  })
})

describe('Editing and deleting', () => {
  test('an owner editing an approved listing sends it back to pending', async () => {
    const { user: owner, token } = await makeUser({ role: 'owner' })
    const listing = await makeListing(owner._id, { approvalStatus: 'approved' })

    const res = await request(app).put(`/api/listings/${listing._id}`).set(auth(token)).send({ price: 999 })
    expect(res.status).toBe(200)
    expect(res.body.listing.approvalStatus).toBe('pending')
  })

  test('deleting a listing is a soft delete — it disappears from public results', async () => {
    const { user: owner, token } = await makeUser({ role: 'owner' })
    const listing = await makeListing(owner._id, { approvalStatus: 'approved' })

    const del = await request(app).delete(`/api/listings/${listing._id}`).set(auth(token))
    expect(del.status).toBe(200)

    const stored = await Listing.findById(listing._id)
    expect(stored.isDeleted).toBe(true) // document preserved, just hidden

    const publicList = await request(app).get('/api/listings')
    expect(publicList.body.listings).toHaveLength(0)
  })

  test('an owner cannot self-approve through the edit body (mass-assignment guard)', async () => {
    const { user: owner, token } = await makeUser({ role: 'owner' })
    const listing = await makeListing(owner._id, { approvalStatus: 'pending' })

    const res = await request(app)
      .put(`/api/listings/${listing._id}`)
      .set(auth(token))
      .send({ approvalStatus: 'approved', price: 500 })
    expect(res.status).toBe(200)
    // The crafted approvalStatus must be ignored; an owner edit stays pending
    expect(res.body.listing.approvalStatus).toBe('pending')
  })
})
