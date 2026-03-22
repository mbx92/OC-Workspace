import { db } from '../db/client'
import { users } from '../db/schema'
import { eq, desc } from 'drizzle-orm'
import bcryptjs from 'bcryptjs'

export async function listUsers() {
  return db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      isActive: users.isActive,
      joinDate: users.joinDate,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
}

export async function getUser(id: string) {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      isActive: users.isActive,
      joinDate: users.joinDate,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1)

  if (!user) throw createError({ statusCode: 404, statusMessage: 'User not found' })
  return user
}

export async function createUser(
  data: { email: string; password: string; name: string; role?: string },
  actorId: string,
) {
  const passwordHash = await bcryptjs.hash(data.password, 12)

  const [user] = await db
    .insert(users)
    .values({
      email: data.email,
      passwordHash,
      name: data.name,
      role: (data.role as any) ?? 'developer',
      isActive: true,
      joinDate: new Date(),
    })
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      isActive: users.isActive,
    })

  await logActivity({
    userId: actorId,
    entityType: 'user',
    entityId: user.id,
    action: 'created',
    description: `User ${user.email} created`,
    after: user,
  })

  return user
}

export async function updateUser(
  id: string,
  data: { name?: string; role?: string; isActive?: boolean },
  actorId: string,
) {
  const before = await getUser(id)

  const [updated] = await db
    .update(users)
    .set({ ...data, role: data.role as any, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      isActive: users.isActive,
    })

  await logActivity({
    userId: actorId,
    entityType: 'user',
    entityId: id,
    action: 'updated',
    description: `User ${updated.email} updated`,
    before,
    after: updated,
  })

  return updated
}

export async function resetUserPassword(id: string, newPassword: string, actorId: string) {
  const passwordHash = await bcryptjs.hash(newPassword, 12)

  await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, id))

  await logActivity({
    userId: actorId,
    entityType: 'user',
    entityId: id,
    action: 'password_reset',
    description: `Password reset for user`,
  })
}
