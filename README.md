# PropLink

A real-estate marketplace web platform for Lebanon with listing management,
AI-assisted search, and buyer–owner communication. Visitors can browse and
filter listings, explore an interactive city map, and describe what they want
in a plain sentence; registered users can save favourites, compare listings,
and send inquiries; owners can publish listings and track analytics; and admins
review every listing before it goes public.

Built as a Lebanese American University capstone project (CSC 599).

- **Live demo (client):** https://prop-link-pi.vercel.app
- **Repository:** https://github.com/adamsahelii/PropLink

## Features

- Browse, filter (city, type, purpose, price), sort, and page through approved listings
- **AI-assisted search** – turns a plain sentence into structured filters (Groq LLM)
- Interactive Lebanon map with per-city listing counts (Leaflet)
- Accounts for users and owners, with email/password auth and password reset by email
- Favourites and side-by-side comparison (up to four listings)
- Inquiries with an owner inbox and status workflow
- Owner listing management with photo upload and per-listing analytics (views, inquiries, favourites)
- Admin approval queue and user activation/deactivation

## Tech stack

| Layer | Technologies |
|-------|--------------|
| Front end | React 18, Vite, Tailwind CSS, React Router, Framer Motion, Leaflet / React-Leaflet, Axios |
| Back end | Node.js, Express 5, Mongoose, JSON Web Tokens, bcryptjs, Multer, Nodemailer, express-rate-limit |
| Database | MongoDB (Atlas) |
| External services | Groq API (AI search), Gmail SMTP (emails), Cloudinary (optional image endpoint) |
| Hosting | Vercel (client), Render (server), MongoDB Atlas (database) |

## Architecture

Three-tier client–server. The React client talks to an Express REST API over
JSON; the server verifies the JWT, the user role, and the input, then reads or
writes MongoDB through Mongoose. The server follows a layered MVC-style
structure: routes → controllers → models, with middleware for authentication,
role checks, validation, uploads, rate limiting, and error handling.

Listing images submitted through the Add Residence form are stored in MongoDB
as base64 data URIs. A separate Cloudinary-backed upload endpoint
(`POST /api/uploads/listing-images`) is also available for hosting images
externally when Cloudinary credentials are configured.

## Project structure

```
PropLink/
├── client/                 # React + Vite front end
│   └── src/
│       ├── pages/          # Home, Listings, Property Detail, Compare, owner & admin pages
│       ├── components/     # Navbar, PropertyCard, LebanonMap, AiSearchBar, owner form, …
│       └── context, hooks, utils
└── server/                 # Express REST API
    ├── app.js              # Express app (middleware, CORS, routes) — imported by tests
    ├── server.js           # Connects to MongoDB and starts the server
    ├── routes/             # One router per module
    ├── controllers/        # Request handling and business logic
    ├── models/             # Mongoose schemas (User, Listing, Favorite, Inquiry, Analytics, ContactMessage)
    ├── middleware/         # auth, validate, upload, rateLimit, errorHandler
    ├── utils/              # jwt, sendEmail, queryHelper, listingFields, …
    └── tests/              # Jest + Supertest suite (see Testing)
```

## Getting started

### Prerequisites

- Node.js 18+ and npm
- A MongoDB database (local `mongod` or a MongoDB Atlas cluster)
- A Groq API key (for AI search) and a Gmail account with an App Password (for emails)

### 1. Clone and install

```bash
git clone https://github.com/adamsahelii/PropLink.git
cd PropLink

# Back end
cd server
npm install

# Front end
cd ../client
npm install
```

### 2. Configure environment variables

Create `server/.env` (see `server/.env.example`):

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | no | Server port (default `5000`) |
| `MONGO_URI` | yes | MongoDB connection string |
| `JWT_SECRET` | yes | Secret used to sign login tokens |
| `JWT_EXPIRE` | no | Token lifetime (default `7d`) |
| `GROQ_API_KEY` | yes* | Groq API key for AI search (*search degrades to empty filters without it) |
| `EMAIL_USER` / `EMAIL_PASS` | yes* | Gmail address + App Password for outgoing email (*password reset / contact) |
| `EMAIL_TO` | no | Inbox that receives contact-form messages |
| `CLIENT_URL` | no | Client base URL used in email links (default `http://localhost:5173`) |
| `CORS_ORIGINS` | no | Comma-separated list of allowed browser origins (defaults to `CLIENT_URL`) |
| `AUTH_RATE_MAX` | no | Max auth requests per 15 min per IP (default `20`) |
| `AI_RATE_MAX` | no | Max AI-search requests per minute per IP (default `30`) |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | no | Only for the Cloudinary image-upload endpoint |

Create `client/.env` (see `client/.env.example`):

```
VITE_API_URL=http://localhost:5000/api
```

### 3. Run

```bash
# Terminal 1 — back end
cd server
npm run dev        # nodemon, or: npm start

# Terminal 2 — front end
cd client
npm run dev        # Vite dev server on http://localhost:5173
```

## Testing

The back end has an automated **Jest + Supertest** suite covering authentication,
listing management, the approval workflow, access control, and security
(CORS + rate limiting). Integration tests run against an in-memory MongoDB, so
no database or secrets are required.

```bash
cd server
npm test                 # run the full suite
npm run test:unit        # unit tests only (no database)
npm run test:coverage    # with a coverage report
```

An AI-search evaluation harness scores the smart search against a set of
representative queries (needs `GROQ_API_KEY` in `server/.env`):

```bash
node tests/smartSearch.eval.js
```

## Security

- Passwords hashed with bcrypt (12 rounds); never returned in responses
- JWT auth with role and ownership checks on protected routes
- Input validation and an allow-list that prevents mass assignment
- Rate limiting on login, password-reset, and AI-search routes
- CORS restricted to configured trusted origins (`CORS_ORIGINS`)
- Admin review of every new or edited listing
- Secrets kept in environment variables (never committed)

## Deployment

- **Client:** Vercel (build command `npm run build`, output `dist/`). Set `VITE_API_URL` to the deployed API URL.
- **Server:** Render. Set all required environment variables, and set `CORS_ORIGINS` to the deployed client URL (e.g. `https://prop-link-pi.vercel.app`) so the browser client is allowed.
- **Database:** MongoDB Atlas.

## Authors

- Adam el Saheli
- Ali Khalifeh

Supervised by Dr. Ibrahim El Bitar — Department of Computer Science and
Mathematics, Lebanese American University.
