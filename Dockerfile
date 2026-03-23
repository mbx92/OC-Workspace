# ── Stage 1: install deps ──────────────────────────────────────────────────────
FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci

# ── Stage 2: build ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ── Stage 3: runner ────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

# Need postgresql-client for pg_isready health-check fallback
RUN apk add --no-cache postgresql-client

# Copy all node_modules (devDeps included — drizzle-kit + tsx needed at runtime
# for migrations and seeding)
COPY --from=deps /app/node_modules ./node_modules

# Nuxt build output
COPY --from=builder /app/.output ./.output

# Files needed by drizzle-kit migrate at runtime
COPY drizzle.config.ts ./
COPY server/db ./server/db

# Entrypoint
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

COPY package.json ./

# Nitro listens on 0.0.0.0 inside the container
ENV HOST=0.0.0.0
ENV NODE_ENV=production

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
