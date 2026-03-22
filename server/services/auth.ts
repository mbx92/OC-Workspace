import { db } from '../db/client'
import { users, sessions } from '../db/schema'
import { eq, and, gt } from 'drizzle-orm'
import bcryptjs from 'bcryptjs'
import { randomUUID } from 'crypto'

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export async function login(email: string, password: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  if (!user || !user.isActive) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  const valid = await bcryptjs.compare(password, user.passwordHash)
  if (!valid) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  const token = randomUUID()
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)

  await db.insert(sessions).values({
    userId: user.id,
    token,
    expiresAt,
  })

  await logActivity({
    userId: user.id,
    entityType: 'user',
    entityId: user.id,
    action: 'login',
    description: `User ${user.email} logged in`,
  })

  return {
    token,
    expiresAt,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  }
}

export async function bootstrap(email: string, password: string, name: string) {
  const existing = await db.select({ id: users.id }).from(users).limit(1)
  if (existing.length > 0) {
    throw createError({ statusCode: 400, statusMessage: 'System already bootstrapped' })
  }

  const passwordHash = await bcryptjs.hash(password, 12)

  const [user] = await db
    .insert(users)
    .values({
      email,
      passwordHash,
      name,
      role: 'owner',
      isActive: true,
      joinDate: new Date(),
    })
    .returning()

  const token = randomUUID()
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)

  await db.insert(sessions).values({
    userId: user.id,
    token,
    expiresAt,
  })

  await logActivity({
    userId: user.id,
    entityType: 'user',
    entityId: user.id,
    action: 'bootstrap',
    description: `Owner ${email} bootstrapped the system`,
  })

  return {
    token,
    expiresAt,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  }
}

export async function logout(token: string) {
  await db.delete(sessions).where(eq(sessions.token, token))
}

export async function getSession(token: string) {
  const result = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      isActive: users.isActive,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.token, token),
        gt(sessions.expiresAt, new Date()),
      ),
    )
    .limit(1)

  if (!result.length || !result[0].isActive) return null
  return result[0]
}
