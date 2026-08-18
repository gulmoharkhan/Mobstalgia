# Mobstalgia

A storefront + admin portal for selling handcrafted (and printed) art made from
torn-down phones. Built as a **single, dependency-free Node.js app** — no
`npm install` required to run it, no framework, no build step.

- **Storefront** (`/`, `/shop`, `/piece/:id`, `/cart`, `/checkout`, `/track`, `/feedback`, `/about`)
  — browse pieces, filter by brand/type, add to cart, check out as a guest, track an order, leave feedback.
- **Admin portal** (`/admin`) — add/edit/delete frames with multiple images, manage pricing and stock,
  view and update orders, read customer feedback, change your password.

Why no framework? This environment couldn't reach the npm registry, so
everything here runs on Node's own built-ins: the `http` module for the
server, and Node 22's native `node:sqlite` for the database. That turns out to
be a feature, not a compromise — it means **anyone with Node 22+ can run this
with zero setup**, and it's trivial to deploy anywhere that runs Node.

## Requirements

- **Node.js 22.5 or newer** (uses the native `node:sqlite` module). Node 22 LTS is recommended.
- Check your version: `node -v`

## Running it

```bash
npm start
# or directly:
node --experimental-sqlite server.js
```

Then open **http://localhost:3000**.

On first run it creates `data/store.sqlite`, seeds it with 8 sample pieces
(placeholder art — swap for real photos), and creates your admin account.

### Admin login

- URL: **http://localhost:3000/admin/login**
- Email: `gulmohar.khan@gmail.com`
- Password: `teardown-admin-2026`

**Change this password immediately** via **Admin → Settings** — it's a known
default sitting in `src/config.js`.

## How the shop works today

- **Cart** lives in the browser (`localStorage`) — no accounts needed to buy.
- **Checkout** collects shipping details and creates an order, but **does not
  process payment yet**. The order is created with `payment_status: unpaid`
  and the checkout page tells the customer you'll follow up to arrange
  payment (UPI / bank transfer / cash on delivery — whatever you prefer).
- You confirm payment manually in **Admin → Orders**, flipping the order to
  `paid` and moving its status through confirmed → shipped → delivered.
- Placing an order automatically decrements stock and marks a piece `sold`
  once stock hits zero — handcrafted one-offs (stock = 1) go straight to sold.

### Adding real payments later

When you're ready to take real payments, the natural next step is to wire a
payment gateway into `POST /api/orders` (`src/handlers/api.js` →
`src/models.js#createOrder`). Popular choices for India: **Razorpay** or
**Cashfree** (UPI-native); **Stripe** also works well if you want
international cards. The flow would become: create the order as `unpaid` →
redirect to the gateway's checkout → on webhook confirmation, mark it `paid`.
This app deliberately keeps `createOrder` and the checkout page simple so
that swap is a contained change.

## Customizing

- **Site name, tagline, currency, payment note, admin defaults** — all in `src/config.js`.
- **Colors, spacing, layout** — `public/styles.css` (plain CSS, no build step).
- **Sample catalog** — `src/seed.js` (only runs once, when the database is empty).
- Currency is stored as **paise** (smallest INR unit) in the database, matching
  how payment gateways expect amounts. `formatCurrency()` in `src/utils.js`
  is the one place that renders it — change it there if you want a different currency.

## Project structure

```
server.js                 # HTTP server + routing table (entry point)
src/
  config.js                # site name, currency, admin defaults, payment note
  db.js                     # node:sqlite connection + schema
  auth.js                   # password hashing (scrypt) + sessions
  models.js                 # all database queries (frames, orders, feedback)
  images.js                 # saves base64-uploaded images to public/uploads
  router.js                 # tiny hand-rolled router
  utils.js                  # body parsing, currency formatting, helpers
  seed.js                   # first-run sample data
  handlers/
    public.js                # storefront page handlers
    api.js                   # JSON endpoints (cart pricing, order creation, feedback)
    admin.js                 # admin auth + all admin CRUD handlers
  views/                    # server-rendered HTML (template functions, no JSX/build step)
public/
  styles.css                # all styling
  js/                        # small vanilla-JS files (cart, checkout, admin image upload)
  img/seed/                  # generated placeholder art for the sample catalog
  uploads/                   # your uploaded photos land here at runtime
data/
  store.sqlite               # the database (created automatically)
```

## Deploying

This is a normal long-running Node process with a local SQLite file and local
image uploads — so it fits best on a host that gives you **a persistent
process + persistent disk**, not a serverless platform like Vercel (whose
functions are stateless and would lose your database and uploaded images on
every deploy).

Good fits: **Render** (Web Service + a small persistent Disk), **Railway**,
**Fly.io**, or any basic VPS (DigitalOcean, Hetzner, etc.).

### Deploying to Render (recommended path, no terminal required)

This repo includes a `render.yaml` **Blueprint**, so Render can configure
almost everything automatically — persistent disk included, mounted outside
the app folder via `DATA_DIR`/`UPLOADS_DIR` env vars so your catalog and
photos survive every redeploy.

1. **Get the code onto GitHub** (Render deploys from a git repo):
   - Create a free account at github.com if you don't have one.
   - Click **New repository**, give it a name (e.g. `mobstalgia`), keep it Public, create it.
   - On the new repo's page, click **Add file → Upload files**, then drag in
     every file/folder from the unzipped project (everything from this zip
     except the `data/` and `public/uploads/` contents, which don't need to
     be uploaded — they're regenerated automatically). Commit.
2. **Deploy on Render**:
   - Create a free account at render.com and connect your GitHub account when prompted.
   - Click **New → Blueprint**, pick the repo you just created. Render will read `render.yaml` and pre-fill the service, start command, env vars, and disk for you.
   - Click **Apply** / **Create**. First deploy takes a couple of minutes.
3. Once it's live, open the URL Render gives you, log into `/admin/settings`, and change the default password immediately.

If you'd rather not use the Blueprint, you can configure a Web Service by
hand — same idea: start command `node --experimental-sqlite server.js`, a
Disk mounted at `/var/data`, env vars `DATA_DIR=/var/data/db`,
`UPLOADS_DIR=/var/data/uploads`, `NODE_ENV=production`, Node version 22.x.

If you outgrow SQLite + local disk (multiple servers, need real backups,
etc.), the natural upgrade path is Postgres for the database and S3 (or
Cloudinary) for images — `src/db.js` and `src/images.js` are the only two
files that would need to change.

## A note on the sample catalog

The 8 seeded pieces use generated abstract "circuit board" placeholder art,
not real photos — good enough to see the site working end to end. Replace
them with real teardown photos via **Admin → Frames → Edit** (or delete and
re-add). The generator that made the placeholders (`scripts/generate-seed-images.mjs`)
needs the `sharp` package, which is **not** a runtime dependency of the app —
you only need it if you want to regenerate placeholder art, and you'd need to
run `npm install sharp` first.
