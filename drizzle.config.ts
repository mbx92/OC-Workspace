import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

const rawDatabaseUrl = process.env.DATABASE_URL

if (!rawDatabaseUrl) {
  throw new Error('DATABASE_URL is required for Drizzle migrations')
}

const normalizedDatabaseUrl = (() => {
  const url = new URL(rawDatabaseUrl)
  url.searchParams.delete('schema')
  return url.toString()
})()

export default defineConfig({
  schema: './server/db/schema/index.ts',
  out: './server/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: normalizedDatabaseUrl,
  },
})
