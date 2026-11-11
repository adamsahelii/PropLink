// Test-only environment. No real secrets or services are used:
// MongoDB is in-memory and email is mocked. These values just satisfy
// the code paths that read process.env.
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-jwt-secret-not-used-in-production'
process.env.JWT_EXPIRE = '1h'
process.env.CLIENT_URL = 'http://localhost:5173'
