# NOVIQ Backend

The NOVIQ API provides the storefront catalog, checkout orders, admin authentication, admin CRUD, inventory, reports, analytics, settings, and Cloudinary-backed image uploads.

## Stack

- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- Zod for request/environment validation

## Structure

```text
server/
  src/
    config/       Environment and MongoDB connection
    controllers/  Route handlers
    middleware/   CORS, errors, 404s, validation
    models/       Mongoose schemas
    routes/       /api router modules
    types/        API and model types/constants
    utils/        Shared helpers
    validators/   Reusable Zod schemas
    app.ts        Express app creation
    server.ts     Database connection and HTTP startup
```

## Environment

Create `server/.env` from `server/.env.example`.

```text
NODE_ENV=development
PORT=5010
MONGODB_URI=<your MongoDB connection string>
CLIENT_URL=http://localhost:5173
JWT_SECRET=<random secret at least 32 characters long>
JWT_EXPIRES_IN=7d
AUTH_COOKIE_NAME=noviq_admin_session
```

Required to start the API:

- `MONGODB_URI`
- `JWT_SECRET`
- `CLIENT_URL` when `NODE_ENV=production`

Optional/defaulted:

- `NODE_ENV` defaults to `development`
- `PORT` defaults to `5010`
- `CLIENT_URL` enables the approved frontend origin for CORS and trusted-origin checks
- `JWT_EXPIRES_IN` defaults to `7d`
- `AUTH_COOKIE_NAME` defaults to `noviq_admin_session`

Never commit real `.env` files or credentials.

Production frontend builds also require `VITE_API_BASE_URL` at the project root so the deployed frontend never falls back to a localhost API.

## Production Readiness

- Set `NODE_ENV=production`, serve over HTTPS, and set `CLIENT_URL` to the exact deployed frontend origin.
- In production, Express trusts the first proxy hop so secure cookies and rate-limit IP handling work correctly behind hosts such as Render, Fly, or a reverse proxy.
- Production cookies use `httpOnly`, `secure: true`, and `sameSite: "none"` for cross-site frontend/backend deployments.
- MongoDB `autoIndex` is disabled in production; ensure indexes are created during deployment or migration before relying on new query patterns.
- `/api/health` is safe for health checks. Platform cold starts and database wake-up latency are infrastructure concerns; use an always-on instance, minimum instances, or an external uptime check if first-request latency has a strict SLA.

## Commands

From the project root:

```bash
npm run dev:server
npm run create-admin --prefix server
npm run typecheck:server
npm run build:server
npm run start:server
```

From `server/`:

```bash
npm run dev
npm run create-admin
npm run typecheck
npm run build
npm run start
```

## MongoDB

The server validates environment variables, connects to MongoDB with Mongoose, and only starts Express after a successful database connection. Connection logs redact credentials and show only the safe MongoDB target.

## API

All backend routes are mounted under `/api`.

Health check:

```http
GET /api/health
```

Response:

```json
{
  "success": true,
  "message": "NOVIQ API is running",
  "data": {
    "environment": "development",
    "database": "connected",
    "uptime": 12.34,
    "timestamp": "2026-09-04T00:00:00.000Z"
  }
}
```

Errors follow:

```json
{
  "success": false,
  "message": "Request validation failed",
  "errors": []
}
```

## Admin Auth

Authentication uses a signed JWT stored in an HttpOnly cookie. The frontend sends requests with `credentials: "include"` and does not store tokens in localStorage or sessionStorage.

Cookie behavior:

- `httpOnly: true`
- `sameSite: "lax"` in local/test environments
- `sameSite: "none"` in production
- `secure: false` in local HTTP development/test
- `secure: true` in production
- cookie path: `/api`

Auth endpoints:

```http
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me
```

`POST /api/auth/login` accepts:

```json
{
  "email": "admin@example.test",
  "password": "your-password"
}
```

Successful auth responses return only safe Admin fields:

```json
{
  "success": true,
  "message": "تم تسجيل الدخول بنجاح",
  "data": {
    "admin": {
      "id": "...",
      "email": "admin@example.test",
      "name": "NOVIQ Admin",
      "role": "admin"
    }
  }
}
```

Password hashes, JWTs, secrets, and database credentials are never returned.

Login is rate limited to 20 requests per 15 minutes in development/production. The test environment uses a smaller limit.

## Catalog API

The persistent API contains categories, products, orders, inventory, settings, reports, analytics, and uploads.

Public storefront endpoints:

```http
GET /api/categories
GET /api/categories/:slug
GET /api/products
GET /api/products?category=:slug
GET /api/products/:slug
```

The same read endpoints are also available under `/api/storefront/*` for explicit storefront namespacing.

Admin endpoints require the Prompt 2 HttpOnly admin auth cookie:

````http
GET /api/admin/categories
POST /api/admin/categories
PATCH /api/admin/categories/:id
DELETE /api/admin/categories/:id

GET /api/admin/products
POST /api/admin/products
PATCH /api/admin/products/:id
PATCH /api/admin/products/:id/stock
DELETE /api/admin/products/:id
GET /api/admin/orders

Catalog writes persist to MongoDB. Category deletion is blocked while products are linked to the category, and category slug changes are blocked while products are linked to preserve product/category references. Public product responses never include `costPrice`.

Seed the approved catalog idempotently with:

```bash
npm run seed:catalog --prefix server
````

If Cloudinary is not configured, the upload endpoint returns `503` instead of accepting files silently.

## Create The First Admin

Set one-time bootstrap values in the shell or in ignored `server/.env`, then run:

```bash
npm run create-admin
```

Required bootstrap variables:

```text
ADMIN_BOOTSTRAP_EMAIL=admin@example.test
ADMIN_BOOTSTRAP_PASSWORD=<strong-password>
ADMIN_BOOTSTRAP_NAME=NOVIQ Admin
```

The password must be at least 8 characters and include at least one letter and one number. The script normalizes the email, rejects duplicate emails, hashes the password with bcrypt, creates `role = admin`, and prints only a safe confirmation.

Production note: if the frontend and backend are deployed on different sites, review SameSite/CSRF settings before launch. The current setup is appropriate for local same-site development and the planned same-project admin panel.
