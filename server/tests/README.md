# PropLink — Automated Test Suite

Automated unit and integration tests for the PropLink backend, covering
authentication, listing management, the approval workflow, access control,
and inquiry rules. Written with **Jest** and **Supertest**.

## What is covered

| File | Type | Area |
| --- | --- | --- |
| `tests/unit.test.js` | Unit | Input validation, mass-assignment guard, image/location sanitisation, JWT, error class |
| `tests/auth.test.js` | Integration | Register, login, `/me`, password reset, deactivation |
| `tests/listings.test.js` | Integration | Create (pending/hidden), admin approve/reject, edit→pending, soft delete |
| `tests/accessControl.test.js` | Integration | Role protection, ownership checks, inquiry rules, admin activation |

Negative cases (unauthorized access, wrong role, ownership violations,
invalid input, self-inquiry, self-approval) are tested explicitly.

## How to run

The integration tests need a MongoDB to talk to. Two options:

**A. In-memory MongoDB (no setup, default).**
`jest` uses `mongodb-memory-server`, which downloads a MongoDB binary on
first run. Requires internet access to `fastdl.mongodb.org`.

```bash
cd server
npm install
npm test
```

**B. Point at an existing database (local mongod or a scratch Atlas DB).**
Set `MONGO_TEST_URI` to a throwaway database — the suite wipes data
between tests, so never point it at production.

```bash
cd server
MONGO_TEST_URI="mongodb+srv://user:pass@cluster/proplink_test" npm test
```

Unit tests need no database:

```bash
npm run test:unit
```

Coverage report:

```bash
npm run test:coverage
```
