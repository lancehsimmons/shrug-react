# Shrug React — Music Release Store

## What this project is

A React storefront for Unguent music releases. Displays release cards with metadata, track listings, audio samples, and PayPal checkout. Also includes a blog. Backed by a Node/Express server with a SQLite database.

## Tech stack

- React 19 (`.js` file extensions, not `.jsx`)
- `react-router-dom` v6 for client-side routing (`/` Press, `/blog`, `/info`, `/admin`)
- Node.js + Express server in `server/`
- `better-sqlite3` for synchronous SQLite
- PayPal Orders v2 REST API (sandbox credentials in `server/.env`)
- `@paypal/react-paypal-js` for the frontend PayPal button components
- `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` for R2 signed URLs (installed in `server/`)
- CSS Modules per component

## Project structure

```
shrug-react/
├── server/
│   ├── index.js          — Express app, mounts routes, starts on port 4000
│   ├── db.js             — Opens SQLite DB, creates tables on startup
│   ├── seed.js           — Seeds releases on first run (checks before inserting)
│   ├── paypal.js         — getAccessToken() and BASE_URL for PayPal API calls
│   ├── r2.js             — S3Client pointed at Cloudflare R2 endpoint
│   └── routes/
│       ├── releases.js   — GET /api/releases (public), POST /api/releases (admin); draft/publish workflow
│       ├── orders.js     — GET /api/orders (admin), POST /api/orders
│       ├── capture.js    — POST /api/orders/:orderID/capture; generates R2 signed URL for digital purchases
│       └── posts.js      — GET /api/posts (public), POST /api/posts (admin); draft/publish workflow
├── src/
│   ├── App.js            — BrowserRouter, Routes (/, /blog, /admin), nav in header, PayPalScriptProvider
│   ├── components/
│   │   ├── Releaselist.js  — Fetches all releases from API, renders list
│   │   ├── Release.js      — Individual release card; Side A/B headings only render when non-empty; shows "Tracks" if no Side B
│   │   ├── BuyTapeBtn.js   — PayPal button for physical purchase
│   │   ├── BuyFileBtn.js   — PayPal button for digital purchase; renders signed R2 download link after successful capture
│   │   ├── Blog.js         — Fetches published posts from API, renders list
│   │   ├── BlogPost.js     — Individual post (title, date, images, body, audio)
│   │   ├── BlogPreview.js  — Renders a single post (draft or published) at /blog/preview/:id using admin key
│   │   ├── Info.js         — Static info page at /info; renders a SECTIONS array (Contact, Shipping, Legal) — add entries to add sections
│   │   └── Admin.js        — Admin dashboard at /admin; tabs for Orders / Releases / Posts / Add Release / Add Post
│   ├── utils/
│   │   └── linkify.js      — renderBodyWithLinks(body) parses Markdown-style [text](url) links in post bodies
│   └── assets/
│       └── releases.json   — Legacy data file, no longer used for rendering
└── public/
    └── images/             — Release artwork
```

## Database schema

Three tables: `releases`, `orders`, and `posts` — see `server/db.js` for full schema. JSON array columns (`side_a`, `side_b`, `sample_urls`, `images`, `image_urls`, `audio_urls`) are stored as JSON strings and parsed back into arrays in the API response. `download_url` stores the R2 object key (filename only, e.g. `Release-Name.zip`) — not a full URL. `posts.created_at` is set automatically by SQLite on insert. `posts.status` is `draft` or `published`; only published posts are returned by the public endpoint. `releases.physprice` is nullable — null means the release is digital-only (no physical edition). `releases.status` is `draft` or `published` (default `published`, so existing releases stay live when the column is first added); only published releases are returned by the public endpoint.

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
| GET | `/api/health` | public | Health check — returns `200 ok`; polled by process manager and uptime monitoring |
| GET | `/api/releases` | public | Published releases only, with parsed JSON columns |
| GET | `/api/releases/all` | `x-admin-key` | All releases including drafts |
| POST | `/api/releases` | `x-admin-key` | Add a new release as a draft |
| PUT | `/api/releases/:id` | `x-admin-key` | Update a release's fields (title, artist, date, prices, stock, tracks, notes, urls) — does not change status |
| POST | `/api/releases/:id/publish` | `x-admin-key` | Publish a release |
| POST | `/api/releases/:id/unpublish` | `x-admin-key` | Revert a release to draft |
| GET | `/api/orders` | `x-admin-key` | All orders newest first, joined with release title |
| POST | `/api/orders` | public | Create a PayPal order |
| POST | `/api/orders/:orderID/capture` | public | Capture payment, decrement stock, return signed R2 URL for digital purchases |
| GET | `/api/posts` | public | Published posts only, newest first |
| GET | `/api/posts/all` | `x-admin-key` | All posts including drafts |
| GET | `/api/posts/:id` | `x-admin-key` | Single post by ID (any status) |
| POST | `/api/posts` | `x-admin-key` | Create a draft post (`title`, `body` required; `image_urls`, `audio_urls` optional) |
| PUT | `/api/posts/:id` | `x-admin-key` | Update a post's `title`, `body`, `image_urls`, `audio_urls` (any status) |
| POST | `/api/posts/:id/publish` | `x-admin-key` | Publish a post |
| POST | `/api/posts/:id/unpublish` | `x-admin-key` | Revert a post to draft |

## Environment variables (`server/.env`)

```
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_ENV=sandbox
ADMIN_KEY=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
CORS_ORIGIN=          # production only — comma-separated allowed origins; unset defaults to http://localhost:3000
```

## Key design decisions

- Stock only decrements on a successful capture — never on order creation, and only for `physical` purchases; digital stock is unlimited, so digital captures never touch the `stock` column
- `UPDATE releases SET stock = stock - 1 WHERE id = ? AND stock > 0` is the only true oversell guard, and only runs when `purchase_type === 'physical'`
- `purchase_type` (`physical` or `digital`) is set by the buy button and encoded into PayPal's `custom_id` field at order creation — the capture route reads it back from there
- `Releaselist.js` maps snake_case API fields (`side_a`, `side_b`, `sample_urls`, `download_url`) to camelCase props (`sideA`, `sideB`, `samples`, `downloadUrl`) expected by `Release.js`
- `Release.js` conditionally renders Side A/B headings — omits them when arrays are empty; uses "Tracks" instead of "Side A" when there is no Side B
- A null `physprice` means a release has no physical edition — `Release.js` omits the entire Physical Media block (price, buy button, SOLD OUT state) when `physprice` is null; the Add/Edit Release forms in `Admin.js` allow leaving Physical price and Stock blank (`physprice` is sent as `undefined`, `stock` defaults to `0`) to create one; the admin Releases list shows "Digital only" instead of a stock count for these
- Admin dashboard at `/admin` is not linked in the main nav — navigate there directly; login validates the key against `GET /api/orders`
- `download_url` stores the R2 object key only (e.g. `Release-Name.zip`); the capture route uses it with `R2_BUCKET_NAME` to generate a 1-hour signed URL returned in the capture response
- Signed URLs are generated server-side using `@aws-sdk/s3-request-presigner` with the R2 S3-compatible endpoint — no AWS infrastructure involved
- Blog posts are created as drafts; use the Posts tab in `/admin` to preview and publish
- Releases are created as drafts too; use the Releases tab in `/admin` to publish/unpublish (same toggle pattern as Posts). The public list is always `ORDER BY id DESC`, so publishing a release never changes its position — it shows up where it was originally inserted, not at the front as if newly added
- Post bodies support Markdown-style links (`[text](url)`) — `BlogPost.js` renders them via `renderBodyWithLinks` in `src/utils/linkify.js`; plain body text is otherwise rendered as-is (no other Markdown syntax is supported)
- `Info.js` is static (no database table, not admin-editable) — content lives in a `SECTIONS` array in the component; edit that array directly to change copy or add sections

## Deployment status (as of 2026-07-13)

Working through `/Users/lancesimmons/dev/shrug/DEPLOYMENT_PLAN.md`. Phases 1 (code changes) and 2
(domain) are complete: `shrug.wtf` is registered at Porkbun and delegated to Cloudflare — the `.wtf`
TLD servers return the two Cloudflare nameservers and Cloudflare answers authoritatively for the zone
(Active). Phase 3 (email) is also complete: `info@shrug.wtf` is live on Zoho Mail free tier
(webmail-only; MX/SPF/DKIM in Cloudflare DNS, inbound delivery confirmed), and `Info.js` now shows the
real address. Phase 4 backend is **live at `https://api.shrug.wtf`**: Vultr $5/mo VPS at
`104.238.128.155` (Hetzner ruled out after its June 2026 US price hike) — Ubuntu 26.04, ufw, Node 22,
app at `/opt/shrug/app` under systemd (`shrug-api.service`, service user `shrug`), fresh prod
`ADMIN_KEY` in the server's `.env`, Caddy reverse proxy with auto-renewing Let's Encrypt cert (api DNS
record is deliberately grey-cloud/DNS-only). Deploys: rsync changed files + `systemctl restart
shrug-api`. Frontend is on Cloudflare Pages at `https://shrug-react.pages.dev` (production branch:
`production` — promote via `git push origin main:production`; build env: `REACT_APP_API_URL=
https://api.shrug.wtf`, `CI=false`). Server CORS allows shrug.wtf, www, and the pages.dev origin.
Custom domain `shrug.wtf` (+ www) is attached to the Pages project and confirmed live (2026-07-30:
both resolve to Cloudflare and serve the app). Phase 5 (DNS wiring) is complete. The production
`releases` table already has nullable `physprice` and the `status` column (verified directly against
the VPS schema 2026-07-30) — the migration work described in the old "To do" section below was already
done at some point and didn't need repeating.

Phase 6 (PayPal sandbox shakedown → live flip) is in progress. Frontend PayPal client ID is centralized
in `src/config.js` as `PAYPAL_CLIENT_ID` (`REACT_APP_PAYPAL_CLIENT_ID` env var, sandbox ID as the dev
fallback, set in the Cloudflare Pages production env) — confirmed deployed and picked up correctly.
Sandbox shakedown on the live site (2026-07-30): ran physical and digital purchases against a temporary
$1/$1 test release ("test release", release id 2, created via `/admin`) using a PayPal sandbox buyer
account. Physical capture and stock decrement worked correctly. Digital capture surfaced a real bug:
`POST /api/releases` silently dropped the `download_url` field the Admin form was already sending
(only `PUT` wrote it), so a freshly-created release always started with no download file configured —
a real customer could pay and land on "Payment received but download link failed — please contact us"
(`BuyFileBtn.js`) since `capture.js` charges before attempting to generate the signed URL and has no
guard beforehand. Fixed by wiring `download_url` into the `POST /api/releases` insert
(`server/routes/releases.js`); verified locally, then deployed to the VPS (rsync + `systemctl restart
shrug-api`) and confirmed healthy 2026-07-30.

The "test release" test data (id 2) has been unpublished. The live flip itself is done (2026-07-31):
`PAYPAL_ENV=live` + live PayPal credentials are in place in `/opt/shrug/app/.env` on the VPS, and the
frontend is rebuilt with the live client ID. Two real bugs surfaced during the flip, worth remembering:

- Cloudflare Pages showed `REACT_APP_PAYPAL_CLIENT_ID` as saved under the Production environment, but
  the deployed bundle's injected `process.env` object was still missing that key entirely (confirmed by
  pulling the built JS from `shrug.wtf` and grepping it directly) — the build silently fell back to the
  hardcoded sandbox default in `src/config.js`. Deleting and re-adding the variable from scratch fixed
  it. Also worth knowing: saving an env var in the dashboard does not retrigger a build — an empty
  commit pushed to `production` (`git commit --allow-empty` + `git push origin main:production`) is a
  reliable way to force a fresh one.
- `/proc/<pid>/environ` is *not* useful for checking values `dotenv` loaded — dotenv sets `process.env`
  from inside the already-running Node process, so anything it loads never appears in `/proc/pid/environ`
  (which only reflects the environment the parent process, i.e. systemd, passed at exec time). To verify
  what dotenv actually resolves, run it standalone in the app directory as the service user instead:
  `sudo -u shrug node -e "require('dotenv').config(); console.log(process.env.SOME_VAR)"`.

Verified end-to-end live 2026-07-31: backend creates live orders (`approveLink` on `www.paypal.com`),
frontend loads the live SDK, and the checkout popup resolves on `www.paypal.com` with a real PayPal
login. Still remaining before Phase 6 is fully closed: disable the R2 bucket's public dev URL and set
its CORS policy for `https://shrug.wtf`, then a real one-purchase smoke test + refund (no cheap test
listing is currently published — create one via `/admin` first, since the old `$1/$1` one was
unpublished). Then Phase 7 (backups, uptime monitoring).

## Before deployment

- Set `CORS_ORIGIN` to the production frontend origin(s) — CORS is locked to that list (defaults to `http://localhost:3000` when unset)
- Generate a fresh `ADMIN_KEY` for the production `.env` (`openssl rand -hex 32`) — never reuse the local dev key
- Switch `PAYPAL_ENV` to `live` and update PayPal credentials
- Disable the R2 public development URL on the `shrugfiles` bucket so files are only accessible via signed URLs

## To do

- Complete the remaining Phase 6 steps (refund the live smoke-test purchases and unpublish the test release) and Phase 7 (backups, uptime monitoring) — see Deployment status above
- **Collect shipping address on physical orders** — `orders.js` hardcodes `shipping_preference: 'NO_SHIPPING'` on every PayPal order, so PayPal never asks the buyer for an address regardless of purchase type; discovered during the live smoke test when a physical purchase captured successfully with no shipping address. Fix: set `shipping_preference` to `'GET_FROM_FILE'` for `purchase_type === 'physical'` (keep `'NO_SHIPPING'` for digital) in the order-create call in `server/routes/orders.js`. `capture.js` already reads `order.purchase_units[0].shipping` from PayPal's response and stores it in `orders.shipping_address` — no DB or capture-side changes needed. Server-only change; deploy via rsync + `systemctl restart shrug-api`, no frontend rebuild required.

## Working preferences

- Simple, explicit, incrementally-built solutions
- No abstraction before it's needed
- Complete, concrete code over abstract descriptions
