# Shrug React — Music Release Store

## What this project is

A React storefront for Unguent music releases. Displays release cards with metadata, track listings, audio samples, and PayPal checkout. Also includes a blog. Backed by a Node/Express server with a SQLite database.

## Tech stack

- React 19 (`.js` file extensions, not `.jsx`)
- `react-router-dom` v6 for client-side routing (`/` Press, `/blog`, `/admin`)
- Node.js + Express server in `server/`
- `better-sqlite3` for synchronous SQLite
- PayPal Orders v2 REST API (sandbox credentials in `server/.env`)
- `@paypal/react-paypal-js` for the frontend PayPal button components
- CSS Modules per component

## Project structure

```
shrug-react/
├── server/
│   ├── index.js          — Express app, mounts routes, starts on port 4000
│   ├── db.js             — Opens SQLite DB, creates tables on startup
│   ├── seed.js           — Seeds releases on first run (checks before inserting)
│   ├── paypal.js         — getAccessToken() and BASE_URL for PayPal API calls
│   └── routes/
│       ├── releases.js   — GET /api/releases (public), POST /api/releases (admin)
│       ├── orders.js     — GET /api/orders (admin), POST /api/orders
│       ├── capture.js    — POST /api/orders/:orderID/capture
│       └── posts.js      — GET /api/posts (public), POST /api/posts (admin)
├── src/
│   ├── App.js            — BrowserRouter, Routes (/, /blog, /admin), nav in header, PayPalScriptProvider
│   ├── components/
│   │   ├── Releaselist.js  — Fetches all releases from API, renders list
│   │   ├── Release.js      — Individual release card; Side A/B headings only render when non-empty; shows "Tracks" if no Side B
│   │   ├── BuyTapeBtn.js   — PayPal button for physical purchase
│   │   ├── BuyFileBtn.js   — PayPal button for digital purchase; renders a zip download link after successful capture
│   │   ├── Blog.js         — Fetches all posts from API, renders list
│   │   ├── BlogPost.js     — Individual post (title, date, images, body, audio)
│   │   └── Admin.js        — Admin dashboard at /admin; login gate (key in localStorage), tabs for Orders / Add Release / Add Post
│   └── assets/
│       └── releases.json   — Legacy data file, no longer used for rendering
└── public/
    └── images/             — Release artwork
```

## Database schema

Three tables: `releases`, `orders`, and `posts` — see `server/db.js` for full schema. JSON array columns (`side_a`, `side_b`, `sample_urls`, `images`, `image_urls`, `audio_urls`) are stored as JSON strings and parsed back into arrays in the API response. `download_url` is a plain string (a zip file URL), not a JSON array. `posts.created_at` is set automatically by SQLite on insert.

## Running the project

```bash
# Terminal 1 — backend
cd server && node index.js

# Terminal 2 — frontend
npm start
```

Server runs on port 4000. React dev server proxies to it.

## API endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/releases` | public | All releases with parsed JSON columns |
| POST | `/api/releases` | `x-admin-key` | Add a new release |
| GET | `/api/orders` | `x-admin-key` | All orders newest first, joined with release title |
| POST | `/api/orders` | public | Create a PayPal order |
| POST | `/api/orders/:orderID/capture` | public | Capture payment, decrement stock |
| GET | `/api/posts` | public | All posts, newest first |
| POST | `/api/posts` | `x-admin-key` | Add a new post (`title`, `body` required; `image_urls`, `audio_urls` optional arrays) |

## Environment variables (`server/.env`)

```
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_ENV=sandbox
ADMIN_KEY=
```

## Key design decisions

- Stock only decrements on a successful capture — never on order creation
- `UPDATE releases SET stock = stock - 1 WHERE id = ? AND stock > 0` is the only true oversell guard
- `purchase_type` (`physical` or `digital`) is set by the buy button and encoded into PayPal's `custom_id` field at order creation — the capture route reads it back from there
- `Releaselist.js` maps snake_case API fields (`side_a`, `side_b`, `sample_urls`, `download_url`) to camelCase props (`sideA`, `sideB`, `samples`, `downloadUrl`) expected by `Release.js`
- `Release.js` conditionally renders Side A/B headings — omits them when arrays are empty; uses "Tracks" instead of "Side A" when there is no Side B
- Admin dashboard at `/admin` is not linked in the main nav — navigate there directly; login validates the key against `GET /api/orders`

## Before deployment

- Remove "soiled top spin" from `server/seed.js` — only the Unguent "Structured Water" release should be live
- Switch `PAYPAL_ENV` to `live` and update credentials
- Digital file delivery uses a single zip file URL stored in `download_url` — shown as a download link after a successful capture. Signed URLs are not yet implemented; the link is publicly accessible.

## Working preferences

- Simple, explicit, incrementally-built solutions
- No abstraction before it's needed
- Complete, concrete code over abstract descriptions
