import type { H3Event } from 'h3'
import { db } from '../db/client'
import { sessions, users } from '../db/schema'
import { eq, and, gt } from 'drizzle-orm'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
  isActive: boolean
}

export async function requireAuth(event: H3Event): Promise<AuthUser> {
  const token = getCookie(event, 'session_token')
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const result = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      isActive: users.isActive,
      sessionExpires: sessions.expiresAt,
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

  if (!result.length || !result[0].isActive) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  return {
    id: result[0].id,
    email: result[0].email,
    name: result[0].name,
    role: result[0].role,
    isActive: result[0].isActive,
  }
}

const roleHierarchy: Record<string, number> = {
  owner: 100,
  admin: 90,
  project_manager: 70,
  finance: 60,
  developer: 40,
  designer: 40,
  qa: 40,
}

export function requireRole(user: AuthUser, ...allowedRoles: string[]) {
  if (!allowedRoles.includes(user.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }
}

export function requireMinRole(user: AuthUser, minRole: string) {
  const userLevel = roleHierarchy[user.role] ?? 0
  const requiredLevel = roleHierarchy[minRole] ?? 0
  if (userLevel < requiredLevel) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }
}
