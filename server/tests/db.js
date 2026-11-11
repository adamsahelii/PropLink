const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

let mongo

// Connect to a test database. If MONGO_TEST_URI is set (e.g. a scratch
// Atlas database or a local mongod), use it; otherwise spin up an
// isolated in-memory MongoDB. Either way the data is wiped between tests,
// so a provided URI must point at a throwaway database, never production.
const connect = async () => {
  if (process.env.MONGO_TEST_URI) {
    await mongoose.connect(process.env.MONGO_TEST_URI)
    return
  }
  mongo = await MongoMemoryServer.create()
  await mongoose.connect(mongo.getUri())
}

// Remove all documents between tests so each case starts clean.
const clear = async () => {
  const { collections } = mongoose.connection
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({})
  }
}

// Tear everything down so Jest can exit cleanly.
const close = async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
  if (mongo) await mongo.stop()
}

module.exports = { connect, clear, close }
