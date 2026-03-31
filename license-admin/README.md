# License Admin

License Admin is a standalone Nuxt app for issuing, managing, and validating license records.

## Default Access

- Email: `admin@pebblesbali.com`
- Password: `admin123`

These defaults can be overridden with environment variables:

- `NUXT_LICENSE_ADMIN_EMAIL`
- `NUXT_LICENSE_ADMIN_PASSWORD`
- `NUXT_LICENSE_SESSION_TTL_HOURS`

## Run Locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
node .output/server/index.mjs
```

## What Works

- Operator login with cookie session
- Protected admin pages
- Plan management
- Create license
- Update license
- Rotate license key
- Suspend or reactivate license
- Delete license
- Public validation endpoint
- Persistent operation log
- PostgreSQL-backed storage via Prisma

## Main Pages

- `/login` — operator sign-in
- `/` — overview dashboard
- `/licenses` — full license CRUD workspace
- `/plans` — plan catalog and default feature management
- `/operations` — validation desk and operation history

## API Endpoints

Authenticated admin endpoints:

- `GET /api/auth/me`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/licenses`
- `POST /api/licenses`
- `GET /api/licenses/:id`
- `PUT /api/licenses/:id`
- `DELETE /api/licenses/:id`
- `GET /api/plans`
- `POST /api/plans`
- `GET /api/plans/:id`
- `PUT /api/plans/:id`
- `DELETE /api/plans/:id`
- `GET /api/operations`
- `GET /api/stats`

Public endpoint:

- `POST /api/validate`

Example validation request:

```json
{
  "licenseKey": "PB-A678-FFB0-02DA",
  "domain": "example.com"
}
```

## Storage

Runtime data now lives in the shared PostgreSQL database defined by `DATABASE_URL` in the repository root.

License Admin uses these Prisma-backed tables:

- `license_plans`
- `licenses`
- `license_operations`
- `license_sessions`

Legacy JSON files in `license-admin/data/` are treated as one-time import sources only. On first run after migration, existing `plans.json`, `licenses.json`, and `operations.json` data is imported into PostgreSQL if the new tables are still empty.