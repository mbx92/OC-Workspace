import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import bcryptjs from 'bcryptjs'
import * as schema from './schema'

async function seed() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  const db = drizzle(pool, { schema })

  const email = process.env.AUTH_EMAIL ?? 'admin@ocdev.com'
  const password = process.env.AUTH_PASSWORD ?? 'admin123'
  const name = 'Owner'

  // Check if owner already exists
  const existing = await db.select({ id: schema.users.id }).from(schema.users).limit(1)
  if (existing.length > 0) {
    console.log('⚠ Database already has users — skipping seed.')
    await pool.end()
    return
  }

  const passwordHash = await bcryptjs.hash(password, 12)

  const [owner] = await db
    .insert(schema.users)
    .values({
      email,
      passwordHash,
      name,
      role: 'owner',
      isActive: true,
      joinDate: new Date(),
    })
    .returning()

  console.log(`✓ Owner account created: ${owner.email} (role: ${owner.role})`)
  await pool.end()
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
